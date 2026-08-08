use anyhow::{anyhow, Result};
use gimli::{DebugLine, RunTimeEndian};
use object::{Object, ObjectSection};
use std::collections::BTreeMap;
use std::fmt;

/// Represents a source code location mapped from SBF Program Counter (PC).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SourceLocation {
    pub file_path: String,
    pub line: u64,
    pub column: u64,
}

impl fmt::Display for SourceLocation {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}:{}:{}", self.file_path, self.line, self.column)
    }
}

/// Mapper that parses DWARF `.debug_line` section from SBF ELF files and looks up source lines for PC offsets.
pub struct DwarfLineMapper {
    /// Maps Program Counter (PC) byte offset -> SourceLocation
    pc_to_location: BTreeMap<u64, SourceLocation>,
}

impl DwarfLineMapper {
    /// Create a new empty line mapper.
    pub fn new() -> Self {
        Self {
            pc_to_location: BTreeMap::new(),
        }
    }

    /// Parse DWARF debug info from SBF ELF binary data.
    pub fn parse_elf(elf_data: &[u8]) -> Result<Self> {
        if elf_data.is_empty() {
            return Ok(Self::new());
        }

        let obj_file = object::File::parse(elf_data)
            .map_err(|e| anyhow!("Failed to parse ELF file for DWARF debug info: {}", e))?;

        let mut pc_to_location = BTreeMap::new();

        if let Some(section) = obj_file.section_by_name(".debug_line") {
            let data = section.data().unwrap_or(&[]);
            let endian = if obj_file.is_little_endian() {
                RunTimeEndian::Little
            } else {
                RunTimeEndian::Big
            };

            let debug_line = DebugLine::new(data, endian);
            let mut offset = gimli::DebugLineOffset(0);

            while offset.0 < data.len() {
                let unit = match debug_line.program(offset, 8, None, None) {
                    Ok(u) => u,
                    Err(_) => break,
                };

                let header = unit.header();
                let next_offset = offset.0 + header.unit_length() as usize + 4;
                let mut rows = unit.rows();

                while let Ok(Some((_, row))) = rows.next_row() {
                    if let Some(line) = row.line() {
                        let column_val = match row.column() {
                            gimli::ColumnType::Column(c) => c.get(),
                            gimli::ColumnType::LeftEdge => 1,
                        };

                        pc_to_location.insert(
                            row.address(),
                            SourceLocation {
                                file_path: "src/processor.rs".to_string(),
                                line: line.get(),
                                column: column_val,
                            },
                        );
                    }
                }
                offset.0 = next_offset;
            }
        }

        Ok(Self { pc_to_location })
    }

    /// Insert a manual PC -> SourceLocation mapping entry.
    pub fn insert(&mut self, pc_byte_offset: u64, location: SourceLocation) {
        self.pc_to_location.insert(pc_byte_offset, location);
    }

    /// Lookup source code location for a given SBF Program Counter (PC / byte offset).
    pub fn lookup_pc(&self, pc_byte_offset: u64) -> Option<&SourceLocation> {
        self.pc_to_location
            .range(..=pc_byte_offset)
            .next_back()
            .map(|(_, loc)| loc)
    }

    /// Returns the total number of mapped PC addresses in the DWARF line table.
    pub fn mappings_count(&self) -> usize {
        self.pc_to_location.len()
    }
}

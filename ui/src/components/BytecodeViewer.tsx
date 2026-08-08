import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Filter,
  Code2,
  ScrollText,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Loader2,
  ChevronDown,
  ChevronUp,
  Cpu,
  FileCode,
} from 'lucide-react';
import type { ChunkData } from '../App';

interface BytecodeViewerProps {
  bytecodeText: string;
  chunkData?: ChunkData | null;
  onPreviousChunk?: () => void;
  onNextChunk?: () => void;
  onJumpToPage?: (page: number) => void;
  onChangeChunkSize?: (size: number) => void;
  isNavigatingChunk?: boolean;
  onClear?: () => void;
}

export const BytecodeViewer: React.FC<BytecodeViewerProps> = ({
  bytecodeText,
  chunkData,
  onPreviousChunk,
  onNextChunk,
  onJumpToPage,
  onChangeChunkSize,
  isNavigatingChunk,
  onClear,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [showLogs, setShowLogs] = useState(true);

  if (!bytecodeText && !chunkData) {
    return (
      <div className="glass-panel p-12 rounded-2xl text-center border border-dashed border-solana-border">
        <Code2 className="w-12 h-12 text-solana-muted mx-auto mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-white mb-2">No Bytecode Analyzed Yet</h3>
        <p className="text-sm text-solana-muted max-w-md mx-auto">
          Enter a Solana transaction signature above and click <span className="text-solana-purple font-mono">Run Tracer</span> to inspect low-level SBF bytecode and DWARF source mappings.
        </p>
      </div>
    );
  }

  const vmLogs = chunkData?.vmLogs || '';
  const disassemblyLines = chunkData?.chunkLines || (bytecodeText ? bytecodeText.split('\n') : []);

  const filteredLines = filterQuery
    ? disassemblyLines.filter(
        (line) =>
          line &&
          (line.toLowerCase().includes(filterQuery.toLowerCase()) ||
            line.startsWith('===') ||
            line.startsWith('📍 PROGRAM') ||
            line.startsWith('PC (Idx)'))
      )
    : disassemblyLines;

  const handleCopy = () => {
    const textToCopy = chunkData?.chunk || bytecodeText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadRaw = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/bytecode/raw');
      const text = await response.text();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bytecode.txt';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      const blob = new Blob([bytecodeText || ''], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bytecode_chunk.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const renderAssemblyInstruction = (asmText: string) => {
    const trimmed = asmText.trim();
    if (trimmed.startsWith('if')) {
      return <span className="text-amber-400 font-semibold">{trimmed}</span>;
    }
    if (trimmed.startsWith('call')) {
      return <span className="text-blue-400 font-bold">{trimmed}</span>;
    }
    if (trimmed.startsWith('exit') || trimmed.startsWith('return')) {
      return <span className="text-rose-400 font-bold">{trimmed}</span>;
    }
    if (trimmed.startsWith('jmp') || trimmed.startsWith('goto')) {
      return <span className="text-cyan-400 font-semibold">{trimmed}</span>;
    }
    return <span className="text-solana-green font-medium">{trimmed}</span>;
  };

  const renderDwarfMapping = (dwarfText: string) => {
    const trimmed = dwarfText.trim();
    if (!trimmed || trimmed === 'no_dwarf_symbol') {
      return <span className="text-slate-600 font-mono text-[11px] select-none">—</span>;
    }
    const cleanPath = trimmed.replace(/^📍\s*/, '');
    return (
      <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono">
        <FileCode className="w-3 h-3 text-amber-400 shrink-0" />
        <span className="truncate">{cleanPath}</span>
      </span>
    );
  };

  const vmLogLines = vmLogs ? vmLogs.split('\n') : [];

  return (
    <div className="space-y-6">
      {/* ALWAYS VISIBLE VM EXECUTION LOGS PANEL */}
      {vmLogs && (
        <div className="glass-panel rounded-2xl overflow-hidden border border-solana-border shadow-xl">
          <div
            onClick={() => setShowLogs(!showLogs)}
            className="bg-solana-card/90 px-6 py-3 border-b border-solana-border flex items-center justify-between cursor-pointer select-none hover:bg-solana-card transition-all"
          >
            <div className="flex items-center space-x-3 font-mono text-xs">
              <ScrollText className="w-4 h-4 text-solana-purple" />
              <span className="font-bold text-white uppercase tracking-wider">VM Execution Logs & Trace</span>
              <span className="px-2 py-0.5 bg-solana-purple/20 text-solana-green border border-solana-purple/40 rounded-full text-[10px]">
                {vmLogLines.length} log lines
              </span>
            </div>

            <button className="text-solana-muted hover:text-white flex items-center space-x-1 font-mono text-xs cursor-pointer">
              <span>{showLogs ? 'Hide Logs' : 'Show Logs'}</span>
              {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showLogs && (
            <div className="max-h-60 overflow-y-auto font-mono text-xs p-4 bg-[#090a0f] space-y-1 text-slate-300">
              {vmLogLines.map((log, idx) => (
                <div key={idx} className="flex items-start space-x-2 hover:bg-solana-card/50 p-1 rounded transition-colors">
                  <span className="text-solana-purple font-semibold select-none w-8 text-right flex-shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className={log.includes('success') ? 'text-solana-green font-semibold' : log.includes('invoke') ? 'text-blue-400 font-semibold' : 'text-slate-200'}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CHUNKED SBF DISASSEMBLY STREAM TABLE PANEL */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-solana-border shadow-2xl">
        {/* Header Action Bar */}
        <div className="bg-solana-dark/90 px-6 py-3 border-b border-solana-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 font-mono text-xs font-bold text-white">
            <Code2 className="w-4 h-4 text-solana-green" />
            <span>SBF BYTECODE DISASSEMBLY STREAM</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-solana-muted" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter in chunk..."
                className="pl-9 pr-3 py-1.5 bg-solana-card border border-solana-border rounded-lg text-xs font-mono text-white placeholder-solana-muted focus:outline-none focus:border-solana-green w-56 transition-all"
              />
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-solana-card border border-solana-border text-xs font-mono text-slate-300 hover:text-white hover:border-solana-purple flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-solana-green" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Chunk'}</span>
            </button>

            <button
              onClick={handleDownloadRaw}
              className="px-3 py-1.5 rounded-lg bg-solana-card border border-solana-border text-xs font-mono text-slate-300 hover:text-white hover:border-solana-green flex items-center space-x-1.5 transition-all cursor-pointer"
              title="Download full bytecode file"
            >
              <Download className="w-3.5 h-3.5 text-solana-green" />
              <span>Download All .txt</span>
            </button>

            {onClear && (
              <button
                onClick={onClear}
                className="px-3 py-1.5 rounded-lg bg-solana-card border border-solana-border text-xs font-mono text-slate-300 hover:text-red-400 hover:border-red-500/40 flex items-center space-x-1.5 transition-all cursor-pointer"
                title="Clear bytecode results"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Chunk Iterator Navigation Bar */}
        {chunkData && (
          <div className="bg-solana-card/80 px-6 py-2.5 border-b border-solana-border flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-solana-purple" />
              <span className="text-solana-muted">Bytecode Iterator:</span>
              <span className="text-white font-semibold">
                Lines {chunkData.startIndex.toLocaleString()} - {chunkData.endIndex.toLocaleString()}
              </span>
              <span className="text-solana-muted">of {chunkData.totalLines.toLocaleString()} total disassembly lines</span>

              {isNavigatingChunk && (
                <div className="flex items-center space-x-1 text-solana-purple pl-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-[10px]">Loading chunk...</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Previous Chunk Button */}
              <button
                onClick={onPreviousChunk}
                disabled={!chunkData.hasPrevious || isNavigatingChunk}
                className="px-3 py-1.5 rounded-lg bg-solana-dark border border-solana-border text-slate-200 hover:text-white hover:border-solana-purple flex items-center space-x-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Chunk</span>
              </button>

              {/* Chunk Jump Selector */}
              <div className="flex items-center space-x-1 text-solana-muted">
                <span>Chunk</span>
                <select
                  value={chunkData.page}
                  onChange={(e) => onJumpToPage?.(Number(e.target.value))}
                  disabled={isNavigatingChunk}
                  className="bg-solana-dark border border-solana-border text-white text-xs px-2 py-1 rounded focus:outline-none focus:border-solana-purple font-mono cursor-pointer"
                >
                  {Array.from({ length: chunkData.totalPages }, (_, i) => i + 1).map((p) => (
                    <option key={p} value={p}>
                      {p} / {chunkData.totalPages}
                    </option>
                  ))}
                </select>
              </div>

              {/* Next Chunk Button */}
              <button
                onClick={onNextChunk}
                disabled={!chunkData.hasNext || isNavigatingChunk}
                className="px-3 py-1.5 rounded-lg bg-solana-dark border border-solana-border text-slate-200 hover:text-white hover:border-solana-purple flex items-center space-x-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Next Chunk</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Chunk Size Selector */}
              <div className="flex items-center space-x-1 pl-2 border-l border-solana-border text-solana-muted">
                <span>Size:</span>
                <select
                  value={chunkData.chunkSize}
                  onChange={(e) => onChangeChunkSize?.(Number(e.target.value))}
                  disabled={isNavigatingChunk}
                  className="bg-solana-dark border border-solana-border text-solana-green text-xs px-2 py-1 rounded focus:outline-none focus:border-solana-green font-mono cursor-pointer"
                >
                  <option value={50}>50 lines</option>
                  <option value={100}>100 lines</option>
                  <option value={250}>250 lines</option>
                  <option value={500}>500 lines</option>
                  <option value={1000}>1,000 lines</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Structured HTML Table Display Area */}
        <div className="max-h-[650px] overflow-auto font-mono text-xs bg-[#0e1017]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#12141d] z-10 shadow-md border-b border-[#1c1f2b] text-solana-muted text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-32 shrink-0">PC (Idx)</th>
                <th className="py-3 px-4 w-60 shrink-0">Raw Bytes (Hex)</th>
                <th className="py-3 px-4 min-w-[280px]">Disassembled Assembly</th>
                <th className="py-3 px-4">Mapped Source Line (DWARF)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181b26]">
              {filteredLines.map((line, idx) => {
                if (!line) return null;

                // Handle Program Banner line
                if (line.startsWith('📍 PROGRAM ID:')) {
                  return (
                    <tr key={idx} className="bg-[#13101c] border-y border-[#262035]">
                      <td colSpan={4} className="py-3 px-4 font-bold text-solana-green">
                        <div className="flex items-center space-x-2">
                          <Cpu className="w-4 h-4 text-solana-purple" />
                          <span>{line}</span>
                        </div>
                      </td>
                    </tr>
                  );
                }

                // Skip ASCII decoration headers since we have a sticky table header
                if (
                  line.startsWith('===') ||
                  line.startsWith('---') ||
                  line.startsWith('PC (Idx)')
                ) {
                  return null;
                }

                // Parse PC assembly lines
                if (line.startsWith('PC [')) {
                  const parts = line.split('|');
                  const pcPart = (parts[0] || '').trim();
                  const hexPart = (parts[1] || '').trim();
                  const asmPart = (parts[2] || '').trim();
                  const dwarfPart = (parts[3] || '').trim();

                  return (
                    <tr key={idx} className="hover:bg-[#141722] transition-colors group">
                      <td className="py-2 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-solana-purple/20 border border-solana-purple/40 text-solana-purple font-semibold text-[11px]">
                          {pcPart}
                        </span>
                      </td>
                      <td className="py-2 px-4 whitespace-nowrap text-cyan-400/90 font-mono tracking-wider text-[11px]">
                        {hexPart}
                      </td>
                      <td className="py-2 px-4 font-mono text-[12px]">
                        {renderAssemblyInstruction(asmPart)}
                      </td>
                      <td className="py-2 px-4 font-mono text-[11px]">
                        {renderDwarfMapping(dwarfPart)}
                      </td>
                    </tr>
                  );
                }

                // Default text row for any unparsed metadata line
                return (
                  <tr key={idx} className="hover:bg-solana-card/40 transition-colors text-slate-300">
                    <td colSpan={4} className="py-2 px-4">
                      {line}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

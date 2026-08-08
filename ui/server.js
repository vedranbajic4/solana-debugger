import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..'); // Workspace root directory

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let lastAnalyzedSignature = null;

// Parse bytecode file into header metrics, VM execution logs, and disassembly stream
function parseBytecodeFile(content) {
  if (!content) {
    return {
      metrics: { statusSuccess: false, slot: 'N/A', computeUnits: 'N/A' },
      vmLogs: 'No execution logs available.',
      disassemblyText: ''
    };
  }

  const statusSuccess = content.includes('SUCCESS ✅') || content.includes('SUCCESS');
  const slotMatch = content.match(/Slot:\s+(\d+)/);
  const slot = slotMatch ? slotMatch[1] : 'N/A';

  const cuMatch = content.match(/Compute Units Consumed:\s+(\d+)/i) || content.match(/Compute Units:\s+(\d+)/i);
  const computeUnits = cuMatch ? parseInt(cuMatch[1]).toLocaleString() : 'N/A';

  const splitMarker = 'SBF BYTECODE DISASSEMBLY STREAM';
  const splitIndex = content.indexOf(splitMarker);

  let logsText = '';
  let disassemblyText = content;

  if (splitIndex !== -1) {
    const headerSep = content.lastIndexOf('==================================================================================================', splitIndex);
    if (headerSep !== -1) {
      logsText = content.substring(0, headerSep).trim();
      disassemblyText = content.substring(headerSep).trim();
    } else {
      logsText = content.substring(0, splitIndex).trim();
      disassemblyText = content.substring(splitIndex).trim();
    }
  }

  const logsMatch = logsText.match(/--- 📜 VM EXECUTION LOGS ---\n([\s\S]*)/);
  const vmLogs = logsMatch ? logsMatch[1].trim() : (logsText || 'No execution logs recorded.');

  return {
    metrics: { statusSuccess, slot, computeUnits },
    vmLogs,
    disassemblyText
  };
}

// API Endpoint to analyze transaction signature & iterate through SBF disassembly chunks
app.post('/api/analyze', async (req, res) => {
  const { signature, page = 1, chunkSize = 100, force = false } = req.body;
  const targetSig = signature ? signature.trim() : '';

  const bytecodeFilePath = path.join(rootDir, 'bytecode.txt');
  const analysisJsonPath = path.join(rootDir, 'bytecode.json');

  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedChunkSize = Math.max(10, Math.min(2000, parseInt(chunkSize) || 100));

  const runTracerNeeded = force || targetSig !== lastAnalyzedSignature;

  const processAndRespond = async () => {
    try {
      const bytecodeContent = await fs.readFile(bytecodeFilePath, 'utf-8');
      const { metrics, vmLogs, disassemblyText } = parseBytecodeFile(bytecodeContent);

      let analysisSummary = null;
      try {
        const jsonContent = await fs.readFile(analysisJsonPath, 'utf-8');
        analysisSummary = JSON.parse(jsonContent);
      } catch {
        // Fallback if bytecode.json not present
      }

      const lines = disassemblyText ? disassemblyText.split('\n') : [];
      const totalLines = lines.length;
      const totalPages = Math.max(1, Math.ceil(totalLines / parsedChunkSize));
      const currentPage = Math.min(parsedPage, totalPages);

      const startIndex = (currentPage - 1) * parsedChunkSize;
      const endIndex = Math.min(startIndex + parsedChunkSize, totalLines);
      const chunkLines = lines.slice(startIndex, endIndex);
      const chunkText = chunkLines.join('\n');

      return res.json({
        success: true,
        signature: targetSig || 'Sample Transaction',
        chunk: chunkText,
        chunkLines,
        vmLogs,
        analysisSummary,
        page: currentPage,
        totalPages,
        chunkSize: parsedChunkSize,
        totalLines,
        startIndex: totalLines > 0 ? startIndex + 1 : 0,
        endIndex,
        hasPrevious: currentPage > 1,
        hasNext: currentPage < totalPages,
        metrics
      });
    } catch (readError) {
      console.error(`❌ Error reading bytecode.txt: ${readError.message}`);
      return res.status(500).json({
        error: `Could not read bytecode.txt: ${readError.message}`
      });
    }
  };

  if (!runTracerNeeded) {
    console.log(`\n⚡ Serving disassembly chunk page ${parsedPage} for signature ${targetSig} from cache`);
    return await processAndRespond();
  }

  const command = targetSig
    ? `cargo run --bin sbf_tracer -- ${targetSig} bytecode.txt`
    : `cargo run --bin sbf_tracer -- bytecode.txt`;

  console.log(`\n🚀 Executing local tracer command in ${rootDir}: ${command}`);

  exec(command, { cwd: rootDir }, async (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Execution error: ${error.message}`);
      return res.status(500).json({
        error: error.message,
        stderr,
        stdout
      });
    }

    lastAnalyzedSignature = targetSig;
    await processAndRespond();
  });
});

// Endpoint to fetch full raw bytecode.txt for downloading
app.get('/api/bytecode/raw', async (req, res) => {
  try {
    const bytecodeFilePath = path.join(rootDir, 'bytecode.txt');
    const content = await fs.readFile(bytecodeFilePath, 'utf-8');
    res.setHeader('Content-Type', 'text/plain');
    res.send(content);
  } catch (err) {
    res.status(404).send('No bytecode text found.');
  }
});

app.get('/api/pseudocode/:programId', async (req, res) => {
  const { programId } = req.params;
  const soPath = path.join(rootDir, `${programId}.so`);
  const cPath = path.join(rootDir, `${programId}.c`);

  try {
    try {
      const existingC = await fs.readFile(cPath, 'utf-8');
      return res.json({ success: true, pseudocode: existingC });
    } catch (e) {
      // Not yet decompiled
    }

    try {
      await fs.access(soPath);
    } catch (e) {
      return res.status(404).json({ error: `Program ELF (${programId}.so) not found. Try analyzing a transaction first.` });
    }

    const decompileScript = path.join(rootDir, 'scripts', 'decompile_so.sh');
    const command = `${decompileScript} ${soPath} ${cPath}`;
    
    exec(command, { cwd: rootDir }, async (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: 'Failed to decompile', details: error.message });
      }
      try {
        const generatedC = await fs.readFile(cPath, 'utf-8');
        res.json({ success: true, pseudocode: generatedC });
      } catch (readErr) {
        res.status(500).json({ error: 'Failed to read decompiled file', details: readErr.message });
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ Solana Debugger API Server running at http://localhost:${PORT}`);
});

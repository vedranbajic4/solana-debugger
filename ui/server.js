import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzePseudocode } from './semanticAnalyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..'); // Workspace root directory

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let lastAnalyzedSignature = null;
let lastAnalyzedRpcUrl = null;

// Clusters the UI can switch between. `null` rpcUrl means "auto-detect" (legacy behaviour).
const NETWORK_RPC_URLS = {
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  mainnet: 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
  localnet: 'http://127.0.0.1:8899',
  localhost: 'http://127.0.0.1:8899',
};

// Resolve the RPC endpoint from the requested network, ignoring any client-supplied
// URL that is not one of the known clusters.
function resolveRpcUrl(network, rpcUrl) {
  if (network && NETWORK_RPC_URLS[network]) {
    return NETWORK_RPC_URLS[network];
  }
  if (rpcUrl && Object.values(NETWORK_RPC_URLS).includes(rpcUrl)) {
    return rpcUrl;
  }
  return null;
}

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
  const { signature, page = 1, chunkSize = 100, force = false, network, rpcUrl } = req.body;
  const targetSig = signature ? signature.trim() : '';
  const targetRpcUrl = resolveRpcUrl(network, rpcUrl);

  const bytecodeFilePath = path.join(rootDir, 'bytecode.txt');
  const analysisJsonPath = path.join(rootDir, 'bytecode.json');

  const parsedPage = Math.max(1, parseInt(page) || 1);
  const parsedChunkSize = Math.max(10, Math.min(2000, parseInt(chunkSize) || 100));

  const runTracerNeeded =
    force || targetSig !== lastAnalyzedSignature || targetRpcUrl !== lastAnalyzedRpcUrl;

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

  console.log(
    `\n🚀 Executing local tracer command in ${rootDir}: ${command} (RPC: ${targetRpcUrl || 'auto-detect'})`
  );

  const tracerEnv = { ...process.env };
  if (targetRpcUrl) {
    tracerEnv.SOLANA_RPC_URL = targetRpcUrl;
  }

  exec(command, { cwd: rootDir, env: tracerEnv }, async (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Execution error: ${error.message}`);
      return res.status(500).json({
        error: error.message,
        stderr,
        stdout
      });
    }

    lastAnalyzedSignature = targetSig;
    lastAnalyzedRpcUrl = targetRpcUrl;
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

// Endpoint to fetch decompiled pseudocode via Ghidra
app.get('/api/pseudocode/:programId', async (req, res) => {
  const { programId } = req.params;
  
  if (!programId) {
    return res.status(400).json({ success: false, error: 'Program ID is required' });
  }

  const NATIVE_PROGRAMS = {
    'ComputeBudget111111111111111111111111111111': 'Compute Budget',
    '11111111111111111111111111111111': 'System Program',
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': 'SPL Token',
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL': 'SPL Associated Token',
    'Config1111111111111111111111111111111111111': 'Config Program',
    'Stake11111111111111111111111111111111111111': 'Stake Program',
    'Vote111111111111111111111111111111111111111': 'Vote Program',
    'BPFLoaderUpgradeab1e11111111111111111111111': 'BPF Upgradeable Loader'
  };

  if (NATIVE_PROGRAMS[programId]) {
    return res.json({ 
      success: true, 
      pseudocode: `/*\n * Native Solana Program: ${NATIVE_PROGRAMS[programId]}\n * \n * This is a built-in runtime program written in Rust.\n * It does not execute via the BPF VM, so there is no bytecode to decompile.\n * The failure occurred internally within the Solana validator's native execution.\n */\n` 
    });
  }

  const soPath = path.join(rootDir, `${programId}.so`);
  const outPath = path.join(rootDir, `${programId}_out.c`);
  const scriptPath = path.join(rootDir, 'scripts', 'decompile_so.sh');

  try {
    await fs.access(soPath);
  } catch {
    return res.status(404).json({ success: false, error: `Program executable ${programId}.so not found in workspace.` });
  }

  console.log(`\n⚙️ Running Ghidra Headless Analyzer on ${programId}.so...`);
  
  exec(`bash ${scriptPath} ${soPath} ${outPath}`, { cwd: rootDir }, async (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Ghidra execution error: ${error.message}`);
      return res.status(500).json({ success: false, error: error.message });
    }

    try {
      const cCode = await fs.readFile(outPath, 'utf-8');
      const semantic = analyzePseudocode(cCode);
      res.json({ success: true, semantic });
    } catch (readError) {
      console.error(`❌ Error reading Ghidra output: ${readError.message}`);
      res.status(500).json({ success: false, error: 'Decompilation completed but output file could not be read.' });
    }
  });
});

app.get('/api/pseudocode/:programId/function/:address', async (req, res) => {
  const { programId, address } = req.params;
  const outPath = path.join(rootDir, `${programId}_out.c`);
  try {
    const cCode = await fs.readFile(outPath, 'utf-8');
    const semantic = analyzePseudocode(cCode);
    const func = semantic.functions.find(f => f.address === address);
    
    if (!func) {
      return res.status(404).json({ success: false, error: 'Function not found' });
    }
    
    const lines = cCode.split('\n');
    const funcCode = lines.slice(func.startLine, func.endLine + 1).join('\n');
    res.json({ success: true, pseudocode: funcCode });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`⚡ Solana Debugger API Server running at http://localhost:${PORT}`);
});

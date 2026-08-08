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

// API Endpoint to analyze transaction signature & execute local SBF disassembler
app.post('/api/analyze', async (req, res) => {
  const { signature } = req.body;
  const targetSig = signature ? signature.trim() : '';

  const bytecodeFilePath = path.join(rootDir, 'bytecode.txt');
  const command = targetSig
    ? `cargo run --bin sbf_tracer -- ${targetSig} bytecode.txt`
    : `cargo run --bin sbf_tracer -- bytecode.txt`;

  console.log(`\n🚀 Executing local command in ${rootDir}: ${command}`);

  exec(command, { cwd: rootDir }, async (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Execution error: ${error.message}`);
      return res.status(500).json({
        error: error.message,
        stderr,
        stdout
      });
    }

    try {
      const bytecodeContent = await fs.readFile(bytecodeFilePath, 'utf-8');
      console.log(`✅ Successfully read ${bytecodeContent.length} bytes from bytecode.txt`);

      return res.json({
        success: true,
        signature: targetSig || 'Sample Transaction',
        bytecode: bytecodeContent,
        stdout
      });
    } catch (readError) {
      console.error(`❌ Error reading bytecode.txt: ${readError.message}`);
      return res.status(500).json({
        error: `Could not read bytecode.txt: ${readError.message}`,
        stdout,
        stderr
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`⚡ Solana Debugger API Server running at http://localhost:${PORT}`);
});

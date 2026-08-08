import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TransactionInput } from './components/TransactionInput';
import { MetricsHeader } from './components/MetricsHeader';
import { BytecodeViewer } from './components/BytecodeViewer';
import { AlertCircle, Cpu } from 'lucide-react';

export function App() {
  const [signature, setSignature] = useState<string>(
    '3aFo1pGzZ2dFp6cxar87uv9QS2qSgUe7BXC1Pe98MLCgLZNtQFnTnHnjmazFEgf65ZnJpZQvFLhDe9m38AA7D45D'
  );
  const [bytecodeText, setBytecodeText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (sigToAnalyze?: string) => {
    const targetSig = sigToAnalyze !== undefined ? sigToAnalyze : signature;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signature: targetSig }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze transaction bytecode');
      }

      setBytecodeText(data.bytecode);
    } catch (err: any) {
      console.error('Error fetching analysis:', err);
      setError(err.message || 'Could not connect to Solana Debugger backend (localhost:3001)');
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically trigger initial analysis on mount
  useEffect(() => {
    handleAnalyze();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-100 flex flex-col selection:bg-solana-purple selection:text-white">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Controls */}
        <TransactionInput
          signature={signature}
          setSignature={setSignature}
          onAnalyze={() => handleAnalyze()}
          isLoading={isLoading}
        />

        {/* Error Alert */}
        {error && (
          <div className="glass-panel p-4 rounded-xl border-l-4 border-l-red-500 text-red-300 text-sm font-mono flex items-center space-x-3 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <div className="flex-1">
              <p className="font-bold">Execution Error</p>
              <p className="text-xs text-red-300/80">{error}</p>
              <p className="text-xs text-solana-muted mt-1">
                Make sure the backend server is running (<span className="text-solana-purple font-mono">node server.js</span> in <span className="text-solana-green font-mono">ui/</span>).
              </p>
            </div>
          </div>
        )}

        {/* Status Metrics */}
        <MetricsHeader signature={signature} bytecodeText={bytecodeText} />

        {/* Main Code & Disassembly Viewer */}
        <BytecodeViewer bytecodeText={bytecodeText} />
      </main>

      {/* Footer */}
      <footer className="border-t border-solana-border py-6 text-center text-xs font-mono text-solana-muted glass-panel mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 gap-2">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-solana-green" />
            <span>Solana Debugger & SBF Tracer Engine (Agave / solana-sdk)</span>
          </div>
          <div>Step 1 & Step 2 Complete • Disassembly + DWARF Line Tables</div>
        </div>
      </footer>
    </div>
  );
}

export default App;

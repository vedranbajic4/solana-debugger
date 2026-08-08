import React from 'react';
import { Search, Play, Zap, RotateCcw, X } from 'lucide-react';

interface TransactionInputProps {
  signature: string;
  setSignature: (sig: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  isLoading: boolean;
  hasData?: boolean;
}

export const TransactionInput: React.FC<TransactionInputProps> = ({
  signature,
  setSignature,
  onAnalyze,
  onClear,
  isLoading,
  hasData,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      onAnalyze();
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl glow-purple mb-8">
      <div className="flex flex-col space-y-4">
        <label className="text-xs font-mono text-solana-muted uppercase tracking-wider flex items-center space-x-2">
          <Zap className="w-4 h-4 text-solana-green" />
          <span>Enter Transaction Signature Hash (88 Base58 Characters)</span>
        </label>

        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-solana-muted" />
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste Solana transaction signature hash..."
              className="w-full pl-12 pr-10 py-3.5 bg-solana-dark border border-solana-border rounded-xl text-sm font-mono text-white placeholder-solana-muted focus:outline-none focus:border-solana-purple focus:ring-1 focus:ring-solana-purple transition-all"
            />
            {signature && (
              <button
                type="button"
                onClick={onClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-solana-muted hover:text-white hover:bg-solana-card rounded-lg transition-all"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onAnalyze}
              disabled={isLoading}
              className="px-6 py-3.5 bg-gradient-to-r from-solana-purple to-purple-700 hover:from-purple-600 hover:to-solana-purple text-white font-semibold rounded-xl flex items-center space-x-2 shadow-lg hover:shadow-solana-purple/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Run Tracer</span>
                </>
              )}
            </button>

            {(signature || hasData) && (
              <button
                onClick={onClear}
                disabled={isLoading}
                className="px-4 py-3.5 bg-solana-card hover:bg-red-500/10 border border-solana-border hover:border-red-500/40 text-slate-300 hover:text-red-400 font-semibold rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
                title="Clear transaction and bytecode results"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

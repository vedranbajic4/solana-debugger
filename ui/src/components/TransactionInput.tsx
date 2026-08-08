import React from 'react';
import { Search, Play, Zap, FileCode } from 'lucide-react';

interface TransactionInputProps {
  signature: string;
  setSignature: (sig: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const TransactionInput: React.FC<TransactionInputProps> = ({
  signature,
  setSignature,
  onAnalyze,
  isLoading,
}) => {
  const PRESET_SIGNATURES = [
    {
      label: 'Mainnet Swap Tx (Raydium/Pump.fun)',
      hash: '3aFo1pGzZ2dFp6cxar87uv9QS2qSgUe7BXC1Pe98MLCgLZNtQFnTnHnjmazFEgf65ZnJpZQvFLhDe9m38AA7D45D',
    },
    {
      label: 'Mainnet SOL Transfer Tx',
      hash: '2uNZE2u11kZvwubGKoKV6PwJRd8jDBiTtYceCoSzyAMD6pMzoUJraRCyWakiBJ9bma8vjM7dK2S1pQtGxxT6Ddk',
    },
    {
      label: 'Live Localnet Re-Execution',
      hash: '',
    },
  ];

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
              placeholder="e.g. 3aFo1pGzZ2dFp6cxar87uv9QS2qSgUe7BXC1Pe98MLCgLZNtQFnTnHnjmazFEgf65ZnJpZQvFLhDe9m38AA7D45D"
              className="w-full pl-12 pr-4 py-3.5 bg-solana-dark border border-solana-border rounded-xl text-sm font-mono text-white placeholder-solana-muted focus:outline-none focus:border-solana-purple focus:ring-1 focus:ring-solana-purple transition-all"
            />
          </div>

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
        </div>

        {/* Quick Presets */}
        <div className="flex items-center space-x-2 pt-2">
          <span className="text-xs text-solana-muted font-mono flex items-center space-x-1">
            <FileCode className="w-3.5 h-3.5" />
            <span>Presets:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_SIGNATURES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSignature(preset.hash);
                }}
                className="text-xs font-mono px-3 py-1 rounded-md bg-solana-dark border border-solana-border text-slate-300 hover:text-solana-green hover:border-solana-green/50 transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

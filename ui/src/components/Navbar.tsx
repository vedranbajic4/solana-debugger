import React from 'react';
import { Cpu, ExternalLink } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="border-b border-solana-border glass-panel sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-solana-purple to-solana-green p-[2px] glow-purple">
            <div className="w-full h-full bg-solana-dark rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-solana-green" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-white via-slate-200 to-solana-green bg-clip-text text-transparent">
              Solana Debugger & SBF Tracer
            </h1>
            <p className="text-xs text-solana-muted">Low-Level Bytecode & DWARF Line Inspector</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-solana-dark border border-solana-border">
            <span className="w-2 h-2 rounded-full bg-solana-green animate-pulse"></span>
            <span className="text-slate-300">RPC: Mainnet / Localnet</span>
          </div>

          <a
            href="https://solscan.io"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-solana-dark border border-solana-border text-slate-300 hover:text-white hover:border-solana-purple transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-solana-purple" />
            <span>Solscan</span>
          </a>
        </div>
      </div>
    </header>
  );
};

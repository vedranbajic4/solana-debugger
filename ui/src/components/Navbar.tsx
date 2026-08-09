import React, { useEffect, useRef, useState } from 'react';
import { Cpu, ExternalLink, ChevronDown, Check } from 'lucide-react';
import { NETWORKS, getNetwork, explorerUrl, type NetworkId } from '../networks';

interface NavbarProps {
  network: NetworkId;
  onNetworkChange: (network: NetworkId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ network, onNetworkChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const active = getNetwork(network);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (id: NetworkId) => {
    setIsOpen(false);
    if (id !== network) onNetworkChange(id);
  };

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
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-solana-dark border border-solana-border text-slate-300 hover:text-white hover:border-solana-purple transition-all"
            >
              <span className={`w-2 h-2 rounded-full ${active.dotClass} animate-pulse`}></span>
              <span>RPC: {active.label}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-solana-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isOpen && (
              <div
                role="listbox"
                className="absolute right-0 mt-2 w-56 rounded-xl bg-solana-dark border border-solana-border shadow-xl overflow-hidden z-50"
              >
                {NETWORKS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={option.id === network}
                    onClick={() => handleSelect(option.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/5 transition-colors ${
                      option.id === network ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    <span className="flex items-center space-x-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${option.dotClass}`}></span>
                      <span className="flex flex-col min-w-0">
                        <span>{option.label}</span>
                        <span className="text-[10px] text-solana-muted truncate">{option.rpcUrl}</span>
                      </span>
                    </span>
                    {option.id === network && (
                      <Check className="w-3.5 h-3.5 text-solana-green flex-shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <a
            href={explorerUrl(network)}
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

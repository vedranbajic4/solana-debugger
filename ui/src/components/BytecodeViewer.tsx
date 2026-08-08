import React, { useState } from 'react';
import { Copy, Check, Download, Filter, Code2, ScrollText, Terminal } from 'lucide-react';

interface BytecodeViewerProps {
  bytecodeText: string;
}

export const BytecodeViewer: React.FC<BytecodeViewerProps> = ({ bytecodeText }) => {
  const [activeTab, setActiveTab] = useState<'disassembly' | 'logs' | 'raw'>('disassembly');
  const [filterQuery, setFilterQuery] = useState('');
  const [copied, setCopied] = useState(false);

  if (!bytecodeText) {
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

  // Extract VM logs section
  const logsMatch = bytecodeText.match(/--- 📜 VM EXECUTION LOGS ---\n([\s\S]*?)\n==================================================================================================/);
  const vmLogs = logsMatch ? logsMatch[1].trim() : 'No execution logs recorded.';

  // Extract disassembly table section
  const disassemblyMatch = bytecodeText.match(/==================================================================================================\nSBF BYTECODE DISASSEMBLY STREAM[\s\S]*/);
  const disassemblyStream = disassemblyMatch ? disassemblyMatch[0] : bytecodeText;

  // Filter disassembly text by query
  const disassemblyLines = disassemblyStream.split('\n');
  const filteredLines = filterQuery
    ? disassemblyLines.filter(
        (line) =>
          line.toLowerCase().includes(filterQuery.toLowerCase()) ||
          line.startsWith('===') ||
          line.startsWith('📍 PROGRAM') ||
          line.startsWith('PC (Idx)')
      )
    : disassemblyLines;

  const handleCopy = () => {
    navigator.clipboard.writeText(bytecodeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([bytecodeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bytecode.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper to colorize individual SBF assembly line
  const formatSbfLine = (line: string, index: number) => {
    if (line.startsWith('📍 PROGRAM ID:')) {
      return (
        <div key={index} className="py-2 px-3 my-2 bg-solana-purple/20 border border-solana-purple/40 rounded-lg text-solana-green font-bold flex items-center space-x-2">
          <span>{line}</span>
        </div>
      );
    }
    if (line.startsWith('===') || line.startsWith('---')) {
      return <div key={index} className="text-solana-border my-1 select-none">{line}</div>;
    }
    if (line.startsWith('PC (Idx)')) {
      return <div key={index} className="text-solana-muted font-bold py-1 border-b border-solana-border/50">{line}</div>;
    }

    if (line.startsWith('PC [')) {
      const parts = line.split('|');
      const pcPart = parts[0] || '';
      const hexPart = parts[1] || '';
      const asmPart = parts[2] || '';
      const dwarfPart = parts[3] || '';

      return (
        <div key={index} className="py-0.5 hover:bg-solana-card/60 rounded px-1 flex items-center font-mono text-xs transition-colors">
          <span className="text-solana-purple font-semibold w-24 flex-shrink-0">{pcPart.trim()}</span>
          <span className="text-slate-500 w-2 shrink-0">|</span>
          <span className="text-cyan-400/80 w-52 flex-shrink-0 px-2 truncate">{hexPart.trim()}</span>
          <span className="text-slate-500 w-2 shrink-0">|</span>
          <span className="text-solana-green font-medium w-56 flex-shrink-0 px-2 truncate">{asmPart.trim()}</span>
          <span className="text-slate-500 w-2 shrink-0">|</span>
          <span className="text-amber-400/90 pl-2 truncate flex-1">{dwarfPart.trim()}</span>
        </div>
      );
    }

    return <div key={index} className="text-slate-300 py-0.5">{line}</div>;
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-solana-border shadow-2xl">
      {/* Top Action Bar */}
      <div className="bg-solana-dark/90 px-6 py-3 border-b border-solana-border flex flex-wrap items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center space-x-1 bg-solana-card p-1 rounded-xl border border-solana-border">
          <button
            onClick={() => setActiveTab('disassembly')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'disassembly'
                ? 'bg-solana-purple text-white shadow-md'
                : 'text-solana-muted hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>SBF Disassembly & DWARF</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-solana-purple text-white shadow-md'
                : 'text-solana-muted hover:text-white'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>VM Execution Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('raw')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'raw'
                ? 'bg-solana-purple text-white shadow-md'
                : 'text-solana-muted hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Raw bytecode.txt</span>
          </button>
        </div>

        {/* Filter Input & Controls */}
        <div className="flex items-center space-x-3">
          {activeTab === 'disassembly' && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-solana-muted" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter (e.g. MOV64, r1, processor.rs)..."
                className="pl-9 pr-3 py-1.5 bg-solana-card border border-solana-border rounded-lg text-xs font-mono text-white placeholder-solana-muted focus:outline-none focus:border-solana-green w-64 transition-all"
              />
            </div>
          )}

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-solana-card border border-solana-border text-xs font-mono text-slate-300 hover:text-white hover:border-solana-purple flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-solana-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg bg-solana-card border border-solana-border text-xs font-mono text-slate-300 hover:text-white hover:border-solana-green flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-solana-green" />
            <span>Download .txt</span>
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="max-h-[650px] overflow-auto font-mono text-xs p-5 bg-[#0e1017]">
        {activeTab === 'disassembly' && (
          <div className="space-y-0.5">
            {filteredLines.map((line, idx) => formatSbfLine(line, idx))}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-1 text-slate-300">
            {vmLogs.split('\n').map((log, idx) => (
              <div key={idx} className="flex items-start space-x-2 hover:bg-solana-card/50 p-1 rounded">
                <span className="text-solana-purple font-semibold select-none">{String(idx + 1).padStart(2, '0')}</span>
                <span className={log.includes('success') ? 'text-solana-green' : log.includes('invoke') ? 'text-blue-400' : 'text-slate-200'}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'raw' && (
          <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">
            {bytecodeText}
          </pre>
        )}
      </div>
    </div>
  );
};

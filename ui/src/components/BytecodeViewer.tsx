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

  // Helper to colorize individual SBF assembly line safely
  const formatSbfLine = (line: string | undefined | null, index: number) => {
    if (!line) return <div key={index} className="h-2" />;

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

            <button className="text-solana-muted hover:text-white flex items-center space-x-1 font-mono text-xs">
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

      {/* CHUNKED SBF DISASSEMBLY STREAM PANEL */}
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

        {/* Code Display Area */}
        <div className="max-h-[650px] overflow-auto font-mono text-xs p-5 bg-[#0e1017]">
          <div className="space-y-0.5">
            {filteredLines.map((line, idx) => formatSbfLine(line, idx))}
          </div>
        </div>
      </div>
    </div>
  );
};

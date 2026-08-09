import React, { useRef, useEffect, useState } from 'react';
import { FileCode2, MapPin, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { PseudocodeContainer } from './PseudocodeContainer';

export interface SourceLineData {
  line: number;
  text: string;
  isError?: boolean;
}

export interface SourceContextData {
  available: boolean;
  fileName?: string;
  errorLine?: number;
  sourceLines: SourceLineData[];
}

export interface FailureContextData {
  failedProgramId?: string;
  failedInstructionIndex?: number;
  sourceLocation?: {
    file: string;
    line: number;
    column: number;
  };
}

interface SourceCodeViewerProps {
  sourceContext?: SourceContextData | null;
  failureContext?: FailureContextData | null;
  selectedProgramId?: string | null;
  selectedFunctionName?: string | null;
}

// Simple Rust syntax highlighting
function highlightRust(text: string, selectedWord: string | null): React.ReactNode[] {
  // Tokenize by splitting on patterns
  const tokens: { type: string; value: string }[] = [];
  let idx = 0;
  while (idx < text.length) {
    // String literals
    if (text[idx] === '"') {
      let end = idx + 1;
      while (end < text.length && text[end] !== '"') {
        if (text[end] === '\\') end++;
        end++;
      }
      tokens.push({ type: 'string', value: text.slice(idx, end + 1) });
      idx = end + 1;
      continue;
    }

    // Single-line comments
    if (text[idx] === '/' && text[idx + 1] === '/') {
      tokens.push({ type: 'comment', value: text.slice(idx) });
      idx = text.length;
      continue;
    }

    // Decorators / attributes
    if (text[idx] === '#' && text[idx + 1] === '[') {
      let end = text.indexOf(']', idx);
      if (end === -1) end = text.length - 1;
      tokens.push({ type: 'decorator', value: text.slice(idx, end + 1) });
      idx = end + 1;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(text[idx]) && (idx === 0 || /[\s(,=+\-*/<>!&|^~]/.test(text[idx - 1]))) {
      let end = idx;
      while (end < text.length && /[0-9a-fA-Fx_.]/.test(text[end])) end++;
      tokens.push({ type: 'number', value: text.slice(idx, end) });
      idx = end;
      continue;
    }

    // Words (identifiers / keywords)
    if (/[a-zA-Z_]/.test(text[idx])) {
      let end = idx;
      while (end < text.length && /[a-zA-Z0-9_]/.test(text[end])) end++;
      const word = text.slice(idx, end);

      const kwSet = new Set([
        'fn', 'let', 'mut', 'pub', 'use', 'mod', 'struct', 'enum', 'impl', 'trait',
        'type', 'const', 'static', 'if', 'else', 'match', 'for', 'while', 'loop',
        'return', 'break', 'continue', 'as', 'in', 'ref', 'self', 'super', 'crate',
        'where', 'async', 'await', 'move', 'unsafe', 'extern', 'dyn', 'macro_rules',
      ]);
      const builtinSet = new Set([
        'require', 'require_keys_eq', 'require_gt', 'require_gte', 'msg',
        'Ok', 'Err', 'Some', 'None', 'Result', 'Option', 'Vec', 'String',
        'u8', 'u16', 'u32', 'u64', 'u128', 'i8', 'i16', 'i32', 'i64', 'i128',
        'f32', 'f64', 'bool', 'usize', 'isize',
      ]);

      if (kwSet.has(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (builtinSet.has(word)) {
        tokens.push({ type: 'builtin', value: word });
      } else {
        tokens.push({ type: 'ident', value: word });
      }
      idx = end;
      continue;
    }

    // Everything else (operators, whitespace, punctuation)
    tokens.push({ type: 'plain', value: text[idx] });
    idx++;
  }

  return tokens.map((tok, i) => {
    if (selectedWord && tok.value === selectedWord) {
      return <span key={i} className="bg-slate-700/60 text-slate-200 px-0.5 rounded">{tok.value}</span>;
    }
    switch (tok.type) {
      case 'keyword':
        return <span key={i} className="text-slate-300 font-bold">{tok.value}</span>;
      case 'builtin':
        return <span key={i} className="text-slate-400">{tok.value}</span>;
      case 'string':
        return <span key={i} className="text-slate-500 italic">{tok.value}</span>;
      case 'comment':
        return <span key={i} className="text-slate-600 italic">{tok.value}</span>;
      case 'decorator':
        return <span key={i} className="text-slate-400 font-bold">{tok.value}</span>;
      case 'number':
        return <span key={i} className="text-slate-300">{tok.value}</span>;
      default:
        return <span key={i} className="text-slate-400">{tok.value}</span>;
    }
  });
}

export const SourceCodeViewer: React.FC<SourceCodeViewerProps> = ({
  sourceContext,
  failureContext,
  selectedProgramId,
  selectedFunctionName,
}) => {
  const errorLineRef = useRef<HTMLDivElement>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  useEffect(() => {
    const handleClick = () => {
      const selection = window.getSelection();
      if (!selection || selection.toString().trim() === '') {
        setSelectedWord(null);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleDoubleClick = () => {
    const selection = window.getSelection();
    if (!selection) return;
    const text = selection.toString().trim();
    if (text && /^[a-zA-Z0-9_]+$/.test(text)) {
      setSelectedWord(text);
    }
  };

  useEffect(() => {
    if (errorLineRef.current) {
      errorLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [sourceContext]);

  if (!sourceContext && !failureContext && !selectedProgramId) return null;

  const targetProgramId = selectedProgramId || failureContext?.failedProgramId;
  const isSelectedFailing = targetProgramId === failureContext?.failedProgramId;

  // If source is not available, show a minimal info card
  if (sourceContext && !sourceContext.available) {
    return (
      <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-rose-500 bg-rose-950/20 border-rose-500/30 shadow-sm mb-6 font-mono text-xs">
        <div className="flex items-center space-x-3 text-rose-400 mb-4">
          <EyeOff className="w-6 h-6 shrink-0" />
          <span className="font-bold text-lg text-rose-300 uppercase tracking-wider">
            ORIGINAL SOURCE UNAVAILABLE - SHOWING HUMAN-READABLE PSEUDOCODE
          </span>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">
          This program was built as a <span className="text-slate-300">release binary without debug symbols</span>.
          Instead of original Rust source, we are displaying human-readable C-like pseudocode inferred from the sBPF bytecode below.
        </p>
        {failureContext?.failedProgramId && (
          <div className="mt-3 flex items-center space-x-2 text-xs text-slate-500">
            <MapPin className="w-3 h-3" />
            <span>Failed Program: <span className="text-rose-400 font-semibold">{failureContext.failedProgramId}</span></span>
          </div>
        )}
        {sourceContext.fileName && (
          <div className="mt-1 flex items-center space-x-2 text-xs text-slate-500">
            <FileCode2 className="w-3 h-3" />
            <span>DWARF Path: <span className="text-cyan-400">{sourceContext.fileName}</span></span>
            {sourceContext.errorLine && (
              <span className="text-rose-400">:L{sourceContext.errorLine}</span>
            )}
          </div>
        )}
        
        {targetProgramId && (
          <div className="mt-4">
            <PseudocodeContainer 
              programId={targetProgramId} 
              failureContext={isSelectedFailing ? failureContext : { function: selectedFunctionName }}
              autoExpand={true}
            />
          </div>
        )}
      </div>
    );
  }

  if (!sourceContext || sourceContext.sourceLines.length === 0) {
    // Show failure context summary if we have it but no source
    return (
      <div className="glass-panel p-5 rounded-2xl border border-[#1e222d] mb-6 font-mono text-xs">
        {failureContext && isSelectedFailing && (
          <>
            <div className="flex items-center space-x-2 text-slate-400 mb-3">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span className="font-bold text-sm text-slate-300 uppercase tracking-wider">
                Failure Context
              </span>
            </div>
            {failureContext.failedProgramId && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
                <span>Program:</span>
                <span className="text-rose-400 font-semibold">{failureContext.failedProgramId}</span>
              </div>
            )}
            {failureContext.failedInstructionIndex !== undefined && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 mb-4">
                <span>Failed at instruction index:</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold">
                  #{failureContext.failedInstructionIndex}
                </span>
              </div>
            )}
          </>
        )}
        
        {targetProgramId && (
          <div>
            <div className="mb-2 text-slate-400">
              Selected Program: <span className="text-cyan-400 font-semibold">{targetProgramId}</span>
            </div>
            <PseudocodeContainer 
              programId={targetProgramId}
              failureContext={isSelectedFailing ? failureContext : { function: selectedFunctionName }}
              autoExpand={true}
            />
          </div>
        )}
      </div>
    );
  }

  // Full source code viewer with highlighted error line
  return (
    <div className="bg-[#0b0c10] rounded-xl border border-[#1e2029] overflow-hidden shadow-sm mb-8 font-mono text-sm" onDoubleClick={handleDoubleClick}>
      {/* File Tab Header */}
      <div className="bg-[#121317] px-5 py-3 border-b border-[#1e2029] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 font-bold text-slate-400 uppercase tracking-widest text-xs">
            <FileCode2 className="w-4 h-4" />
            <span>Source Code</span>
          </div>

          {sourceContext.fileName && (
            <div className="flex items-center space-x-2 px-3 py-1 rounded bg-[#15171d] border border-[#2a2d36] text-xs">
              <span className="text-slate-300">{sourceContext.fileName}</span>
              {sourceContext.errorLine && (
                <span className="text-red-400 font-semibold">:L{sourceContext.errorLine}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Failure Context Summary Bar */}
      {failureContext?.failedProgramId && (
        <div className="bg-[#1a0f12] border-b border-red-900/40 px-5 py-2 flex items-center space-x-3 text-xs">
          <AlertCircle className="w-4 h-4 text-red-500/80" />
          <span className="text-red-300/90">
            Program <span className="font-bold text-red-200">{failureContext.failedProgramId.slice(0, 8)}...</span> failed
            {failureContext.failedInstructionIndex !== undefined && (
              <> at instruction <span className="font-bold text-red-200">#{failureContext.failedInstructionIndex}</span></>
            )}
          </span>
        </div>
      )}

      {/* Ghidra Pseudocode Fallback/Alternative */}
      {targetProgramId && (
        <div className="bg-[#0b0c10] border-b border-[#1e2029] p-4">
          <PseudocodeContainer 
            programId={targetProgramId}
            failureContext={isSelectedFailing ? failureContext : { function: selectedFunctionName }}
            autoExpand={false}
          />
        </div>
      )}

      {/* Source Code Lines */}
      <div className="overflow-x-auto bg-[#0a0b10] max-h-[500px] overflow-y-auto">
        {sourceContext.sourceLines.map((sl) => {
          const isError = sl.isError === true;
          return (
            <div
              key={sl.line}
              ref={isError ? errorLineRef : undefined}
              className={`flex items-stretch transition-colors duration-150 ${
                isError
                  ? 'bg-[#1a0f12] border-l-[3px] border-l-red-900/50'
                  : 'hover:bg-[#121317] border-l-[3px] border-l-transparent'
              }`}
            >
              {/* Line Number Gutter */}
              <div
                className={`w-16 shrink-0 text-right pr-4 py-1 select-none text-sm ${
                  isError
                    ? 'text-red-400 font-bold bg-[#1a0f12]'
                    : 'text-slate-500'
                }`}
              >
                {isError && (
                  <span className="inline-block mr-1 text-red-500">✕</span>
                )}
                {sl.line}
              </div>

              {/* Source Text */}
              <div
                className={`flex-1 py-1 px-4 whitespace-pre ${
                  isError ? 'text-red-200/90' : 'text-slate-300'
                }`}
                style={{ tabSize: 4 }}
              >
                {highlightRust(sl.text, selectedWord)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

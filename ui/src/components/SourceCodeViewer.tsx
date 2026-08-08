import React, { useRef, useEffect } from 'react';
import { FileCode2, MapPin, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { PseudocodeViewer } from './PseudocodeViewer';

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
function highlightRust(text: string): React.ReactNode[] {
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
    switch (tok.type) {
      case 'keyword':
        return <span key={i} style={{ color: '#c792ea' }}>{tok.value}</span>;
      case 'builtin':
        return <span key={i} style={{ color: '#82aaff' }}>{tok.value}</span>;
      case 'string':
        return <span key={i} style={{ color: '#c3e88d' }}>{tok.value}</span>;
      case 'comment':
        return <span key={i} style={{ color: '#546e7a', fontStyle: 'italic' }}>{tok.value}</span>;
      case 'decorator':
        return <span key={i} style={{ color: '#ffcb6b' }}>{tok.value}</span>;
      case 'number':
        return <span key={i} style={{ color: '#f78c6c' }}>{tok.value}</span>;
      default:
        return <span key={i}>{tok.value}</span>;
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
      <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-rose-500 bg-rose-950/20 border-rose-500/30 shadow-lg glow-purple mb-6 font-mono text-xs">
        <div className="flex items-center space-x-3 text-rose-400 mb-4">
          <EyeOff className="w-6 h-6 shrink-0" />
          <span className="font-bold text-lg text-rose-300 uppercase tracking-wider">
            Source Code Not Available
          </span>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">
          This program was built as a <span className="text-amber-300">release binary without debug symbols</span>.
          DWARF <code>.debug_line</code> tables are not present in the deployed ELF.
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
            <PseudocodeViewer 
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
            <PseudocodeViewer 
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
    <div className="glass-panel rounded-2xl border border-[#1e222d] overflow-hidden shadow-xl mb-6 font-mono text-xs">
      {/* File Tab Header */}
      <div className="bg-[#12141d] px-6 py-3 border-b border-[#1c1f2b] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 font-bold text-white uppercase tracking-wider">
            <FileCode2 className="w-4 h-4 text-solana-green" />
            <span>Source Code</span>
          </div>

          {sourceContext.fileName && (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#1a1d28] border border-[#252836]">
              <span className="text-cyan-300">{sourceContext.fileName}</span>
              {sourceContext.errorLine && (
                <span className="text-rose-400 font-semibold">:L{sourceContext.errorLine}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 text-[10px] text-solana-muted">
          <Eye className="w-3 h-3" />
          <span>DWARF .debug_line Mapping</span>
        </div>
      </div>

      {/* Failure Context Summary Bar */}
      {failureContext?.failedProgramId && (
        <div className="bg-rose-950/30 border-b border-rose-500/20 px-6 py-2 flex items-center space-x-3 text-xs">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-rose-300">
            Program <span className="font-bold text-rose-200">{failureContext.failedProgramId.slice(0, 8)}...</span> failed
            {failureContext.failedInstructionIndex !== undefined && (
              <> at instruction <span className="font-bold text-rose-200">#{failureContext.failedInstructionIndex}</span></>
            )}
          </span>
        </div>
      )}

      {/* Ghidra Pseudocode Fallback/Alternative */}
      {targetProgramId && (
        <div className="bg-[#0b0c10] border-b border-[#1c1f2b] p-4">
          <PseudocodeViewer 
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
                  ? 'bg-rose-950/40 border-l-[3px] border-l-rose-500'
                  : 'hover:bg-[#12141c] border-l-[3px] border-l-transparent'
              }`}
            >
              {/* Line Number Gutter */}
              <div
                className={`w-16 shrink-0 text-right pr-4 py-[3px] select-none ${
                  isError
                    ? 'text-rose-400 font-bold bg-rose-950/60'
                    : 'text-slate-600'
                }`}
              >
                {isError && (
                  <span className="inline-block mr-1 text-rose-400">✕</span>
                )}
                {sl.line}
              </div>

              {/* Source Text */}
              <div
                className={`flex-1 py-[3px] px-4 whitespace-pre ${
                  isError ? 'text-rose-100' : 'text-slate-300'
                }`}
                style={{ tabSize: 4 }}
              >
                {highlightRust(sl.text)}
              </div>

              {/* Error PC Badge */}
              {isError && (
                <div className="shrink-0 flex items-center pr-4">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/25 border border-rose-500/40 text-rose-300 text-[10px] font-bold animate-pulse">
                    ← ERROR
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

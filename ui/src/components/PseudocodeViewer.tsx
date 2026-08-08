import React, { useState } from 'react';
import { FileCode2, Loader2, Code, AlertCircle } from 'lucide-react';

interface PseudocodeViewerProps {
  programId: string;
  failureContext?: any;
  analysisSummary?: any;
  autoExpand?: boolean;
}

function highlightC(text: string): React.ReactNode[] {
  const tokens: { type: string; value: string }[] = [];
  let idx = 0;
  while (idx < text.length) {
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

    if (text[idx] === '/' && (text[idx + 1] === '/' || text[idx + 1] === '*')) {
      let end = idx + 2;
      if (text[idx + 1] === '/') {
        while (end < text.length && text[end] !== '\n') end++;
      } else {
        while (end < text.length && !(text[end - 1] === '*' && text[end] === '/')) end++;
        if (end < text.length) end++;
      }
      tokens.push({ type: 'comment', value: text.slice(idx, end) });
      idx = end;
      continue;
    }

    if (/[0-9]/.test(text[idx]) && (idx === 0 || /[\s(,=+\-*/<>!&|^~]/.test(text[idx - 1]))) {
      let end = idx;
      while (end < text.length && /[0-9a-fA-FxX]/.test(text[end])) end++;
      tokens.push({ type: 'number', value: text.slice(idx, end) });
      idx = end;
      continue;
    }

    if (/[a-zA-Z_]/.test(text[idx])) {
      let end = idx;
      while (end < text.length && /[a-zA-Z0-9_]/.test(text[end])) end++;
      const word = text.slice(idx, end);

      const kwSet = new Set(['if', 'else', 'while', 'for', 'return', 'break', 'continue', 'switch', 'case', 'default', 'struct', 'typedef', 'enum']);
      const typeSet = new Set(['uint64_t', 'int64_t', 'uint32_t', 'int32_t', 'uint16_t', 'int16_t', 'uint8_t', 'int8_t', 'bool', 'void', 'size_t', 'AccountContext', 'SolParameters']);
      
      if (kwSet.has(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (typeSet.has(word)) {
        tokens.push({ type: 'type', value: word });
      } else if (end < text.length && text[end] === '(') {
        tokens.push({ type: 'function', value: word });
      } else {
        tokens.push({ type: 'ident', value: word });
      }
      
      idx = end;
      continue;
    }

    tokens.push({ type: 'plain', value: text[idx] });
    idx++;
  }

  return tokens.map((tok, i) => {
    switch (tok.type) {
      case 'keyword':
        return <span key={i} style={{ color: '#c792ea' }}>{tok.value}</span>;
      case 'type':
        return <span key={i} style={{ color: '#ffcb6b' }}>{tok.value}</span>;
      case 'function':
        return <span key={i} style={{ color: '#82aaff' }}>{tok.value}</span>;
      case 'string':
        return <span key={i} style={{ color: '#c3e88d' }}>{tok.value}</span>;
      case 'comment':
        return <span key={i} style={{ color: '#546e7a', fontStyle: 'italic' }}>{tok.value}</span>;
      case 'number':
        return <span key={i} style={{ color: '#f78c6c' }}>{tok.value}</span>;
      default:
        // Identify known variable patterns like param_, var_, local_ for dimming
        if (tok.value.startsWith('param_') || tok.value.startsWith('local_') || tok.value.startsWith('uVar') || tok.value.startsWith('iVar') || tok.value.startsWith('lVar') || tok.value.startsWith('puVar') || tok.value.startsWith('plVar')) {
           return <span key={i} style={{ color: '#7a8899' }}>{tok.value}</span>;
        }
        return <span key={i}>{tok.value}</span>;
    }
  });
}

export const PseudocodeViewer: React.FC<PseudocodeViewerProps> = ({ programId, failureContext, analysisSummary, autoExpand = false }) => {
  const [isOpen, setIsOpen] = useState(autoExpand);
  const [isLoading, setIsLoading] = useState(false);
  const [pseudocode, setPseudocode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setPseudocode(null);
    setError(null);
    setIsOpen(autoExpand);
    if (autoExpand) {
      fetchPseudocode(programId);
    }
  }, [programId, autoExpand]);

  const fetchPseudocode = async (pid?: string) => {
    const targetPid = pid || programId;
    if (pseudocode && targetPid === programId) {
      setIsOpen(!isOpen);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setIsOpen(true);
    
    try {
      const response = await fetch(`http://localhost:3001/api/pseudocode/${targetPid}`);
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to decompile program');
      }
      
      setPseudocode(data.pseudocode);
    } catch (err: any) {
      console.error('Error fetching pseudocode:', err);
      setError(err.message || 'Error running Ghidra decompiler');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        onClick={() => fetchPseudocode()}
        disabled={isLoading}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-500/30 text-cyan-300 font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileCode2 className="w-4 h-4" />
        )}
        <span>{isOpen && pseudocode ? 'Hide Pseudocode' : 'Ghidra Decompile (sBPF)'}</span>
      </button>

      {isOpen && (
        <div className="mt-3 p-4 bg-[#0a0b10] border border-[#1c1f2b] rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Code className="w-16 h-16 text-cyan-500" />
          </div>
          
          <div className="flex items-center space-x-2 mb-3 text-cyan-400 font-semibold border-b border-cyan-900/30 pb-2">
            <FileCode2 className="w-4 h-4" />
            <span>Decompiled pseudocode inferred from Solana sBPF bytecode. This is not the original Rust source.</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-8 space-x-3 text-cyan-400/70">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Running Ghidra headless analyzer... (This may take a few seconds)</span>
            </div>
          ) : error ? (
            <div className="flex items-start space-x-2 text-rose-400 bg-rose-950/20 p-3 rounded border border-rose-900/50">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Decompilation Failed: </span>
                <span>{error}</span>
              </div>
            </div>
          ) : pseudocode ? (
            <div className="text-[11px] font-mono text-slate-300 overflow-x-auto overflow-y-auto max-h-[500px] bg-[#050608] rounded border border-[#1c1f2b] custom-scrollbar">
              {(() => {
                const lines = pseudocode.split('\n');
                
                let bestLineIdx = -1;
                let minDistance = Infinity;
                let isExactMatch = false;
                let inTargetFunction = false;
                let functionStartIdx = -1;
                let functionEndIdx = -1;

                const targetFunc = failureContext?.function;
                const targetAddrNum = failureContext?.elfAddress;
                const targetAddrStr = targetAddrNum ? `0x${targetAddrNum.toString(16)}` : null;

                if (targetAddrNum || targetFunc) {
                  for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.startsWith('/* Function: ')) {
                      if ((targetFunc && line.includes(` ${targetFunc} `)) || 
                          (targetAddrStr && line.includes(`@ ${targetAddrStr} `))) {
                        inTargetFunction = true;
                        functionStartIdx = i;
                      } else {
                        if (inTargetFunction) functionEndIdx = i;
                        inTargetFunction = false;
                      }
                    }
                    
                    if (inTargetFunction && targetAddrNum) {
                      const match = line.match(/\/\/ @ 0x([0-9a-f]+)(?:-0x([0-9a-f]+))?/i);
                      if (match) {
                        const startAddr = parseInt(match[1], 16);
                        const endAddr = match[2] ? parseInt(match[2], 16) : startAddr;
                        
                        if (targetAddrNum >= startAddr && targetAddrNum <= endAddr) {
                          if (!isExactMatch) {
                            bestLineIdx = i;
                            minDistance = 0;
                            isExactMatch = true;
                          }
                        } else {
                          const dist = Math.min(Math.abs(targetAddrNum - startAddr), Math.abs(targetAddrNum - endAddr));
                          if (dist < minDistance && !isExactMatch) {
                            minDistance = dist;
                            bestLineIdx = i;
                          }
                        }
                      }
                    }
                  }
                  if (inTargetFunction && functionEndIdx === -1) {
                     functionEndIdx = lines.length;
                  }
                }

                let errorTitle = "Unknown cause";
                let errorDetails = "Insufficient information to determine the exact reason.";

                if (analysisSummary) {
                  if (analysisSummary.decodedError) {
                    const name = analysisSummary.decodedError.name;
                    const msg = analysisSummary.decodedError.msg;
                    
                    if (name.includes("Constraint") || name.includes("Account")) {
                       if (name.includes("NotInitialized") || name.includes("Uninitialized")) {
                         errorTitle = "Account not initialized";
                       } else if (name.includes("WrongProgram") || name.includes("InvalidOwner")) {
                         errorTitle = "Invalid owner";
                       } else {
                         errorTitle = "Constraint violation";
                       }
                    } else if (name.includes("InsufficientFunds") || name.includes("InsufficientFundsForRent") || name.toLowerCase().includes("balance")) {
                      errorTitle = "Insufficient funds / balance";
                    } else if (name.includes("Signature") || name.includes("Signer")) {
                      errorTitle = "Missing signer";
                    } else if (name.includes("Overflow") || name.includes("Underflow")) {
                      errorTitle = "Arithmetic overflow/underflow";
                    } else {
                      errorTitle = name;
                    }
                    errorDetails = msg;
                  } else if (analysisSummary.accountValidations && analysisSummary.accountValidations.length > 0) {
                    const val = analysisSummary.accountValidations[0];
                    errorTitle = val.errorName || "Constraint violation";
                    errorDetails = val.message || "An account failed validation constraints.";
                  } else if (analysisSummary.execution_status) {
                    const status = analysisSummary.execution_status;
                    if (status.includes("insufficient funds") || status.includes("insufficient lamports")) {
                      errorTitle = "Insufficient funds / balance";
                      errorDetails = "The program attempted to use more funds than were available in the source account.";
                    } else if (status.includes("instruction data") || status.includes("invalid instruction data")) {
                      errorTitle = "Invalid instruction data";
                      errorDetails = "The instruction data provided to the program is invalid or malformed.";
                    } else if (status.includes("unauthorized") || status.includes("privilege escalated")) {
                      errorTitle = "Unauthorized operation";
                      errorDetails = "The program attempted an operation it does not have permission for (e.g. cross-program privilege escalation).";
                    } else if (status.includes("Cross-program invocation with unauthorized signer")) {
                      errorTitle = "Missing signer";
                      errorDetails = "A required signature was missing for a cross-program invocation.";
                    } else if (status.includes("exceeded maximum number of instructions") || status.includes("Compute budget exceeded")) {
                      errorTitle = "Compute budget exceeded";
                      errorDetails = "The program exceeded its allowed compute budget.";
                    } else if (status.includes("memory allocation failed") || status.includes("out of bounds") || status.includes("Access violation") || status.includes("out of bounds memory access")) {
                      errorTitle = "Out-of-bounds / memory access";
                      errorDetails = "The program attempted to read or write memory out of bounds.";
                    } else if (status.includes("Custom")) {
                      errorTitle = "Program-specific/custom error";
                      errorDetails = status;
                    } else if (status !== "Success" && status.includes("Error")) {
                      errorTitle = "Unknown cause";
                      errorDetails = "Insufficient information to determine the exact reason. Solana error: " + status;
                    }
                  }
                }

                let renderStartIndex = 0;
                let renderEndIndex = lines.length;

                if (bestLineIdx !== -1) {
                  renderStartIndex = Math.max(functionStartIdx !== -1 ? functionStartIdx : 0, bestLineIdx - 10);
                  renderEndIndex = Math.min(functionEndIdx !== -1 ? functionEndIdx : lines.length, bestLineIdx + 11);
                } else if (functionStartIdx !== -1) {
                  renderStartIndex = functionStartIdx;
                  renderEndIndex = functionEndIdx !== -1 ? functionEndIdx : lines.length;
                }
                
                const linesToRender = lines.slice(renderStartIndex, renderEndIndex);
                
                return linesToRender.map((line, relativeIdx) => {
                  const absoluteIdx = renderStartIndex + relativeIdx;
                  const displayLine = line.replace(/\/\/ @ 0x[0-9a-f]+(?:-0x[0-9a-f]+)?/i, '').trimEnd();
                  
                  if (bestLineIdx !== -1) {
                    const isBest = absoluteIdx === bestLineIdx;
                    return (
                      <div key={absoluteIdx}>
                        {isBest && (
                          <div 
                            className="bg-rose-950/20 border border-rose-900/50 rounded-lg p-4 mb-2 mt-3 mx-2 text-rose-200 text-xs flex flex-col space-y-3" 
                            ref={el => { if (el && autoExpand) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
                          >
                            <div className="flex items-center space-x-2 font-bold text-sm text-rose-300 border-b border-rose-900/50 pb-2">
                              <span>❌ Transaction failed</span>
                            </div>
                            
                            <div className="flex flex-col space-y-1">
                              <span className="font-bold text-rose-400">Error:</span>
                              <span className="font-mono bg-rose-900/20 px-2 py-1 rounded inline-block w-fit text-rose-100">{errorTitle}</span>
                            </div>

                            <div className="flex flex-col space-y-1">
                              <span className="font-bold text-rose-400">Details:</span>
                              <span className="opacity-90 leading-relaxed text-[11px] max-w-xl">{errorDetails}</span>
                            </div>

                            <div className="flex flex-col space-y-1">
                              <span className="font-bold text-rose-400">Location:</span>
                              <span className="font-mono bg-rose-900/20 px-2 py-1 rounded inline-block w-fit">
                                {targetFunc || 'unknown_function'}() → PC {failureContext?.runtimePc !== undefined ? `0x${failureContext.runtimePc.toString(16)}` : 'Unknown'}
                              </span>
                            </div>

                            <div className="flex flex-col space-y-1">
                              <span className="font-bold text-rose-400">Confidence:</span>
                              <span className="font-mono text-[11px]">{isExactMatch ? 'High' : `Approximate (${Math.max(10, 95 - minDistance)}%)`}</span>
                            </div>
                            
                            {analysisSummary?.execution_status && (
                              <div className="mt-2 pt-3 border-t border-rose-900/30">
                                <span className="font-bold text-rose-500 block mb-1 text-[10px] uppercase tracking-wider">Original Solana Error:</span>
                                <span className="font-mono text-[10px] opacity-60 break-all">{analysisSummary.execution_status}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <div 
                          className={`px-3 py-0.5 whitespace-pre ${
                            isBest ? 'bg-rose-900/30 text-rose-100 border-l-2 border-rose-500 font-bold' : 'hover:bg-white/5 border-l-2 border-transparent'
                          }`}
                        >
                          {highlightC(displayLine)}
                        </div>
                      </div>
                    );
                  } else {
                    const inHighlightBlock = absoluteIdx >= functionStartIdx && absoluteIdx < functionEndIdx;
                    return (
                      <div 
                        key={absoluteIdx} 
                        className={`px-3 py-0.5 whitespace-pre ${
                          inHighlightBlock ? 'bg-rose-900/30 text-rose-200 border-l-2 border-rose-500' : 'hover:bg-white/5 border-l-2 border-transparent'
                        }`}
                      >
                        {highlightC(displayLine)}
                      </div>
                    );
                  }
                });
              })()}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

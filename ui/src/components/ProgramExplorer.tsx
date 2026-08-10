import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  FileCode2, Loader2, Code, AlertCircle, MapPin, 
  ChevronRight, ChevronDown, Activity, ShieldCheck, 
  Settings, Key, Package, Cpu, Search
} from 'lucide-react';
import type { ProgramSemantic, SemanticFunction } from '../utils/semanticAnalyzer';
import { SkeletonBar, SkeletonCodeLines } from './Skeleton';

// Placeholder function tree shown while Ghidra decompiles the program.
const FunctionListSkeleton: React.FC = () => (
  <div className="space-y-4 p-1" aria-hidden="true">
    {Array.from({ length: 3 }, (_, group) => (
      <div key={group} className="space-y-2">
        <div className="flex items-center space-x-2 p-2">
          <SkeletonBar className="w-3.5 flex-shrink-0" />
          <SkeletonBar className="w-32" />
        </div>
        <div className="pl-7 space-y-2">
          {Array.from({ length: 3 }, (_, row) => (
            <SkeletonBar key={row} className={row % 2 === 0 ? 'w-3/4' : 'w-2/3'} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

interface ProgramExplorerProps {
  programId: string;
  semantic: ProgramSemantic | null;
  rawPseudocode: string | null;
  isLoading: boolean;
  error: string | null;
  failureContext?: any;
  onFetch: () => void;
}

export function highlightC(text: string, selectedWord: string | null): React.ReactNode[] {
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
    if (selectedWord && tok.value === selectedWord) {
      return <span key={i} className="bg-slate-700/60 text-slate-200 px-0.5 rounded">{tok.value}</span>;
    }
    switch (tok.type) {
      case 'keyword': return <span key={i} style={{ color: '#c792ea' }}>{tok.value}</span>;
      case 'type': return <span key={i} style={{ color: '#ffcb6b' }}>{tok.value}</span>;
      case 'function': return <span key={i} style={{ color: '#82aaff' }}>{tok.value}</span>;
      case 'string': return <span key={i} style={{ color: '#c3e88d' }}>{tok.value}</span>;
      case 'comment': return <span key={i} style={{ color: '#546e7a', fontStyle: 'italic' }}>{tok.value}</span>;
      case 'number': return <span key={i} style={{ color: '#f78c6c' }}>{tok.value}</span>;
      default:
        if (tok.value.startsWith('param_') || tok.value.startsWith('local_') || tok.value.startsWith('uVar') || tok.value.startsWith('iVar') || tok.value.startsWith('lVar') || tok.value.startsWith('puVar') || tok.value.startsWith('plVar')) {
           return <span key={i} style={{ color: '#7a8899' }}>{tok.value}</span>;
        }
        return <span key={i}>{tok.value}</span>;
    }
  });
}

function parseAddressRange(addrStr: string): [number, number] | null {
  const match = addrStr.match(/0x([0-9a-fA-F]+)(?:-0x([0-9a-fA-F]+))?/);
  if (!match) return null;
  const start = parseInt(match[1], 16);
  const end = match[2] ? parseInt(match[2], 16) : start;
  return [start, end];
}

function isAddressInRange(targetAddr: number, addrStr: string): boolean {
  const range = parseAddressRange(addrStr);
  if (!range) return false;
  return targetAddr >= range[0] && targetAddr <= range[1];
}

function getFunctionCategory(func: SemanticFunction): string {
  const name = (func.semanticName || func.name).toLowerCase();
  if (name.includes('entry') || name.includes('dispatch') || name.includes('router')) return 'Program Entry & Dispatch';
  if (name.includes('handle') || name.includes('process') || name.includes('execute') || name.includes('update') || name.includes('transfer') || name.includes('initialize')) return 'Core Logic';
  if (name.includes('check') || name.includes('validate') || name.includes('verify') || name.includes('assert') || name.includes('pda') || name.includes('signer') || name.includes('owner')) return 'Validation & Security';
  if (name.includes('alloc') || name.includes('free') || name.includes('panic') || name.includes('noop') || name.includes('abort') || name.includes('mem')) return 'Utilities';
  return 'Other';
}

const CATEGORY_ORDER = ['Program Entry & Dispatch', 'Core Logic', 'Validation & Security', 'Utilities', 'Other'];

function getCategoryIcon(category: string) {
  switch (category) {
    case 'Program Entry & Dispatch': return <Key className="w-4 h-4 text-slate-400" />;
    case 'Core Logic': return <Settings className="w-4 h-4 text-slate-400" />;
    case 'Validation & Security': return <ShieldCheck className="w-4 h-4 text-slate-400" />;
    case 'Utilities': return <Cpu className="w-4 h-4 text-slate-400" />;
    default: return <Package className="w-4 h-4 text-slate-500" />;
  }
}



export const ProgramExplorer: React.FC<ProgramExplorerProps> = ({
  programId,
  semantic,
  isLoading,
  error,
  failureContext,
  onFetch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFuncAddr, setSelectedFuncAddr] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [functionCodes, setFunctionCodes] = useState<Record<string, string>>({});
  const [isLoadingFunc, setIsLoadingFunc] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const errorLineRef = useRef<HTMLDivElement>(null);

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

  const targetAddrNum = failureContext?.elfAddress;
  const targetFunc = failureContext?.function;

  const checkFunctionHasError = (func: SemanticFunction) => {
    if (targetFunc && (targetFunc === func.name || targetFunc === func.semanticName)) return true;
    if (targetAddrNum && func.operations) {
      return func.operations.some(op => isAddressInRange(targetAddrNum, op.address));
    }
    return false;
  };

  // Automatically select failing function when loaded
  useEffect(() => {
    if (semantic && (targetAddrNum || targetFunc)) {
      const failingFunc = semantic.functions.find(f => checkFunctionHasError(f));
      if (failingFunc) {
        setSelectedFuncAddr(failingFunc.address);
      }
    }
  }, [semantic, failureContext]);

  // Fetch function code lazily
  useEffect(() => {
    if (selectedFuncAddr && !functionCodes[selectedFuncAddr]) {
      setIsLoadingFunc(true);
      fetch(`http://localhost:3001/api/pseudocode/${programId}/function/${selectedFuncAddr}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.pseudocode) {
            setFunctionCodes(prev => ({ ...prev, [selectedFuncAddr]: data.pseudocode }));
          }
        })
        .catch(err => console.error("Error fetching function code:", err))
        .finally(() => setIsLoadingFunc(false));
    }
  }, [selectedFuncAddr, programId, functionCodes]);

  // Scroll to error if selected function has it and code is loaded
  useEffect(() => {
    if (errorLineRef.current) {
      errorLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedFuncAddr, functionCodes]);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
       const next = new Set(prev);
       if (next.has(cat)) next.delete(cat);
       else next.add(cat);
       return next;
    });
  };

  const getFunctionLines = (func: SemanticFunction) => {
    const code = functionCodes[func.address];
    return code ? code.split('\n') : [];
  };

  const categories = useMemo(() => {
    if (!semantic) return [];
    
    const query = searchQuery.toLowerCase();
    const filteredFuncs = semantic.functions.filter(f => {
       if (!query) return true;
       return (
         f.name.toLowerCase().includes(query) ||
         (f.semanticName && f.semanticName.toLowerCase().includes(query)) ||
         f.evidence.some(e => e.toLowerCase().includes(query)) ||
         f.operations.some(op => op.semantic.toLowerCase().includes(query))
       );
    });

    const groups: Record<string, SemanticFunction[]> = {};
    for (const func of filteredFuncs) {
      const cat = getFunctionCategory(func);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(func);
    }

    return CATEGORY_ORDER.map(cat => ({
      name: cat,
      functions: (groups[cat] || []).sort((a, b) => {
        const addrA = parseInt(a.address, 16) || 0;
        const addrB = parseInt(b.address, 16) || 0;
        return addrA - addrB;
      })
    })).filter(g => g.functions.length > 0);
  }, [semantic, searchQuery]);



  const renderRawLines = (lines: string[], highlightAddr?: number, approximateFuncMatch?: boolean) => {
    return (
      <div className="text-[11px] font-mono text-slate-300 overflow-x-auto bg-[#050608] rounded-xl border border-[#1c1f2b] custom-scrollbar py-2" onDoubleClick={handleDoubleClick}>
        {lines.map((line, idx) => {
          let isBest = false;
          let isExactMatch = false;

          if (highlightAddr) {
            const match = line.match(/\/\/ @ 0x([0-9a-fA-F]+)(?:-0x([0-9a-fA-F]+))?/i);
            if (match) {
              const startAddr = parseInt(match[1], 16);
              const endAddr = match[2] ? parseInt(match[2], 16) : startAddr;
              if (highlightAddr >= startAddr && highlightAddr <= endAddr) {
                isBest = true;
                isExactMatch = true;
              }
            }
          }
          
          if (!isBest && approximateFuncMatch && idx === 0) {
             isBest = true;
             isExactMatch = false;
          }

          const displayLine = line.replace(/\/\/ @ 0x[0-9a-fA-F]+(?:-0x[0-9a-fA-F]+)?/i, '').trimEnd();

          return (
            <div key={idx}>
              <div 
                ref={isBest ? errorLineRef : null}
                className={`px-4 py-0.5 whitespace-pre ${
                  isBest 
                    ? 'bg-rose-950/60 text-rose-100 border-l-[3px] border-l-rose-500 font-bold' 
                    : 'hover:bg-white/5 border-l-[3px] border-l-transparent'
                }`}
              >
                <span className="inline-block w-10 text-right mr-4 text-slate-400 text-xs font-bold select-none border-r border-slate-700 pr-2">
                  {idx + 1}
                </span>
                {highlightC(displayLine, selectedWord)}
                {isBest && (
                  <span className="ml-8 font-bold text-[10px] text-rose-300 uppercase tracking-widest bg-rose-950 border border-rose-900/50 px-2 py-0.5 rounded">
                    {isExactMatch ? 'ERROR LOCATION' : 'APPROXIMATE LOCATION'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const selectedFunc = semantic?.functions.find(f => f.address === selectedFuncAddr);
  const selectedFuncHasError = selectedFunc ? checkFunctionHasError(selectedFunc) : false;

  return (
    <div className="mt-4 flex flex-col space-y-4">
      
      {error && (
        <div className="flex items-start space-x-2 text-rose-400 bg-rose-950/30 p-4 rounded-xl border border-rose-900/50">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <span className="font-bold">Analysis Failed: </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main IDE Layout */}
      <div className="flex h-[800px] border border-[#1c1f2b] rounded-xl overflow-hidden bg-[#0a0c10] shadow-sm">
        
        {/* Left Sidebar: Function Navigation */}
        <div className="w-1/3 flex flex-col border-r border-[#1c1f2b] bg-[#050608] shrink-0">
          <div className="p-4 border-b border-[#1c1f2b] space-y-3">
             <div className="flex items-center justify-between">
               <h3 className="text-sm font-bold text-slate-300 tracking-wide uppercase">Functions</h3>
               <button
                 onClick={onFetch}
                 disabled={isLoading}
                 className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs transition-colors disabled:opacity-50"
                 title="Analyze Program Semantic"
               >
                 {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
               </button>
             </div>
             
             <div className="relative">
               <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
               <input 
                 value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                 placeholder="Search functions..."
                 className="w-full bg-[#12141c] border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-slate-500 transition-colors"
               />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
             {isLoading && <FunctionListSkeleton />}
             {!isLoading && categories.map(cat => (
                <div key={cat.name}>
                   <div 
                     onClick={() => toggleCategory(cat.name)} 
                     className="flex items-center space-x-2 text-slate-400 p-2 hover:bg-white/5 cursor-pointer rounded-lg transition-colors select-none"
                   >
                      {collapsedCategories.has(cat.name) ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {getCategoryIcon(cat.name)}
                      <span className="text-xs font-bold uppercase tracking-wider">{cat.name}</span>
                      <span className="text-[10px] ml-auto text-slate-500">{cat.functions.length}</span>
                   </div>
                   
                   {!collapsedCategories.has(cat.name) && (
                      <div className="mt-1 space-y-0.5 pl-4 ml-3">
                         {cat.functions.map(func => {
                            const isError = checkFunctionHasError(func);
                            const isSelected = selectedFuncAddr === func.address;
                            return (
                               <div 
                                 key={func.address}
                                 onClick={() => setSelectedFuncAddr(func.address)}
                                 className={`px-3 py-1.5 rounded-lg cursor-pointer flex items-center text-xs transition-colors border ${
                                    isSelected 
                                      ? (isError ? 'bg-rose-950/40 border-rose-900/50 text-rose-300' : 'bg-slate-800 border-slate-700 text-slate-200') 
                                      : (isError ? 'hover:bg-rose-950/20 border-transparent text-rose-400' : 'hover:bg-white/5 border-transparent text-slate-400')
                                 }`}
                               >
                                  <span className="truncate pr-2 font-mono flex-1">{func.semanticName || func.name}</span>
                                  <span className={`text-[11px] font-bold font-mono whitespace-nowrap ml-2 ${isSelected ? 'text-slate-200' : 'text-slate-400'}`}>
                                    {func.endLine - func.startLine} L
                                  </span>
                                  {isError && <AlertCircle className="w-3 h-3 text-rose-500 shrink-0 ml-2" />}
                               </div>
                            )
                         })}
                      </div>
                   )}
                </div>
             ))}
             {!isLoading && categories.length === 0 && semantic && (
               <div className="text-center text-slate-500 text-xs py-8">
                 No functions found matching "{searchQuery}"
               </div>
             )}
          </div>
        </div>

        {/* Right Pane: Code Viewer */}
        <div className="w-2/3 flex flex-col bg-[#0a0c10] relative">
           {isLoading ? (
              <div className="flex-1 flex flex-col" role="status" aria-live="polite" aria-busy="true">
                 <div className="h-14 border-b border-[#1c1f2b] flex items-center px-4 shrink-0 bg-[#050608] space-x-2 text-xs text-slate-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Decompiling program bytecode into human-readable pseudocode...</span>
                 </div>
                 <div className="flex-1 overflow-hidden p-4">
                    <div className="bg-[#050608] rounded-xl border border-[#1c1f2b] py-2">
                       <SkeletonCodeLines lines={16} />
                    </div>
                 </div>
              </div>
           ) : !selectedFunc ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
                 <Code className="w-12 h-12 opacity-30" />
                 <p className="text-sm">Select a function from the sidebar to view its code</p>
              </div>
           ) : (
              <>
                {/* Header / Breadcrumbs */}
                <div className="h-14 border-b border-[#1c1f2b] flex items-center px-4 shrink-0 bg-[#050608] justify-between">
                   <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-500 font-bold uppercase tracking-wider">Program</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                      <span className="text-slate-400">{getFunctionCategory(selectedFunc)}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                      <span className={`font-mono font-bold ${selectedFuncHasError ? 'text-rose-400' : 'text-slate-200'}`}>
                        {selectedFunc.semanticName || selectedFunc.name}
                      </span>
                   </div>
                   
                   {selectedFuncHasError && (
                     <div 
                       onClick={() => errorLineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                       className="px-2 py-1 rounded bg-rose-950/40 border border-rose-900 text-rose-400 text-[10px] font-bold flex items-center space-x-1 cursor-pointer hover:bg-rose-900/50 transition-colors"
                     >
                        <MapPin className="w-3 h-3" />
                        <span>JUMP TO FAILURE</span>
                     </div>
                   )}
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                   {/* Semantic Operations Timeline (Condensed) */}
                   {selectedFunc.operations && selectedFunc.operations.length > 0 && (
                     <div className="bg-[#12141c] border border-[#1c1f2b] rounded-xl p-4">
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Semantic Operations</h4>
                       <div className="space-y-2">
                         {selectedFunc.operations.map((op, oidx) => {
                            const isErrorOp = targetAddrNum && isAddressInRange(targetAddrNum, op.address);
                            return (
                              <div key={oidx} className={`flex items-start space-x-3 p-2 rounded-lg border ${isErrorOp ? 'bg-rose-950/20 border-rose-900/50' : 'bg-black/20 border-white/5'}`}>
                                <div className="mt-0.5">
                                  {isErrorOp ? <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> : <Activity className="w-3.5 h-3.5 text-slate-500" />}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-xs font-bold ${isErrorOp ? 'text-rose-400' : 'text-slate-300'}`}>{op.semantic}</span>
                                    <span className="text-[10px] font-mono text-slate-500 bg-black/40 px-1.5 rounded">{op.address}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">{op.evidence}</div>
                                </div>
                              </div>
                            );
                         })}
                       </div>
                     </div>
                   )}

                   {/* Code Section */}
                   <div>
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
                       <FileCode2 className="w-3.5 h-3.5" />
                       <span>Raw Pseudocode</span>
                       {isLoadingFunc && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500 ml-2" />}
                     </h3>
                     {isLoadingFunc && getFunctionLines(selectedFunc).length === 0 ? (
                       <div className="bg-[#050608] rounded-xl border border-[#1c1f2b] py-2">
                         <SkeletonCodeLines lines={14} />
                       </div>
                     ) : (
                       renderRawLines(getFunctionLines(selectedFunc), targetAddrNum, selectedFuncHasError)
                     )}
                   </div>
                </div>
              </>
           )}
        </div>
      </div>
    </div>
  );
};

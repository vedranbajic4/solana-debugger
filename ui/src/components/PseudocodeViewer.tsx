import React, { useState } from 'react';
import { FileCode2, Loader2, Code, AlertCircle } from 'lucide-react';

interface PseudocodeViewerProps {
  programId: string;
  failureContext?: any;
  autoExpand?: boolean;
}

export const PseudocodeViewer: React.FC<PseudocodeViewerProps> = ({ programId, failureContext, autoExpand = false }) => {
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
                let inHighlightBlock = false;
                
                const targetFunc = failureContext?.function;
                const targetAddr = failureContext?.elfAddress ? `0x${failureContext.elfAddress.toString(16)}` : null;

                return lines.map((line, idx) => {
                  if (line.startsWith('/* Function: ')) {
                    if ((targetFunc && line.includes(` ${targetFunc} `)) || 
                        (targetAddr && line.includes(`@ ${targetAddr} `))) {
                      inHighlightBlock = true;
                    } else {
                      inHighlightBlock = false;
                    }
                  }

                  return (
                    <div 
                      key={idx} 
                      className={`px-3 py-0.5 whitespace-pre ${
                        inHighlightBlock ? 'bg-rose-900/30 text-rose-200 border-l-2 border-rose-500' : 'hover:bg-white/5 border-l-2 border-transparent'
                      }`}
                    >
                      {line}
                    </div>
                  );
                });
              })()}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { ShieldAlert, Code2, Cpu, AlertTriangle, Key, Layers, Terminal } from 'lucide-react';
import type { AnalysisSummary } from '../App';

interface AnchorAnalysisCardProps {
  analysisSummary?: AnalysisSummary | null;
  onInstructionClick?: (programId: string, functionName?: string) => void;
  selectedProgramId?: string | null;
}

export const AnchorAnalysisCard: React.FC<AnchorAnalysisCardProps> = ({ 
  analysisSummary,
  onInstructionClick,
  selectedProgramId
}) => {
  if (!analysisSummary) return null;

  const { decodedError, decodedInstructions, accountValidations } = analysisSummary;

  const hasDataToDisplay =
    Boolean(decodedError) ||
    (decodedInstructions && decodedInstructions.length > 0) ||
    (accountValidations && accountValidations.length > 0);

  if (!hasDataToDisplay) return null;

  return (
    <div className="space-y-6 mb-8 font-mono text-sm">
      {/* Decoded Anchor Error Banner */}
      {decodedError && (
        <div className="bg-[#121317] p-5 rounded border border-red-900/40 shadow-sm">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2 border-b border-[#2a2d36] pb-3 mb-2">
              <span className="font-bold text-base text-red-400 uppercase tracking-widest">Error: {decodedError.name}</span>
              <span className="text-slate-500 font-mono text-xs">({decodedError.hexCode} / {decodedError.code})</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{decodedError.msg}</p>
          </div>
        </div>
      )}

      {/* Account Validation Constraints Warning */}
      {accountValidations && accountValidations.length > 0 && (
        <div className="bg-[#121317] p-5 rounded border border-amber-900/40 shadow-sm">
          <div className="flex items-center space-x-2 text-amber-500/90 font-bold mb-4 border-b border-[#2a2d36] pb-3 uppercase tracking-widest text-xs">
            <span>Account Constraints ({accountValidations.length})</span>
          </div>
          <div className="space-y-3">
            {accountValidations.map((v, idx) => (
              <div key={idx} className="flex flex-col text-slate-300 text-sm bg-[#0b0c10] p-3 rounded border border-[#1e2029]">
                <span className="text-slate-500 font-bold text-xs mb-1 uppercase tracking-wider">{v.errorName}</span>
                <span>{v.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decoded Instructions List */}
      {decodedInstructions && decodedInstructions.length > 0 && (
        <div className="bg-[#0b0c10] rounded border border-[#1e2029] overflow-hidden shadow-sm">
          <div className="bg-[#121317] px-5 py-3 border-b border-[#1e2029] flex items-center justify-between">
            <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">
              Call Stack / Instructions ({decodedInstructions.length})
            </span>
            <span className="text-xs text-slate-500 uppercase tracking-widest">Parser: System & Anchor</span>
          </div>

          <div className="divide-y divide-[#1e2029] p-3 space-y-2">
            {decodedInstructions.map((ix, idx) => {
              const isSelected = selectedProgramId === ix.programId;
              const isFailed = analysisSummary.failureContext?.failedInstructionIndex === idx;

              return (
                <div 
                  key={idx} 
                  onClick={() => onInstructionClick?.(ix.programId, ix.name)}
                  className={`p-4 rounded border transition-all flex flex-col gap-3 cursor-pointer
                    ${isFailed 
                      ? (isSelected ? 'bg-[#1a0f12] border-red-900/50' : 'bg-[#120a0b] border-[#2a1315] hover:border-red-900/40') 
                      : (isSelected ? 'bg-[#151a24] border-[#2c3b59]' : 'bg-transparent border-transparent hover:bg-[#121317]')
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-slate-600 font-mono text-xs w-5 text-right">{idx}</span>
                      <span className={`font-bold text-base ${isFailed ? 'text-red-400/90' : 'text-slate-300'}`}>{ix.name}</span>
                      <span className="text-slate-500 text-xs uppercase tracking-wider">{ix.programLabel || 'Program'}</span>
                    </div>
                    {isFailed && <span className="text-red-400/90 text-xs font-bold uppercase tracking-widest border border-red-900/50 bg-red-950/20 px-2.5 py-1 rounded">Failed</span>}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs pl-10">
                    <div className="text-slate-500 font-mono flex items-center space-x-1.5">
                      <span>Prog:</span>
                      <span className="text-slate-400 truncate max-w-[150px]">{ix.programId}</span>
                    </div>
                    {ix.decodedArgs && (
                      <div className="text-slate-500 font-mono flex items-center space-x-1.5">
                        <span>Args:</span>
                        <span className="text-slate-400">{ix.decodedArgs}</span>
                      </div>
                    )}
                    {ix.discriminatorHex && (
                      <div className="text-slate-500 font-mono flex items-center space-x-1.5">
                        <span>Disc:</span>
                        <span className="text-slate-400">{ix.discriminatorHex}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

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
    <div className="space-y-4 mb-6 font-mono text-xs">
      {/* Decoded Anchor Error Banner */}
      {decodedError && (
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-rose-500 bg-rose-950/20 border-rose-500/30 shadow-sm">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-rose-300">{decodedError.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-semibold text-[11px]">
                    Code: {decodedError.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-semibold text-[11px]">
                    Hex: {decodedError.hexCode}
                  </span>
                </div>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">{decodedError.msg}</p>
            </div>
          </div>
        </div>
      )}

      {/* Account Validation Constraints Warning */}
      {accountValidations && accountValidations.length > 0 && (
        <div className="glass-panel p-4 rounded-xl border-l-4 border-l-amber-500 bg-amber-950/20 border-amber-500/30">
          <div className="flex items-center space-x-2 text-amber-400 font-bold mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Account Constraint Violations ({accountValidations.length})</span>
          </div>
          <div className="space-y-1.5">
            {accountValidations.map((v, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-amber-200/90 text-xs bg-amber-500/10 p-2 rounded border border-amber-500/20">
                <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 font-bold text-[10px]">
                  {v.errorName}
                </span>
                <span className="truncate">{v.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decoded Instructions List */}
      {decodedInstructions && decodedInstructions.length > 0 && (
        <div className="glass-panel rounded-2xl border border-[#1e222d] overflow-hidden shadow-xl">
          <div className="bg-[#12141d] px-6 py-3 border-b border-[#1c1f2b] flex items-center justify-between">
            <div className="flex items-center space-x-2 font-bold text-white uppercase tracking-wider">
              <Code2 className="w-4 h-4 text-solana-green" />
              <span>Decoded Instructions & Method Calls ({decodedInstructions.length})</span>
            </div>
            <span className="text-[10px] text-solana-muted">System & Anchor Instruction Parser</span>
          </div>

          <div className="divide-y divide-[#181b26] p-4 space-y-3 bg-[#0a0b10]">
            {decodedInstructions.map((ix, idx) => {
              const isSelected = selectedProgramId === ix.programId;
              const isFailed = analysisSummary.failureContext?.failedInstructionIndex === idx;

              return (
                <div 
                  key={idx} 
                  onClick={() => onInstructionClick?.(ix.programId, ix.name)}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer
                    ${isFailed 
                      ? (isSelected ? 'bg-rose-900/40 border-rose-500' : 'bg-rose-950/20 border-rose-500/50 hover:border-rose-500') 
                      : (isSelected ? 'bg-solana-purple/10 border-solana-purple' : 'bg-[#12141c] border-[#1c1f2b] hover:border-solana-purple/40')
                    }
                  `}
                >
                  <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isFailed ? 'bg-rose-500/20 border border-rose-500/40' : 'bg-solana-purple/20 border border-solana-purple/40'
                  }`}>
                    <Cpu className={`w-4 h-4 ${isFailed ? 'text-rose-400' : 'text-solana-purple'}`} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded border font-semibold text-[10px] flex items-center space-x-1 ${
                        isFailed ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' : 'bg-solana-purple/15 border-solana-purple/30 text-solana-purple'
                      }`}>
                        <Layers className="w-3 h-3" />
                        <span>{ix.programLabel || 'Program'}</span>
                      </span>

                      <span className={`font-bold text-sm ${isFailed ? 'text-rose-400' : 'text-solana-green'}`}>{ix.name}</span>

                      {isFailed && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-[10px]">
                          FAILED
                        </span>
                      )}

                      {ix.discriminatorHex && (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px]">
                          Disc: {ix.discriminatorHex}
                        </span>
                      )}
                    </div>

                    {/* Decoded Arguments Row */}
                    {ix.decodedArgs && (
                      <div className="flex items-center space-x-1.5 text-amber-300 text-xs font-semibold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 w-fit">
                        <Terminal className="w-3 h-3 text-amber-400" />
                        <span>Parsed Args: {ix.decodedArgs}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-1 text-solana-muted text-[11px]">
                      <Key className="w-3 h-3 text-slate-500" />
                      <span className="truncate max-w-xs">{ix.programId}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 bg-[#0b0c10] p-2 rounded-lg border border-[#1c1f2b] shrink-0 max-w-full overflow-x-auto">
                  <span className="text-solana-muted select-none">Raw Hex:</span>
                  <span className="text-cyan-300 truncate max-w-xs">{ix.dataHex || '0x'}</span>
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

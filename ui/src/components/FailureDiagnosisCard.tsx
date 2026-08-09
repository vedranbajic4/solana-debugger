import React from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';
import type { FailureDiagnosis } from '../utils/diagnosis';

interface FailureDiagnosisCardProps {
  diagnosis: FailureDiagnosis | null;
}

export const FailureDiagnosisCard: React.FC<FailureDiagnosisCardProps> = ({ diagnosis }) => {
  if (!diagnosis) return null;

  return (
    <div className="glass-panel p-6 rounded-lg border border-rose-900/50 bg-rose-950/10 mb-6 font-mono text-xs relative overflow-hidden">
      {/* Background removed for professional look */}

      {/* Header */}
      <div className="flex items-center space-x-3 text-rose-400 mb-6 border-b border-rose-500/20 pb-4">
        <AlertTriangle className="w-7 h-7 shrink-0" />
        <span className="font-bold text-lg uppercase tracking-widest text-rose-400">
          Transaction Failed
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: What & Why */}
        <div className="space-y-6">
          <div>
            <div className="text-[10px] text-rose-500/70 uppercase tracking-widest font-bold mb-1">What failed?</div>
            <div className="font-bold text-base text-rose-200">
              {diagnosis.category.toUpperCase()}
            </div>
            <div className="text-sm font-semibold text-rose-400 mt-1">
              {diagnosis.title}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-rose-500/70 uppercase tracking-widest font-bold mb-1">Why?</div>
            <p className="text-rose-100/80 text-sm leading-relaxed max-w-md">
              {diagnosis.explanation}
            </p>
          </div>
          
          <div>
            <div className="text-[10px] text-rose-500/70 uppercase tracking-widest font-bold mb-1">Confidence</div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-32 bg-rose-950 rounded-full overflow-hidden border border-rose-900/50">
                <div 
                  className="h-full bg-rose-500"
                  style={{ width: `${diagnosis.confidence}%` }}
                />
              </div>
              <span className="text-rose-300 font-bold">{diagnosis.confidence}%</span>
            </div>
          </div>
        </div>

        {/* Right Column: Where */}
        <div 
          className="bg-[#050608] rounded-xl border border-rose-900/50 p-5 relative cursor-pointer hover:border-rose-700/50 hover:bg-[#0a0b0e] transition-colors group"
          onClick={() => {
            const el = document.getElementById('pseudocode-error-line');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          title="Click to view in pseudocode"
        >
          <div className="absolute -top-3 left-4 bg-rose-900/40 border border-rose-900/30 px-3 py-1 rounded-full text-[10px] text-rose-300 font-bold uppercase tracking-widest group-hover:bg-rose-900/60 transition-colors">
            Most likely location
          </div>
          
          <div className="space-y-4 mt-2">
            <div className="flex items-start space-x-3 mb-4">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                
                {diagnosis.programId && (
                  <div className="flex flex-col">
                    <span className="text-rose-500/70 text-[10px] uppercase font-bold">Program</span>
                    <span className="text-rose-200 truncate">{diagnosis.programId}</span>
                  </div>
                )}
                
                {diagnosis.function && (
                  <div className="flex flex-col">
                    <span className="text-rose-500/70 text-[10px] uppercase font-bold">Function</span>
                    <span className="text-rose-300 font-bold">{diagnosis.function}()</span>
                  </div>
                )}

                {diagnosis.runtimePc != null && (
                  <div className="flex flex-col">
                    <span className="text-rose-500/70 text-[10px] uppercase font-bold">Runtime PC</span>
                    <span className="text-rose-200 bg-rose-950/50 px-2 py-0.5 rounded w-fit border border-rose-900/50">
                      0x{Number(diagnosis.runtimePc).toString(16).toUpperCase()}
                    </span>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

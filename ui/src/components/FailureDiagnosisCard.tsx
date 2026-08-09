import React from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';
import type { FailureDiagnosis } from '../utils/diagnosis';

interface FailureDiagnosisCardProps {
  diagnosis: FailureDiagnosis | null;
}

export const FailureDiagnosisCard: React.FC<FailureDiagnosisCardProps> = ({ diagnosis }) => {
  if (!diagnosis) return null;

  return (
    <div className="bg-[#121317] p-6 rounded border border-[#2a2d36] mb-6 font-mono text-sm shadow-sm">
      <div className="flex items-center space-x-2 text-red-400/90 mb-5 pb-3 border-b border-[#2a2d36]">
        <span className="font-bold text-lg uppercase tracking-widest">
          Transaction Execution Failure
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Category</div>
            <div className="text-base text-slate-300 font-semibold">{diagnosis.category.toUpperCase()}</div>
            <div className="text-sm text-slate-400 mt-1">{diagnosis.title}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Reason</div>
            <p className="text-slate-400 text-base leading-relaxed">
              {diagnosis.explanation}
            </p>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Confidence Score</div>
            <div className="text-sm text-slate-300 font-bold">{diagnosis.confidence}%</div>
          </div>
        </div>

        <div 
          className="bg-[#0b0c10] rounded border border-[#1e2029] p-5 relative cursor-pointer hover:border-[#3a3d4a] transition-colors"
          onClick={() => {
            const el = document.getElementById('pseudocode-error-line');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          title="Click to view in pseudocode"
        >
          <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-4 border-b border-[#1e2029] pb-3">
            Fault Location
          </div>
          <div className="space-y-4">
            {diagnosis.programId && (
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs uppercase font-bold">Program</span>
                <span className="text-slate-300 text-sm truncate">{diagnosis.programId}</span>
              </div>
            )}
            {diagnosis.function && (
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs uppercase font-bold">Function</span>
                <span className="text-slate-300 text-sm font-bold">{diagnosis.function}()</span>
              </div>
            )}
            {diagnosis.runtimePc != null && (
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs uppercase font-bold">Runtime PC</span>
                <span className="text-slate-300 text-sm font-mono">
                  0x{Number(diagnosis.runtimePc).toString(16).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { CheckCircle2, XCircle, Gauge, Database, Hash } from 'lucide-react';

interface MetricsHeaderProps {
  signature: string;
  bytecodeText: string;
}

export const MetricsHeader: React.FC<MetricsHeaderProps> = ({ signature, bytecodeText }) => {
  if (!bytecodeText) return null;

  // Extract metadata from bytecodeText header
  const statusSuccess = bytecodeText.includes('SUCCESS') || bytecodeText.includes('SUCCESS ✅');
  const slotMatch = bytecodeText.match(/Slot:\s+(\d+)/);
  const slot = slotMatch ? slotMatch[1] : 'N/A';

  const cuMatch = bytecodeText.match(/Compute Units Consumed:\s+(\d+)/i) || bytecodeText.match(/Compute Units:\s+(\d+)/i);
  const computeUnits = cuMatch ? parseInt(cuMatch[1]).toLocaleString() : 'N/A';

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Execution Status */}
      <div className="glass-panel p-4 rounded-xl border-l-4 border-l-solana-green flex items-center space-x-3">
        {statusSuccess ? (
          <CheckCircle2 className="w-8 h-8 text-solana-green flex-shrink-0" />
        ) : (
          <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
        )}
        <div>
          <p className="text-xs text-solana-muted font-mono uppercase">Execution Status</p>
          <p className={`font-bold text-sm font-mono ${statusSuccess ? 'text-solana-green' : 'text-red-400'}`}>
            {statusSuccess ? 'SUCCESS' : 'FAILED'}
          </p>
        </div>
      </div>

      {/* Compute Units */}
      <div className="glass-panel p-4 rounded-xl border-l-4 border-l-solana-purple flex items-center space-x-3">
        <Gauge className="w-8 h-8 text-solana-purple flex-shrink-0" />
        <div>
          <p className="text-xs text-solana-muted font-mono uppercase">Compute Units</p>
          <p className="font-bold text-sm font-mono text-white">{computeUnits} CU</p>
        </div>
      </div>

      {/* Slot Number */}
      <div className="glass-panel p-4 rounded-xl border-l-4 border-l-blue-500 flex items-center space-x-3">
        <Database className="w-8 h-8 text-blue-400 flex-shrink-0" />
        <div>
          <p className="text-xs text-solana-muted font-mono uppercase">On-Chain Slot</p>
          <p className="font-bold text-sm font-mono text-white">{slot}</p>
        </div>
      </div>

      {/* Signature Summary */}
      <div className="glass-panel p-4 rounded-xl border-l-4 border-l-slate-600 flex items-center space-x-3">
        <Hash className="w-8 h-8 text-slate-400 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-solana-muted font-mono uppercase">Signature</p>
          <p className="font-bold text-xs font-mono text-slate-200 truncate">
            {signature || 'Local Simulation'}
          </p>
        </div>
      </div>
    </div>
  );
};

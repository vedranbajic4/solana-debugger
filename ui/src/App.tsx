import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { TransactionInput } from './components/TransactionInput';
import { MetricsHeader } from './components/MetricsHeader';
import { AnchorAnalysisCard } from './components/AnchorAnalysisCard';
import { BytecodeViewer } from './components/BytecodeViewer';
import { SourceCodeViewer } from './components/SourceCodeViewer';
import { FailureDiagnosisCard } from './components/FailureDiagnosisCard';
import { generateDiagnosis, type FailureDiagnosis } from './utils/diagnosis';
import { getNetwork, loadStoredNetwork, storeNetwork, type NetworkId } from './networks';
import { AlertCircle, Cpu } from 'lucide-react';

export interface DecodedError {
  code: number;
  hexCode: string;
  name: string;
  msg: string;
}

export interface DecodedInstruction {
  programId: string;
  programLabel?: string;
  name: string;
  discriminatorHex: string;
  decodedArgs?: string | null;
  dataHex: string;
}

export interface AccountValidation {
  programId: string;
  errorName: string;
  message: string;
}

export interface AnalysisSummary {
  signature: string;
  slot: number;
  executionStatus: string;
  computeUnits?: number;
  decodedError?: DecodedError | null;
  decodedInstructions: DecodedInstruction[];
  accountValidations: AccountValidation[];
  sourceContext?: any;
  failureContext?: any;
}

export interface ChunkData {
  success: boolean;
  signature: string;
  chunk: string;
  chunkLines: string[];
  vmLogs: string;
  analysisSummary?: AnalysisSummary | null;
  page: number;
  totalPages: number;
  chunkSize: number;
  totalLines: number;
  startIndex: number;
  endIndex: number;
  hasPrevious: boolean;
  hasNext: boolean;
  metrics: {
    statusSuccess: boolean;
    slot: string;
    computeUnits: string;
  };
}

export function App() {
  const [signature, setSignature] = useState<string>('');
  const [chunkData, setChunkData] = useState<ChunkData | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [chunkSize, setChunkSize] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNavigatingChunk, setIsNavigatingChunk] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedFunctionName, setSelectedFunctionName] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<FailureDiagnosis | null>(null);
  const [network, setNetwork] = useState<NetworkId>(() => loadStoredNetwork());

  const handleAnalyze = async (
    sigToAnalyze?: string,
    targetPage = 1,
    targetChunkSize = chunkSize,
    force = false,
    targetNetwork: NetworkId = network
  ) => {
    const targetSig = (sigToAnalyze !== undefined ? sigToAnalyze : signature).trim();
    if (!targetSig) {
      setError('Please enter a valid Solana transaction signature hash.');
      return;
    }

    if (chunkData && targetSig === signature && !force) {
      setIsNavigatingChunk(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature: targetSig,
          page: targetPage,
          chunkSize: targetChunkSize,
          force,
          network: targetNetwork,
          rpcUrl: getNetwork(targetNetwork).rpcUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze transaction bytecode');
      }

      setChunkData(data);
      setCurrentPage(data.page);
      setChunkSize(data.chunkSize);
      
      // Auto-select failing program if any
      if (data.analysisSummary?.failureContext?.failedProgramId) {
        setSelectedProgramId(data.analysisSummary.failureContext.failedProgramId);
        setSelectedFunctionName(data.analysisSummary.failureContext.function || null);
      } else {
        setSelectedProgramId(null);
        setSelectedFunctionName(null);
      }

      const execStatus = data.analysisSummary?.execution_status || data.analysisSummary?.executionStatus || "";
      const hasError = data.analysisSummary?.decodedError || 
                       (typeof execStatus === 'string' && (execStatus.includes("Error") || execStatus.includes("failed") || execStatus.includes("exceeded")));
      if (hasError) {
        setDiagnosis(generateDiagnosis(data.analysisSummary, data.analysisSummary?.failureContext));
      } else {
        setDiagnosis(null);
      }
    } catch (err: any) {
      console.error('Error fetching analysis:', err);
      setError(err.message || 'Could not connect to Solana Debugger backend (localhost:3001)');
    } finally {
      setIsLoading(false);
      setIsNavigatingChunk(false);
    }
  };

  const handleClear = () => {
    setSignature('');
    setChunkData(null);
    setCurrentPage(1);
    setError(null);
    setSelectedProgramId(null);
    setSelectedFunctionName(null);
    setDiagnosis(null);
  };

  const handleNextChunk = () => {
    if (chunkData && chunkData.hasNext && !isLoading && !isNavigatingChunk) {
      handleAnalyze(signature, currentPage + 1, chunkSize);
    }
  };

  const handlePreviousChunk = () => {
    if (chunkData && chunkData.hasPrevious && !isLoading && !isNavigatingChunk) {
      handleAnalyze(signature, currentPage - 1, chunkSize);
    }
  };

  const handleJumpToPage = (page: number) => {
    if (chunkData && page >= 1 && page <= chunkData.totalPages && !isLoading && !isNavigatingChunk) {
      handleAnalyze(signature, page, chunkSize);
    }
  };

  const handleChangeChunkSize = (newSize: number) => {
    setChunkSize(newSize);
    if (chunkData) {
      handleAnalyze(signature, 1, newSize);
    }
  };

  const handleNetworkChange = (newNetwork: NetworkId) => {
    setNetwork(newNetwork);
    storeNetwork(newNetwork);
    // Re-run the tracer against the newly selected cluster
    if (signature.trim()) {
      handleAnalyze(signature, 1, chunkSize, true, newNetwork);
    }
  };

  const handleInstructionClick = (programId: string, functionName?: string) => {
    setSelectedProgramId(programId);
    setSelectedFunctionName(functionName || null);
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-100 flex flex-col selection:bg-solana-purple selection:text-white">
      {/* Navbar */}
      <Navbar network={network} onNetworkChange={handleNetworkChange} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Controls */}
        <TransactionInput
          signature={signature}
          setSignature={setSignature}
          onAnalyze={() => handleAnalyze(signature, 1, chunkSize, true)}
          onClear={handleClear}
          isLoading={isLoading}
          hasData={Boolean(chunkData)}
        />

        {/* Error Alert */}
        {error && (
          <div className="glass-panel p-4 rounded-xl border-l-4 border-l-red-500 text-red-300 text-sm font-mono flex items-center space-x-3 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <div className="flex-1">
              <p className="font-bold">Execution Error</p>
              <p className="text-xs text-red-300/80">{error}</p>
              <p className="text-xs text-solana-muted mt-1">
                Make sure the backend server is running (<span className="text-solana-purple font-mono">make run</span> or <span className="text-solana-green font-mono">npm run server</span> in <span className="text-solana-green font-mono">ui/</span>).
              </p>
            </div>
          </div>
        )}

        {/* Status Metrics */}
        <MetricsHeader signature={signature} metrics={chunkData?.metrics} />

        {/* Diagnosis Engine Panel */}
        <FailureDiagnosisCard diagnosis={diagnosis} />

        {/* High-Level Decoded Anchor Analysis Card */}
        <AnchorAnalysisCard 
          analysisSummary={chunkData?.analysisSummary} 
          onInstructionClick={handleInstructionClick}
          selectedProgramId={selectedProgramId}
        />

        {/* Source Code View (if available) */}
        <SourceCodeViewer 
          sourceContext={chunkData?.analysisSummary?.sourceContext}
          failureContext={chunkData?.analysisSummary?.failureContext}
          selectedProgramId={selectedProgramId}
          selectedFunctionName={selectedFunctionName}
          isLoading={isLoading}
        />

        {/* Main Code & Disassembly Viewer */}
        <BytecodeViewer
          bytecodeText={chunkData?.chunk || ''}
          chunkData={chunkData}
          onPreviousChunk={handlePreviousChunk}
          onNextChunk={handleNextChunk}
          onJumpToPage={handleJumpToPage}
          onChangeChunkSize={handleChangeChunkSize}
          isNavigatingChunk={isNavigatingChunk}
          isLoading={isLoading}
          onClear={handleClear}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-solana-border py-6 text-center text-xs font-mono text-solana-muted glass-panel mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 gap-2">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-solana-green" />
            <span>Solana Debugger & SBF Tracer Engine (Agave / solana-sdk)</span>
          </div>
          <div>Bytecode Iterator & Anchor IDL Decoder Active</div>
        </div>
      </footer>
    </div>
  );
}

export default App;

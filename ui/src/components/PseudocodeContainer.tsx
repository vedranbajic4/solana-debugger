import React, { useState, useCallback, useEffect } from 'react';
import { ProgramExplorer } from './ProgramExplorer';
import type { ProgramSemantic } from '../utils/semanticAnalyzer';

interface PseudocodeContainerProps {
  programId: string;
  failureContext?: any;
  autoExpand?: boolean;
}

export const PseudocodeContainer: React.FC<PseudocodeContainerProps> = ({
  programId,
  failureContext,
  autoExpand = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [rawPseudocode, setRawPseudocode] = useState<string | null>(null);
  const [semantic, setSemantic] = useState<ProgramSemantic | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAndAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/pseudocode/${programId}`);
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to decompile program');
      }
      
      setSemantic(data.semantic);
    } catch (err: any) {
      console.error('Error fetching semantic data:', err);
      setError(err.message || 'Error running Ghidra decompiler');
    } finally {
      setIsLoading(false);
    }
  }, [programId]);

  // Reset when programId changes
  useEffect(() => {
    setRawPseudocode(null);
    setSemantic(null);
    setError(null);
    if (autoExpand) {
      fetchAndAnalyze();
    }
  }, [programId, autoExpand, fetchAndAnalyze]);

  return (
    <ProgramExplorer
      programId={programId}
      semantic={semantic}
      rawPseudocode={rawPseudocode}
      isLoading={isLoading}
      error={error}
      failureContext={failureContext}
      onFetch={fetchAndAnalyze}
    />
  );
};

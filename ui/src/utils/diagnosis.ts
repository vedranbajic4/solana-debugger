export interface FailureDiagnosis {
  category: string;
  title: string;
  explanation: string;
  confidence: number;
  programId?: string;
  instructionIndex?: number;
  function?: string;
  runtimePc?: number;
  sourceLocation?: any;
  pseudocodeLocation?: number;
}

export function generateDiagnosis(analysisSummary: any, failureContext: any): FailureDiagnosis {
  let category = "Unknown error";
  let title = "Unknown cause";
  let explanation = "Insufficient information to determine the exact reason.";
  let confidence = 50;

  if (analysisSummary) {
    if (analysisSummary.decodedError) {
      const name = analysisSummary.decodedError.name || "";
      const msg = analysisSummary.decodedError.msg || "";
      confidence = 96;
      
      if (name.includes("Constraint") || name.includes("Account")) {
         if (name.includes("NotInitialized") || name.includes("Uninitialized")) {
           category = "Invalid account";
           title = "Account not initialized";
         } else if (name.includes("WrongProgram") || name.includes("InvalidOwner")) {
           category = "Invalid owner";
           title = "Invalid owner";
         } else {
           category = "Constraint violation";
           title = "Constraint violation";
         }
      } else if (name.includes("InsufficientFunds") || name.includes("InsufficientFundsForRent") || name.toLowerCase().includes("balance")) {
        category = "Insufficient funds";
        title = "Insufficient funds / balance";
      } else if (name.includes("Signature") || name.includes("Signer")) {
        category = "Missing signer";
        title = "Missing signer";
      } else if (name.includes("Overflow") || name.includes("Underflow")) {
        category = "Arithmetic overflow/underflow";
        title = "Arithmetic overflow/underflow";
      } else {
        category = "Program/custom error";
        title = name || "Unknown error";
      }
      explanation = msg;
    } else if (analysisSummary.accountValidations && analysisSummary.accountValidations.length > 0) {
      const val = analysisSummary.accountValidations[0];
      category = "Constraint violation";
      title = val.errorName || "Constraint violation";
      explanation = val.message || "An account failed validation constraints.";
      confidence = 90;
    } else if (analysisSummary.execution_status || analysisSummary.executionStatus) {
      const status = (analysisSummary.execution_status || analysisSummary.executionStatus || "");
      confidence = 85;
      if (typeof status === 'string') {
        if (status.includes("insufficient funds") || status.includes("insufficient lamports")) {
          category = "Insufficient funds";
          title = "Insufficient funds / balance";
          explanation = "The program attempted to use more funds than were available in the source account.";
        } else if (status.includes("instruction data") || status.includes("invalid instruction data")) {
          category = "Invalid instruction data";
          title = "Invalid instruction data";
          explanation = "The instruction data provided to the program is invalid or malformed.";
        } else if (status.includes("unauthorized") || status.includes("privilege escalated")) {
          category = "Missing signer";
          title = "Unauthorized operation";
          explanation = "The program attempted an operation it does not have permission for (e.g. cross-program privilege escalation).";
        } else if (status.includes("Cross-program invocation with unauthorized signer")) {
          category = "Missing signer";
          title = "Missing signer";
          explanation = "A required signature was missing for a cross-program invocation.";
        } else if (status.includes("exceeded maximum number of instructions") || status.includes("Compute budget exceeded")) {
          category = "Compute budget exceeded";
          title = "Compute budget exceeded";
          explanation = "The program exceeded its allowed compute budget.";
        } else if (status.includes("memory allocation failed") || status.includes("out of bounds") || status.includes("Access violation") || status.includes("out of bounds memory access")) {
          category = "Out-of-bounds/memory error";
          title = "Out-of-bounds / memory access";
          explanation = "The program attempted to read or write memory out of bounds.";
        } else if (status.includes("Custom")) {
          category = "Program/custom error";
          title = "Program-specific/custom error";
          explanation = status;
        } else if (status !== "Success" && status.includes("Error")) {
          category = "Unknown error";
          title = "Unknown cause";
          explanation = "Insufficient information to determine the exact reason. Solana error: " + status;
          confidence = 40;
        }
      }
    }
  }

  return {
    category,
    title,
    explanation,
    confidence,
    programId: failureContext?.failedProgramId,
    instructionIndex: failureContext?.failedInstructionIndex,
    function: failureContext?.function,
    runtimePc: failureContext?.runtimePc || failureContext?.elfAddress,
    sourceLocation: failureContext?.sourceLocation,
  };
}

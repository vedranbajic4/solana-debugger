export interface SemanticOperation {
  line: number;           // 0-indexed line in raw pseudocode
  address: string;        // e.g. "0x140-0x168"
  semantic: string;       // human-readable label like "validate_account_count"
  confidence: number;     // 0.0 to 1.0
  evidence: string;       // what pattern was matched
  raw: string;            // the original C line (trimmed)
}

export interface SemanticFunction {
  name: string;           // original Ghidra name e.g. "sub_0x00138"
  address: string;        // entry address e.g. "0x138"
  semanticName: string;   // inferred name e.g. "process_instruction"
  semanticRole: string;   // role category
  confidence: number;
  evidence: string[];
  operations: SemanticOperation[];
  callees: string[];      // names of called functions
  startLine: number;      // line range in raw pseudocode
  endLine: number;
}

export interface ProgramSemantic {
  functions: SemanticFunction[];
  entrypoint: string | null;
  programType: 'anchor' | 'native' | 'unknown';
  totalFunctions: number;
  rawLineCount: number;
}

export function analyzePseudocode(rawCode: string): ProgramSemantic {
  const lines = rawCode.split('\n');
  const functions: SemanticFunction[] = [];
  
  let currentFunc: SemanticFunction | null = null;
  
  const functionStartRegex = /\/\*\s*Function:\s*([^\s]+)\s*@\s*(0x[0-9a-fA-F]+)\s*\*\//;
  const addrAnnotationRegex = /\/\/\s*@\s*(0x[0-9a-fA-F]+(?:-0x[0-9a-fA-F]+)?)\s*$/;
  // Basic C function call extraction (heuristic)
  const callRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
  
  let hasAnchorDiscriminator = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const match = rawLine.match(functionStartRegex);
    
    if (match) {
      if (currentFunc) {
        currentFunc.endLine = i - 1;
        finalizeFunction(currentFunc);
      }
      
      currentFunc = {
        name: match[1],
        address: match[2],
        semanticName: match[1], // default to original
        semanticRole: 'unknown',
        confidence: 0.0,
        evidence: [],
        operations: [],
        callees: [],
        startLine: i,
        endLine: -1,
      };
      functions.push(currentFunc);
      continue;
    }
    
    if (currentFunc) {
      // Extract callees
      let callMatch;
      while ((callMatch = callRegex.exec(rawLine)) !== null) {
        const callee = callMatch[1];
        // Ignore common C keywords that look like function calls
        if (!['if', 'while', 'for', 'return', 'sizeof', 'switch'].includes(callee)) {
          // Ignore the function declaration line itself (typically not indented)
          if (callee === currentFunc.name && !/^\s+/.test(rawLine)) {
            continue;
          }
          if (!currentFunc.callees.includes(callee)) {
            currentFunc.callees.push(callee);
          }
        }
      }
      
      // Extract address annotation and raw content
      let address = '';
      let rawCodeContent = rawLine;
      const addrMatch = rawLine.match(addrAnnotationRegex);
      if (addrMatch) {
        address = addrMatch[1];
        rawCodeContent = rawLine.substring(0, addrMatch.index).trim();
      } else {
        rawCodeContent = rawLine.trim();
      }
      
      if (!rawCodeContent) continue;
      
      // Program type detection logic (anchor discriminator dispatch)
      if (rawCodeContent.includes('*(uint64_t *)') && rawCodeContent.includes('instruction_data') && rawCodeContent.includes('==')) {
          hasAnchorDiscriminator = true;
      }
      
      // Collect global evidence
      if (rawCodeContent.includes('_DAT_ram_300000000')) {
          currentFunc.evidence.push('references _DAT_ram_300000000');
      }
      
      // Line-Level Patterns
      let op: SemanticOperation | null = null;
      
      if (rawCodeContent.includes('0x8000000000000000')) {
        op = { line: i, address, semantic: 'return_error', confidence: 0.9, evidence: 'Sets high bit = Solana error return', raw: rawCodeContent };
      } else if (rawCodeContent.includes('0x800000000000001a')) {
        op = { line: i, address, semantic: 'check_success', confidence: 0.85, evidence: 'SUCCESS = 0x1a with error flag', raw: rawCodeContent };
      } else if (/\*\s*\(\s*[a-zA-Z0-9_]+\s*\*\s*\)\s*\(\s*[a-zA-Z0-9_]+\s*\+\s*1\s*\)/.test(rawCodeContent)) {
        op = { line: i, address, semantic: 'check_signer', confidence: 0.8, evidence: 'offset 1 checked against 0', raw: rawCodeContent };
      } else if (/\*\s*\(\s*[a-zA-Z0-9_]+\s*\*\s*\)\s*\(\s*[a-zA-Z0-9_]+\s*\+\s*2\s*\)/.test(rawCodeContent)) {
        op = { line: i, address, semantic: 'check_writable', confidence: 0.8, evidence: 'offset 2 checked against 0', raw: rawCodeContent };
      } else if (rawCodeContent.includes('+ 0x30') && (rawCodeContent.includes('while') || rawCodeContent.includes('for') || currentFunc.operations.some(o => o.semantic === 'iterate_accounts'))) { 
        // heuristic for loop or just observing stride
        op = { line: i, address, semantic: 'iterate_accounts', confidence: 0.85, evidence: 'account struct size = 0x30 = 48 bytes', raw: rawCodeContent };
      } else if (rawCodeContent.includes('sol_log_')) {
        op = { line: i, address, semantic: 'log_message', confidence: 1.0, evidence: 'sol_log_ call', raw: rawCodeContent };
      } else if (rawCodeContent.includes('sol_sha256')) {
        op = { line: i, address, semantic: 'compute_hash', confidence: 1.0, evidence: 'sol_sha256 call', raw: rawCodeContent };
      } else if (rawCodeContent.includes('sol_create_program_address') || rawCodeContent.includes('sol_try_find_program_address')) {
        op = { line: i, address, semantic: 'derive_pda', confidence: 1.0, evidence: 'derive pda call', raw: rawCodeContent };
      } else if (rawCodeContent.includes('sub_0x00878') && rawCodeContent.includes(',')) {
        op = { line: i, address, semantic: 'allocate_memory', confidence: 0.7, evidence: 'heap alloc function called with size args', raw: rawCodeContent };
      } else if (/\*\(\s*uint32_t\s*\*\s*\)\s*\(\s*[a-zA-Z0-9_]+\s*\+\s*1\s*\)\s*=\s*[0-9]+/.test(rawCodeContent)) {
        op = { line: i, address, semantic: 'set_error_code', confidence: 0.85, evidence: 'set small integer after error flag', raw: rawCodeContent };
      } else if (/-\s*0x[0-9a-fA-F]{10,16}/.test(rawCodeContent) && rawCodeContent.includes('if')) {
        op = { line: i, address, semantic: 'check_pubkey', confidence: 0.75, evidence: 'Comparisons of 8-byte constants in if-chains', raw: rawCodeContent };
      } else if (rawCodeContent.includes('*(uint64_t *)') && rawCodeContent.includes('+ 0x10')) {
        op = { line: i, address, semantic: 'modify_ref_count', confidence: 0.7, evidence: 'Assignment to *(uint64_t *)(X + 0x10)', raw: rawCodeContent };
      } else if (/param_3\s*\+\s*0x([0-9a-fA-F]+)/.test(rawCodeContent)) {
        const offsetMatch = rawCodeContent.match(/param_3\s*\+\s*0x([0-9a-fA-F]+)/);
        if (offsetMatch && parseInt(offsetMatch[1], 16) % 0x30 === 0) {
          op = { line: i, address, semantic: 'access_account', confidence: 0.8, evidence: 'access to param_3 + offset (multiple of 0x30)', raw: rawCodeContent };
        }
      } else if (rawCodeContent.includes('memcmp')) {
        op = { line: i, address, semantic: 'compare_pubkey', confidence: 0.8, evidence: 'memcmp or 32-byte sequential comparisons', raw: rawCodeContent };
      }
      
      if (op) {
        currentFunc.operations.push(op);
      }
    }
  }
  
  if (currentFunc) {
    currentFunc.endLine = lines.length - 1;
    finalizeFunction(currentFunc);
  }

  // Program type detection
  let programType: 'anchor' | 'native' | 'unknown' = 'unknown';
  let entrypointName: string | null = null;
  
  const entrypointFunc = functions.find(f => f.name === 'entrypoint' || f.semanticName === 'entrypoint');
  
  if (entrypointFunc) {
    entrypointName = entrypointFunc.name;
    if (hasAnchorDiscriminator) {
      programType = 'anchor';
    } else {
      programType = 'native';
    }
  } else if (hasAnchorDiscriminator) {
    programType = 'anchor';
  }

  // Special pattern: instruction_dispatcher
  if (entrypointFunc) {
    for (const calleeName of entrypointFunc.callees) {
      const callee = functions.find(f => f.name === calleeName);
      // Rough heuristic: received input buffer and has large param count - we'll just check if it exists for now as we don't have argument counts easily,
      // but if the function is called from entrypoint and does lots of checks, maybe it's the dispatcher.
      // Let's just follow the instruction to mark it if "called from entrypoint that receives input buffer and has large parameter count".
      // Since we don't parse params perfectly, let's mark the largest function called by entrypoint if it has many operations.
      if (callee && callee.operations.length > 5 && !callee.semanticName) {
        callee.semanticName = 'instruction_dispatcher';
        callee.semanticRole = 'instruction_dispatcher';
        callee.confidence = 0.75;
        callee.evidence.push('called from entrypoint, large function');
      }
    }
  }

  return {
    functions,
    entrypoint: entrypointName,
    programType,
    totalFunctions: functions.length,
    rawLineCount: lines.length
  };
}

function finalizeFunction(f: SemanticFunction) {
  // Check for Function-Level Patterns
  if (f.name === 'entrypoint') {
    f.semanticName = 'entrypoint';
    f.semanticRole = 'program_entry';
    f.confidence = 1.0;
    f.evidence.push('function named entrypoint');
  } else if (f.name.includes('panic_handler') || f.name.includes('sol_panic_') || f.name.includes('custom_panic')) {
    f.semanticName = 'panic_handler';
    f.semanticRole = 'error_handler';
    f.confidence = 0.95;
    f.evidence.push('contains panic keywords');
  } else if (f.name.includes('invoke_cpi') || f.callees.some(c => c.includes('sol_invoke_signed_c'))) {
    f.semanticName = 'invoke_cpi';
    f.semanticRole = 'cpi_caller';
    f.confidence = 0.95;
    f.evidence.push('contains cpi caller pattern');
  } else if (f.name === 'abort') {
    f.semanticName = 'abort';
    f.semanticRole = 'abort';
    f.confidence = 1.0;
    f.evidence.push('function named abort');
  } else if (f.callees.length === 1 && f.callees[0] === f.name) {
    f.semanticName = 'infinite_loop';
    f.semanticRole = 'infinite_loop';
    f.confidence = 0.9;
    f.evidence.push('only calls itself (infinite recursion)');
  } else if (f.endLine - f.startLine <= 3 && f.callees.length === 0 && f.operations.length === 0) {
    f.semanticName = 'noop';
    f.semanticRole = 'noop';
    f.confidence = 1.0;
    f.evidence.push('empty body (just return)');
  } else if (f.evidence.some(e => e.includes('_DAT_ram_300000000'))) {
    f.semanticName = 'heap_allocator';
    f.semanticRole = 'heap_allocator';
    f.confidence = 0.85;
  }
}

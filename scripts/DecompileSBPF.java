import ghidra.app.script.GhidraScript;
import ghidra.app.decompiler.DecompInterface;
import ghidra.app.decompiler.DecompileResults;
import ghidra.program.model.listing.*;
import ghidra.program.model.data.*;
import ghidra.program.model.symbol.*;
import ghidra.program.model.lang.Register;
import ghidra.app.decompiler.ClangNode;
import ghidra.app.decompiler.ClangToken;
import java.io.PrintWriter;
import java.util.ArrayList;

public class DecompileSBPF extends GhidraScript {

    private void defineSolanaTypes() throws Exception {
        // Just empty for now to match original if needed
    }

    private void traverseTokens(ClangNode node, ArrayList<ClangToken> tokens) {
        if (node instanceof ClangToken) {
            tokens.add((ClangToken) node);
        } else {
            for (int i = 0; i < node.numChildren(); i++) {
                traverseTokens(node.Child(i), tokens);
            }
        }
    }

    @Override
    public void run() throws Exception {
        String[] args = getScriptArgs();
        if (args.length < 1) {
            println("Usage: DecompileSBPF <output_file>");
            return;
        }
        String outPath = args[0];
        
        defineSolanaTypes();
        
        PrintWriter writer = new PrintWriter(outPath);
        
        DecompInterface decompiler = new DecompInterface();
        decompiler.openProgram(currentProgram);

        FunctionIterator functions = currentProgram.getFunctionManager().getFunctions(true);
        while (functions.hasNext()) {
            Function func = functions.next();
            
            String funcName = func.getName();
            if (funcName.startsWith("FUN_ram_")) {
                funcName = funcName.replace("FUN_ram_000", "sub_0x");
                funcName = funcName.replace("FUN_ram_00", "sub_0x");
            }
            
            writer.println("/* Function: " + funcName + " @ 0x" + Long.toHexString(func.getEntryPoint().getOffset()) + " */");
            DecompileResults results = decompiler.decompileFunction(func, 30, monitor);
            if (results != null && results.getDecompiledFunction() != null && results.getCCodeMarkup() != null) {
                ArrayList<ClangToken> tokens = new ArrayList<>();
                traverseTokens(results.getCCodeMarkup(), tokens);
                
                StringBuilder sb = new StringBuilder();
                StringBuilder currentLine = new StringBuilder();
                long minAddr = -1;
                long maxAddr = -1;
                
                for (ClangToken token : tokens) {
                    if (token.getMinAddress() != null) {
                        long offset = token.getMinAddress().getOffset();
                        if (minAddr == -1 || offset < minAddr) minAddr = offset;
                        if (maxAddr == -1 || offset > maxAddr) maxAddr = offset;
                    }
                    
                    String text = token.getText();
                    for (int i = 0; i < text.length(); i++) {
                        char c = text.charAt(i);
                        if (c == '\n') {
                            if (minAddr != -1) {
                                currentLine.append(" // @ 0x").append(Long.toHexString(minAddr));
                                if (maxAddr != -1 && maxAddr != minAddr) {
                                    currentLine.append("-0x").append(Long.toHexString(maxAddr));
                                }
                            }
                            sb.append(currentLine.toString()).append("\n");
                            currentLine.setLength(0);
                            minAddr = -1;
                            maxAddr = -1;
                        } else {
                            currentLine.append(c);
                        }
                    }
                }
                sb.append(currentLine.toString());
                
                String cCode = sb.toString();
                
                // 1. Basic Type Cleanup
                cCode = cCode.replace("undefined8", "uint64_t");
                cCode = cCode.replace("longlong", "int64_t");
                cCode = cCode.replace("ulonglong", "uint64_t");
                cCode = cCode.replace("undefined4", "uint32_t");
                cCode = cCode.replace("undefined2", "uint16_t");
                cCode = cCode.replace("undefined1", "uint8_t");
                cCode = cCode.replace("undefined", "uint8_t");
                
                // 2. Semantic recognition of Solana concepts & Pointer Arithmetic cleanup
                cCode = cCode.replaceAll("FUN_ram_000([0-9a-fA-F]+)", "sub_0x$1");
                cCode = cCode.replaceAll("FUN_ram_00([0-9a-fA-F]+)", "sub_0x$1");
                
                cCode = cCode.replace("uint64_t entrypoint(uint64_t param_1)", "uint64_t entrypoint(uint8_t *input)");
                cCode = cCode.replace("param_1", "input");
                
                cCode = cCode.replace("**(int64_t **)(input + 8) - 1", "((AccountContext *)input)->ref_count--");
                cCode = cCode.replace("*(int64_t **)(input + 8)", "((AccountContext *)input)->ref_count");
                cCode = cCode.replace("*(uint64_t **)(input + 8)", "((AccountContext *)input)->ref_count");
                cCode = cCode.replace("input + 8", "&((AccountContext *)input)->ref_count");
                
                if (cCode.contains("sol_panic_") || cCode.contains("custom_panic")) {
                    cCode = cCode.replace(funcName, "panic_handler");
                } else if (cCode.contains("sol_invoke_signed_c")) {
                    cCode = cCode.replace(funcName, "invoke_cpi");
                } else if (cCode.contains("((AccountContext *)input)->ref_count--")) {
                    cCode = cCode.replace(funcName, "release_account_resources");
                }
                
                cCode = cCode.replaceAll("lVar([0-9]+)", "local_var_$1");
                cCode = cCode.replaceAll("uVar([0-9]+)", "local_uvar_$1");
                cCode = cCode.replaceAll("bVar([0-9]+)", "is_valid_$1");
                cCode = cCode.replaceAll("puVar([0-9]+)", "ptr_$1");
                cCode = cCode.replaceAll("plVar([0-9]+)", "ptr_l_$1");
                
                writer.println(cCode);
            } else {
                writer.println("// Failed to decompile");
            }
            writer.println();
        }
        writer.close();
    }
}

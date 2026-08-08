import ghidra.app.script.GhidraScript;
import ghidra.app.decompiler.DecompInterface;
import ghidra.app.decompiler.DecompileResults;
import ghidra.program.model.listing.Function;
import ghidra.program.model.listing.FunctionIterator;
import java.io.PrintWriter;

public class DecompileSBPF extends GhidraScript {
    @Override
    public void run() throws Exception {
        String[] args = getScriptArgs();
        if (args.length < 1) {
            println("Usage: DecompileSBPF <output_file>");
            return;
        }
        String outPath = args[0];
        PrintWriter writer = new PrintWriter(outPath);
        
        DecompInterface decompiler = new DecompInterface();
        decompiler.openProgram(currentProgram);

        FunctionIterator functions = currentProgram.getFunctionManager().getFunctions(true);
        while (functions.hasNext()) {
            Function func = functions.next();
            writer.println("/* Function: " + func.getName() + " @ 0x" + Long.toHexString(func.getEntryPoint().getOffset()) + " */");
            DecompileResults results = decompiler.decompileFunction(func, 30, monitor);
            if (results != null && results.getDecompiledFunction() != null) {
                String cCode = results.getDecompiledFunction().getC();
                
                // Basic type cleanup for readability
                cCode = cCode.replace("undefined8", "uint64_t");
                cCode = cCode.replace("longlong", "int64_t");
                cCode = cCode.replace("ulonglong", "uint64_t");
                cCode = cCode.replace("undefined4", "uint32_t");
                cCode = cCode.replace("undefined2", "uint16_t");
                cCode = cCode.replace("undefined1", "uint8_t");
                cCode = cCode.replace("undefined", "uint8_t");
                
                // Solana specific heuristic patterns
                cCode = cCode.replace("uint8_t[32]", "Pubkey");
                
                // Solana syscalls often appear as dynamic external calls or specific offsets
                // If a function name is entrypoint, we can attempt to label its args
                if (func.getName().equals("entrypoint")) {
                    cCode = cCode.replace("uint8_t *param_1", "uint8_t *input_data");
                }
                
                writer.println(cCode);
            } else {
                writer.println("// Failed to decompile");
            }
            writer.println();
        }
        writer.close();
    }
}

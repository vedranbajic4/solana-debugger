import ghidra.app.script.GhidraScript;
import ghidra.app.decompiler.DecompInterface;
import ghidra.app.decompiler.DecompileResults;
import ghidra.program.model.listing.*;
import ghidra.app.decompiler.ClangNode;
import ghidra.app.decompiler.ClangToken;
import java.util.ArrayList;

public class TestGhidra5 extends GhidraScript {
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
        DecompInterface decompiler = new DecompInterface();
        decompiler.openProgram(currentProgram);

        FunctionIterator functions = currentProgram.getFunctionManager().getFunctions(true);
        if (functions.hasNext()) {
            Function func = functions.next();
            DecompileResults results = decompiler.decompileFunction(func, 30, monitor);
            if (results != null && results.getDecompiledFunction() != null) {
                ArrayList<ClangToken> tokens = new ArrayList<>();
                traverseTokens(results.getCCodeMarkup(), tokens);
                
                int hasAddr = 0;
                for (ClangToken token : tokens) {
                    if (token.getMinAddress() != null) {
                        hasAddr++;
                    }
                }
                println("Total tokens: " + tokens.size() + ", with addresses: " + hasAddr);
            }
        }
    }
}

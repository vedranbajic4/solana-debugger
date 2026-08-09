import ghidra.app.script.GhidraScript;
import ghidra.app.decompiler.DecompInterface;
import ghidra.app.decompiler.DecompileResults;
import ghidra.program.model.listing.*;
import ghidra.app.decompiler.ClangNode;
import ghidra.app.decompiler.ClangToken;
import ghidra.app.decompiler.ClangTokenGroup;
import java.util.ArrayList;

public class TestGhidra extends GhidraScript {
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
        println("Script works!");
    }
}

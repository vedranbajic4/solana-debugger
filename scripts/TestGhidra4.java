import ghidra.app.script.GhidraScript;
import ghidra.app.decompiler.DecompInterface;
import ghidra.app.decompiler.DecompileResults;
import ghidra.program.model.listing.*;
import ghidra.app.decompiler.ClangNode;
import ghidra.app.decompiler.ClangToken;
import ghidra.app.decompiler.ClangTokenGroup;
import java.util.ArrayList;

public class TestGhidra4 extends GhidraScript {
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
                ghidra.app.decompiler.ClangTokenGroup markup = results.getCCodeMarkup();
                ArrayList<ClangToken> tokens = new ArrayList<>();
                traverseTokens(markup, tokens);
                
                StringBuilder currentLine = new StringBuilder();
                long minAddr = -1;
                long maxAddr = -1;
                
                for (ClangToken token : tokens) {
                    if (token.getMinAddress() != null) {
                        long offset = token.getMinAddress().getOffset();
                        if (minAddr == -1 || offset < minAddr) minAddr = offset;
                        if (maxAddr == -1 || offset > maxAddr) maxAddr = offset;
                    }
                    if (token.getPcodeOp() != null) {
                        long offset = token.getPcodeOp().getSeqnum().getTarget().getOffset();
                        if (minAddr == -1 || offset < minAddr) minAddr = offset;
                        if (maxAddr == -1 || offset > maxAddr) maxAddr = offset;
                    }
                    
                    String text = token.getText();
                    for (int i = 0; i < text.length(); i++) {
                        char c = text.charAt(i);
                        if (c == '\n') {
                            if (minAddr != -1) {
                                currentLine.append(" // [ADDR: 0x").append(Long.toHexString(minAddr));
                                if (maxAddr != -1 && maxAddr != minAddr) {
                                    currentLine.append("-0x").append(Long.toHexString(maxAddr));
                                }
                                currentLine.append("]");
                            }
                            String line = currentLine.toString();
                            if (line.contains("ADDR:")) {
                                println(line);
                            }
                            currentLine.setLength(0);
                            minAddr = -1;
                            maxAddr = -1;
                        } else {
                            currentLine.append(c);
                        }
                    }
                }
            }
        }
    }
}

import ghidra.app.script.GhidraScript;
import ghidra.app.plugin.core.analysis.AutoAnalysisManager;
import ghidra.app.services.Analyzer;
import ghidra.program.model.listing.Function;

public class TestDwarf extends GhidraScript {
    @Override
    public void run() throws Exception {
        AutoAnalysisManager mgr = AutoAnalysisManager.getAnalysisManager(currentProgram);
        for (Analyzer analyzer : mgr.getAnalyzers()) {
            if (analyzer.getName().toLowerCase().contains("dwarf")) {
                println("Found DWARF Analyzer: " + analyzer.getName());
                analyzer.added(currentProgram, currentProgram.getMemory().getAllInitializedAddressSet(), monitor, mgr.getMessageLog());
            }
        }
        for (Function f : currentProgram.getFunctionManager().getFunctions(true)) {
            if (!f.getName().startsWith("FUN_")) {
                println("Func: " + f.getName());
            }
        }
    }
}

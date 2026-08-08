import ghidra.app.script.GhidraScript;
import ghidra.app.util.cparser.C.CParserUtils;
import ghidra.program.model.data.DataTypeManager;
import ghidra.program.model.data.DataType;

public class TestParse extends GhidraScript {
    @Override
    public void run() throws Exception {
        String cCode = "typedef unsigned char uint8_t; typedef struct Pubkey { uint8_t key[32]; } Pubkey;";
        try {
            DataTypeManager dtm = currentProgram.getDataTypeManager();
            // CParserUtils requires more setup? Let's check.
        } catch (Exception e) {
            println("Error: " + e.getMessage());
        }
    }
}

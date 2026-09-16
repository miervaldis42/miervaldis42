// 🏷️ Types
import type { EngineMode, ParsedArgs } from "@customTypes/cli.js";

// Full command structure
const commandStructure =
  "`pnpm run tech-stats -- generate|analyze [--report <external-file>]`";

// Parse a terminal/CLI command
function getEngineMode(value: string | undefined): EngineMode {
  if (value === "generate" || value === "analyze") {
    return value;
  }

  throw new Error(`🔊 Command structure: ${commandStructure}`);
}

// Parse arguments from a terminal/CLI command
function parseArgs(args: string[]): ParsedArgs {
  const engineMode = getEngineMode(args[0]);

  const reportIndex = args.indexOf("--report");

  if (reportIndex < 0) {
    return {
      engineMode,
    };
  }

  // 'Generate' engine mode does not accept to produce a report
  if (engineMode === "generate" && reportIndex >= 0) {
    throw new Error("🔊 `--report` is only available in 'Analyze' mode.");
  }

  const customReportPath = args[reportIndex + 1];
  if (!customReportPath || customReportPath.startsWith("--")) {
    throw new Error("🔊 Missing value for `--report`.");
  }

  return {
    engineMode,
    customReportPath,
  };
}

export { getEngineMode, parseArgs };

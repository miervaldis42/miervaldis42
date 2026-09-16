// 🏷️ Types
import type { EngineMode, ParsedArgs } from "@customTypes/cli.js";

// Supported public command structures
const commandStructure =
  "either `pnpm run tech-stats` or `pnpm run tech-stats:report [--report-path <external-file>]`";

// Build the shared invalid-command error
function invalidCommand(): Error {
  return new Error(
    `🔊 The command is invalid. Use ${commandStructure} instead.`,
  );
}

// Parse the engine mode injected by the package script
function getEngineMode(value: string | undefined): EngineMode {
  if (value === "generate" || value === "analyze") {
    return value;
  }

  throw invalidCommand();
}

// Parse arguments from a terminal/CLI command
function parseArgs(args: string[]): ParsedArgs {
  const engineMode = getEngineMode(args[0]);
  const options = args.slice(1);

  // 📈 'Generate' mode accepts no additional arguments
  if (engineMode === "generate") {
    if (options.includes("--report-path")) {
      throw new Error(
        "🔊 `--report-path` is only available in 'Analyze' mode.",
      );
    }

    if (options.length > 0) {
      throw invalidCommand();
    }

    return {
      engineMode,
    };
  }

  // 🔬 'Analyze' mode may run without a custom report path
  if (options.length === 0) {
    return {
      engineMode,
    };
  }

  // 🔬 The only supported Analyze option is `--report-path <external-file>`
  if (options[0] !== "--report-path") {
    throw invalidCommand();
  }

  const customReportPath = options[1];
  if (!customReportPath || customReportPath.startsWith("--")) {
    throw new Error("🔊 Missing value for `--report-path`.");
  }

  // Reject duplicate flags, extra positional arguments or unsupported options
  if (options.length !== 2) {
    throw invalidCommand();
  }

  return {
    engineMode,
    customReportPath,
  };
}

export { getEngineMode, parseArgs };

// 🧠 Engine
import { analyze } from "@/analyze.js";
import { githubClient } from "@/github.js";
import { loadConfig } from "@/load-config.js";
import { generateOutputs, writeGeneratedOutputs } from "@/output.js";
import { writePrivateReport } from "@/report.js";

// 🏷️ Types
import type { EngineMode } from "@customTypes/cli.js";
import type { LoadedConfig } from "@customTypes/config.js";
import type { GitHubClient } from "@customTypes/github.js";

// 🧰 Utilities
import { parseArgs } from "@utils/commands.js";
import { createFileLink } from "@utils/terminal.js";

/*
 * 🧩 Engine Context
 */

function createEngineContext(engineMode: EngineMode): {
  api: GitHubClient;
  config: LoadedConfig;
} {
  const config = loadConfig();

  // Use local GitHub authenticated account
  const api = githubClient({
    localGh: engineMode === "analyze",
  });

  return {
    api,
    config,
  };
}

/*
 * 📊 Analysis Mode
 */
function runAnalysisMode(customReportPath?: string): void {
  // 1. Get engine context
  const { api, config } = createEngineContext("analyze");

  // 2. Analyze the user's GitHub & write a report
  const report = analyze(api, config);
  const reportPath = writePrivateReport(report, customReportPath);

  // End of the process
  console.log(
    `🔊 Analysis & report completed successfully! 🎉\n🔊 Full report at: ${createFileLink(reportPath)}`,
  );
}

/*
 * 📈 Generate Mode
 */
function runGenerateMode(): void {
  // 1. Get engine context
  const { api, config } = createEngineContext("generate");

  // 2. Analyze the user's GitHub
  const report = analyze(api, config);

  // 3. Generate & write the statistics SVGs from the analysis
  const { outputs, analyzedRepositories } = generateOutputs(report, config);
  writeGeneratedOutputs(outputs, config.resolvedPaths.statistics);

  // End of the process
  console.log(
    `🔊 Technology Statistics generated successfully from ${analyzedRepositories} repositories.`,
  );
}

/*
 * 🚪 Engine Entry Point
 */

function startEngine(): void {
  // 1. Detect engine mode
  const args = process.argv.slice(2);
  const { engineMode, customReportPath } = parseArgs(args);

  // 2. Run the requested engine mode
  switch (engineMode) {
    case "analyze":
      runAnalysisMode(customReportPath);
      return;

    case "generate":
      runGenerateMode();
      return;
  }
}

/*
 * ▶️ Engine Execution
 */
try {
  startEngine();
} catch (error) {
  if (error instanceof Error && error.message.startsWith("🔊 ")) {
    console.error(error.message);
  } else {
    console.error(
      "🔊 Technology Statistics failed. No partial analysis is accepted.",
    );
  }

  process.exitCode = 1;
}

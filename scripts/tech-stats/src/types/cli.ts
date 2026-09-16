/*
 * 🏷️ Type Definitions
 */

type EngineMode = "generate" | "analyze";

type ParsedArgs = {
  engineMode: EngineMode;
  customReportPath?: string;
};

export type { ParsedArgs, EngineMode };

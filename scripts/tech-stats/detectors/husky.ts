// 🏷️ Types
import type { AddEvidence } from "@customTypes/detection.js";

// 📋 Filename patterns
const HUSKY_HOOK_PATTERN = /(^|\/)\.husky\/(?!_\/)[^/]+$/;

// Detect Husky files from repository paths
export function detectHuskyHooks(
  paths: string[],
  addEvidence: AddEvidence,
): void {
  for (const repositoryPath of paths) {
    if (HUSKY_HOOK_PATTERN.test(repositoryPath)) {
      addEvidence("husky", repositoryPath, "dedicated configuration");
    }
  }
}

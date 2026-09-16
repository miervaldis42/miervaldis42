// 🏷️ Types
import type { AddEvidence } from "@customTypes/detection.js";

// 📋 Filename patterns
const GITHUB_WORKFLOW_PATTERN = /(^|\/)\.github\/workflows\/[^/]+\.ya?ml$/;

// 🧰 Check whether the file is a GitHub Workflow file
function isGitHubWorkflowEvidenceFile(filename: string): boolean {
  return GITHUB_WORKFLOW_PATTERN.test(filename);
}

// Detect explicit Vercel CLI usage inside a `package.json` script command
function detectVercelInPackageScript(
  manifestPath: string,
  command: string,
  addEvidence: AddEvidence,
): void {
  const usesVercelCli =
    /(?:^|[;&|]\s*)(?:(?:npx|pnpm(?:\s+exec)?|yarn)\s+)?vercel(?:\s|$)/.test(
      command,
    );

  if (usesVercelCli) {
    addEvidence("vercel", manifestPath, "explicit Vercel CLI command");
  }
}

// Detect Vercel usage in GitHub Actions workflows through an Action or CLI command
function detectVercelInWorkflow(
  filename: string,
  source: string,
  addEvidence: AddEvidence,
): void {
  if (!isGitHubWorkflowEvidenceFile(filename)) {
    return;
  }

  const usesVercelAction =
    /^\s*-?\s*uses:\s*["']?(?:amondnet\/vercel-action|vercel\/action)@/m.test(
      source,
    );

  const runsVercelCli =
    /^\s*(?:run:\s*(?:[>|]-?\s*)?)?(?:npx\s+)?vercel\s+(?:deploy|build|pull)\b/m.test(
      source,
    );

  if (usesVercelAction || runsVercelCli) {
    addEvidence("vercel", filename, "explicit Vercel workflow integration");
  }
}

export {
  isGitHubWorkflowEvidenceFile,
  detectVercelInPackageScript,
  detectVercelInWorkflow,
};

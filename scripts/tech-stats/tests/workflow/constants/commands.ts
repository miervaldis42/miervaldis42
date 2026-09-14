const GITHUB_WORKFLOW_COMMANDS = {
  install: "pnpm install",
  typecheck: "pnpm run typecheck",
  test: "pnpm run test",
  generate: "pnpm run tech-stats",
} as const;

export { GITHUB_WORKFLOW_COMMANDS };

const GITHUB_WORKFLOW_ID_KEY = "id: ";

const GITHUB_WORKFLOW_STEP_IDS = {
  cadence: "cadence",
  checkout: "checkout",
  runtime: "runtime",
  dependencies: "dependencies",
  validation: "validation",
  generation: "generation",
  persistence: "persistence",
  pullRequest: "pull-request",
  merge: "merge",
  realignment: "realignment",
} as const;

export { GITHUB_WORKFLOW_ID_KEY, GITHUB_WORKFLOW_STEP_IDS };

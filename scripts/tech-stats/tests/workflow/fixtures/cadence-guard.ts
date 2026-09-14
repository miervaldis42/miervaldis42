// 📦 Imports
import vm from "node:vm";

// 📋 Fixtures
import { workflow } from "@tests/workflow/fixtures/update-tech-stats-workflow.js";

/*
 * ⏰ Cadence Guard Fixture
 */

// Extract the Node.js code embedded in the 'Cadence' workflow step
const guardMatch = workflow.match(/node <<'NODE'\n([\s\S]+?)\n\s+NODE/);
if (!guardMatch?.[1]) {
  throw new Error("🔊 Unable to locate the 'Cadence' workflow step.");
}

// Remove the YAML block indentation before executing the extracted code
const cadenceGuard = guardMatch[1]
  .split("\n")
  .map((line) => line.replace(/^ {10}/, ""))
  .join("\n");

function evaluateCadenceGuard(event: string, date: string): boolean {
  let output = "";

  class Clock extends Date {
    constructor(value?: string | number) {
      super(value === undefined ? date : value);
    }
  }

  // Execute the real cadence code inside a controlled GitHub Actions context
  vm.runInNewContext(cadenceGuard, {
    Date: Clock,
    console: {
      log: () => undefined,
    },
    process: {
      env: {
        GITHUB_EVENT_NAME: event,
        GITHUB_OUTPUT: "test-output",
      },
    },
    require: () => ({
      appendFileSync: (_path: string, value: string) => {
        output += value;
      },
    }),
  });

  return output === "run=true\n";
}

export { evaluateCadenceGuard };

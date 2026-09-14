// 📦 Imports
import { fileURLToPath } from "node:url";

// 🧪🔧 Test Configuration
import { defineConfig } from "vitest/config";

function resolvePath(relativePath: string): string {
  return fileURLToPath(new URL(relativePath, import.meta.url));
}

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@config",
        replacement: resolvePath("./config"),
      },
      {
        find: "@constants",
        replacement: resolvePath("./src/constants"),
      },
      {
        find: "@customTypes",
        replacement: resolvePath("./src/types"),
      },
      {
        find: "@utils",
        replacement: resolvePath("./src/utils"),
      },
      {
        find: "@definitions",
        replacement: resolvePath("./definitions"),
      },
      {
        find: "@detectors",
        replacement: resolvePath("./detectors"),
      },
      {
        find: "@tests",
        replacement: resolvePath("./tests"),
      },
      {
        find: "@",
        replacement: resolvePath("./src"),
      },
    ],
  },
  test: {
    environment: "node",
    include: ["tests/engine/*.ts", "tests/workflow/*.ts"],
  },
});

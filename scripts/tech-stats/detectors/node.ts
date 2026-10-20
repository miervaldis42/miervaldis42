// 📦 Imports
import path from "node:path";

// 🧰 Utilities
import { asRecord } from "@utils/object.js";

// 🏷️ Types
import type { AddEvidence } from "@customTypes/detection.js";

// 📋 Node server dependencies
const NODE_SERVER_DEPENDENCIES = [
  "express",
  "fastify",
  "koa",
  "@nestjs/core",
  "@hapi/hapi",
  "restify",
  "@adonisjs/core",
];

/*
 * 🧰 Utilities
 */

/**
 * @description Checks whether a path declared from package.json actually exists among the checked-in repository paths.
 *
 * @param manifestPath - Repository-relative path of the package.json file
 * @param target - File path declared inside `package.json`
 * @param paths - All checked-in repository paths
 * @returns Whether the declared file exists in the repository
 */
function isCheckedInFile(
  manifestPath: string,
  target: unknown,
  paths: string[],
): target is string {
  if (typeof target !== "string") {
    return false;
  }

  const directory = path.posix.dirname(manifestPath);
  const resolvedPath = path.posix.normalize(path.posix.join(directory, target));

  return paths.includes(resolvedPath);
}

/*
 * 🔎 Node.js Detection
 */

// Detect Node.js through direct server runtime dependencies
function detectServerRuntimeDependency(
  manifestPath: string,
  manifest: Record<string, unknown>,
  addEvidence: AddEvidence,
): void {
  const runtimeDependencies = {
    ...asRecord(manifest.dependencies),
    ...asRecord(manifest.optionalDependencies),
  };

  const hasServerDependency = NODE_SERVER_DEPENDENCIES.some((dependency) =>
    Object.hasOwn(runtimeDependencies, dependency),
  );

  if (hasServerDependency) {
    addEvidence("nodejs", manifestPath, "server runtime dependency");
  }
}

// Detect Node.js through an engines.node requirement combined with a checked-in CLI binary
function detectNodeCli(
  manifestPath: string,
  manifest: Record<string, unknown>,
  paths: string[],
  addEvidence: AddEvidence,
): void {
  const engines = asRecord(manifest.engines);

  if (!engines.node) {
    return;
  }

  const bin = manifest.bin;

  const bins =
    typeof bin === "string"
      ? [bin]
      : bin && typeof bin === "object" && !Array.isArray(bin)
        ? Object.values(bin)
        : [];

  const hasCheckedInNodeCli = bins.some(
    (target) =>
      typeof target === "string" &&
      /\.[cm]?[jt]s$/.test(target) &&
      isCheckedInFile(manifestPath, target, paths),
  );

  if (hasCheckedInNodeCli) {
    addEvidence(
      "nodejs",
      manifestPath,
      "Node engine requirement and checked-in JavaScript/TypeScript CLI bin",
    );
  }
}

// Detect Node.js when start/serve/server package scripts execute a checked-in Node implementation
function detectNodeRuntimeScripts(
  manifestPath: string,
  manifest: Record<string, unknown>,
  paths: string[],
  addEvidence: AddEvidence,
): void {
  const scripts = asRecord(manifest.scripts);

  for (const [script, command] of Object.entries(scripts)) {
    if (
      typeof command !== "string" ||
      !/^(start|serve|server)(:|$)/.test(script)
    ) {
      continue;
    }

    const match = command.match(
      /(?:^|[;&|]\s*)node\s+(?:--[\w=-]+\s+)*["']?([^\s"';&|]+\.[cm]?[jt]s)/,
    );

    if (match?.[1] && isCheckedInFile(manifestPath, match[1], paths)) {
      addEvidence(
        "nodejs",
        manifestPath,
        "start/serve/server command runs checked-in Node implementation",
      );
    }
  }
}

/*
 * 🚪 Public API
 */

/**
 * @description Detects Node.js runtime evidence from a package.json manifest.
 *
 * Detection follows three independent evidence strategies:
 * 1. Direct Node server runtime dependencies
 * 2. A Node engine requirement combined with a checked-in CLI binary
 * 3. Start, serve or server scripts executing a checked-in Node implementation
 *
 * @param manifestPath - Repository-relative path of the package.json file
 * @param manifest - Parsed package.json content
 * @param paths - All checked-in repository paths
 * @param addEvidence - Callback used to record detected evidence
 */
export function detectNodeRuntime(
  manifestPath: string,
  manifest: Record<string, unknown>,
  paths: string[],
  addEvidence: AddEvidence,
): void {
  detectServerRuntimeDependency(manifestPath, manifest, addEvidence);

  detectNodeCli(manifestPath, manifest, paths, addEvidence);

  detectNodeRuntimeScripts(manifestPath, manifest, paths, addEvidence);
}

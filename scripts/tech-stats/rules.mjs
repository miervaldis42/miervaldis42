// 📦 Imports
import path from "node:path";

/**
 * Rules for detecting technologies based on package.json dependencies, configuration files & other evidence
 */
const dependencyRules = {
  react: ["react"],
  nextjs: ["next"],
  "react-native": ["react-native"],
  electron: ["electron"],
  tailwindcss: ["tailwindcss"],
  storybook: ["storybook", "@storybook/"],
  nestjs: ["@nestjs/core"],
  prisma: ["prisma", "@prisma/client"],
  postgresql: ["pg", "postgres", "@neondatabase/serverless", "postgres.js"],
  mongodb: ["mongodb", "mongoose"],
  husky: ["husky"],
  jest: ["jest", "@jest/core"],
  playwright: ["@playwright/test", "playwright", "playwright-core"],
  supabase: ["supabase", "@supabase/supabase-js", "@supabase/ssr"],
  biome: ["@biomejs/biome"],
  turborepo: ["turbo"],
};
const serverDependencies = [
  "express",
  "fastify",
  "koa",
  "@nestjs/core",
  "@hapi/hapi",
  "restify",
  "@adonisjs/core",
];
const configurationRules = [
  ["nextjs", /(^|\/)next\.config\.[cm]?[jt]s$/],
  ["tailwindcss", /(^|\/)tailwind\.config\.[cm]?[jt]s$/],
  ["storybook", /(^|\/)\.storybook\/main\.[cm]?[jt]s$/],
  ["nestjs", /(^|\/)nest-cli\.json$/],
  ["prisma", /(^|\/)(schema\.prisma|prisma\.config\.[cm]?[jt]s)$/],
  ["husky", /(^|\/)\.husky\/(?!_\/)[^/]+$/],
  ["jest", /(^|\/)jest\.config\.[cm]?[jt]s$/],
  ["playwright", /(^|\/)playwright\.config\.[cm]?[jt]s$/],
  ["supabase", /(^|\/)supabase\/config\.toml$/],
  ["biome", /(^|\/)biome\.jsonc?$/],
  [
    "docker",
    /(^|\/)(Dockerfile(?:\.[^/]+)?|(?:docker-)?compose(?:\.[^/]+)?\.ya?ml)$/i,
  ],
  ["turborepo", /(^|\/)turbo\.jsonc?$/],
  ["vercel", /(^|\/)vercel\.json$/],
];

export function isEvidenceFile(name) {
  return /(^|\/)package\.json$|\.prisma$|(^|\/)(?:docker-)?compose(?:\.[^/]+)?\.ya?ml$|(^|\/)\.github\/workflows\/[^/]+\.ya?ml$/.test(
    name,
  );
}

export function detect(paths, files) {
  const evidence = {};
  const add = (technology, file, signal) => {
    (evidence[technology] ??= []).push({ path: file, signal });
  };
  for (const name of paths) {
    for (const [technology, pattern] of configurationRules) {
      if (pattern.test(name)) add(technology, name, "dedicated configuration");
    }
  }
  for (const [name, text] of Object.entries(files)) {
    if (/(^|\/)package\.json$/.test(name)) {
      // Parse errors fail the entire analysis; they never silently lower adoption.
      const manifest = JSON.parse(text);
      const deps = {
        ...manifest.dependencies,
        ...manifest.devDependencies,
        ...manifest.peerDependencies,
        ...manifest.optionalDependencies,
      };
      for (const [technology, packages] of Object.entries(dependencyRules)) {
        for (const pkg of Object.keys(deps)) {
          if (
            packages.some((candidate) =>
              candidate.endsWith("/")
                ? pkg.startsWith(candidate)
                : pkg === candidate,
            )
          ) {
            add(technology, name, `direct package declaration: ${pkg}`);
          }
        }
      }
      const runtime = {
        ...manifest.dependencies,
        ...manifest.optionalDependencies,
      };
      if (serverDependencies.some((pkg) => Object.hasOwn(runtime, pkg)))
        add("nodejs", name, "server runtime dependency");
      const directory = path.posix.dirname(name);
      const present = (target) =>
        typeof target === "string" &&
        paths.includes(
          path.posix.normalize(path.posix.join(directory, target)),
        );
      const bins =
        typeof manifest.bin === "string"
          ? [manifest.bin]
          : Object.values(manifest.bin ?? {});
      if (
        manifest.engines?.node &&
        bins.some(
          (target) =>
            typeof target === "string" &&
            /\.[cm]?[jt]s$/.test(target) &&
            present(target),
        )
      ) {
        add(
          "nodejs",
          name,
          "Node engine requirement and checked-in JavaScript/TypeScript CLI bin",
        );
      }
      for (const [script, command] of Object.entries(manifest.scripts ?? {})) {
        if (typeof command !== "string") continue;
        if (/^(start|serve|server)(:|$)/.test(script)) {
          const match = command.match(
            /(?:^|[;&|]\s*)node\s+(?:--[\w=-]+\s+)*["']?([^\s"';&|]+\.[cm]?[jt]s)/,
          );
          if (match && present(match[1]))
            add(
              "nodejs",
              name,
              "start/serve/server command runs checked-in Node implementation",
            );
        }
        if (
          /(?:^|[;&|]\s*)(?:(?:npx|pnpm(?:\s+exec)?|yarn)\s+)?vercel(?:\s|$)/.test(
            command,
          )
        ) {
          add("vercel", name, "explicit Vercel CLI command");
        }
      }
      if (manifest.jest) add("jest", name, "embedded Jest configuration");
      if (manifest.husky) add("husky", name, "embedded Husky configuration");
    }
    if (name.endsWith(".prisma")) {
      const withoutComments = text.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
      if (/\bprovider\s*=\s*["']postgresql["']/.test(withoutComments))
        add("postgresql", name, "Prisma PostgreSQL provider");
      if (/\bprovider\s*=\s*["']mongodb["']/.test(withoutComments))
        add("mongodb", name, "Prisma MongoDB provider");
    }
    if (/(^|\/)(?:docker-)?compose(?:\.[^/]+)?\.ya?ml$/.test(name)) {
      if (
        /^\s*image:\s*["']?(?:docker\.io\/)?(?:library\/)?postgres(?:[:@\s"']|$)/m.test(
          text,
        )
      )
        add("postgresql", name, "PostgreSQL container image");
      if (
        /^\s*image:\s*["']?(?:docker\.io\/)?(?:library\/)?mongo(?:[:@\s"']|$)/m.test(
          text,
        )
      )
        add("mongodb", name, "MongoDB container image");
    }
    if (/(^|\/)\.github\/workflows\/[^/]+\.ya?ml$/.test(name)) {
      if (
        /^\s*-?\s*uses:\s*["']?(?:amondnet\/vercel-action|vercel\/action)@/m.test(
          text,
        ) ||
        /^\s*(?:run:\s*(?:[>|]-?\s*)?)?(?:npx\s+)?vercel\s+(?:deploy|build|pull)\b/m.test(
          text,
        )
      ) {
        add("vercel", name, "explicit Vercel workflow integration");
      }
    }
  }
  return evidence;
}

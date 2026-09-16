// 🧪📦 Test Imports
import { expect, test } from "vitest";

// 🧠 Engine
import { detect } from "@/detect.js";
import { loadConfig } from "@/load-config.js";

// 🏷️ Types
import type { DetectionRules } from "@customTypes/detection.js";

/*
 * 🧩 Fixtures
 */

const packageRules: DetectionRules = {
  react: {
    dependencies: {
      exact: ["react"],
    },
  },
  nextjs: {
    dependencies: {
      exact: ["next"],
    },
  },
  tailwindcss: {
    dependencies: {
      exact: ["tailwindcss"],
    },
  },
  prisma: {
    dependencies: {
      exact: ["prisma"],
    },
  },
};

const vercelRules: DetectionRules = {
  vercel: {
    configFiles: ["vercel.json"],
  },
};

/*
 * 🔎 Generic Technology Detection
 */

// For a nested package.json, check that direct dependencies are detected without using lockfile content as evidence
test("Technology Detection: Nested Package Manifest Dependency Check", () => {
  const files = {
    "apps/web/package.json": JSON.stringify({
      dependencies: {
        react: "1",
        next: "1",
      },
      devDependencies: {
        tailwindcss: "1",
      },
    }),
    "pnpm-lock.yaml": "prisma: 1",
  };

  const result = detect(Object.keys(files), files, packageRules);

  expect(result.react).toBeDefined();
  expect(result.nextjs).toBeDefined();
  expect(result.tailwindcss).toBeDefined();
  expect(result.prisma).toBeUndefined();
});

/*
 * 🟢 Node.js Detection
 */

// Check that Node.js requires actual runtime evidence instead of any JavaScript tooling
test("Node Detection: Runtime Evidence Requirement Check", () => {
  const cases = [
    {
      manifest: {
        dependencies: {
          next: "1",
        },
        scripts: {
          dev: "next dev",
          build: "node scripts/build.js",
        },
      },
      paths: ["scripts/build.js"],
      expected: false,
    },
    {
      manifest: {
        devDependencies: {
          express: "1",
        },
      },
      paths: [],
      expected: false,
    },
    {
      manifest: {
        dependencies: {
          express: "1",
        },
      },
      paths: [],
      expected: true,
    },
    {
      manifest: {
        scripts: {
          start: "node server.js",
        },
      },
      paths: ["server.js"],
      expected: true,
    },
    {
      manifest: {
        scripts: {
          start: "node missing.js",
        },
      },
      paths: [],
      expected: false,
    },
    {
      manifest: {
        bin: {
          cli: "./cli.js",
        },
        engines: {
          node: ">=22",
        },
      },
      paths: ["cli.js"],
      expected: true,
    },
    {
      manifest: {
        bin: {
          cli: "./cli.sh",
        },
        engines: {
          node: ">=22",
        },
      },
      paths: ["cli.sh"],
      expected: false,
    },
    {
      manifest: {
        bin: {
          cli: "./cli.js",
        },
      },
      paths: ["cli.js"],
      expected: false,
    },
  ];

  for (const currentCase of cases) {
    const result = detect(
      ["package.json", ...currentCase.paths],
      {
        "package.json": JSON.stringify(currentCase.manifest),
      },
      {},
    );

    expect(Boolean(result.nodejs)).toBe(currentCase.expected);
  }
});

/*
 * ▲ Vercel Detection
 */

// Check that Next.js alone does not imply Vercel usage & explicit Vercel evidence does
test("Vercel Detection: Explicit Integration Evidence Requirement Check", () => {
  const nextOnly = detect(["next.config.js"], {}, vercelRules);
  expect(nextOnly.vercel).toBeUndefined();

  const vercelConfiguration = detect(["vercel.json"], {}, vercelRules);
  expect(vercelConfiguration.vercel).toBeDefined();

  const vercelScript = detect(
    ["package.json"],
    {
      "package.json": JSON.stringify({
        scripts: {
          deploy: "vercel deploy",
        },
      }),
    },
    {},
  );
  expect(vercelScript.vercel).toBeDefined();
});

/*
 * 🐳 Docker Detection
 */

// Check that dedicated Docker files count as Docker evidence
test("Docker Detection: Configuration Evidence Check", () => {
  const result = detect(["services/Dockerfile.dev", "compose.yaml"], {}, {});

  expect(result.docker).toBeDefined();
});

/*
 * 🗄️ Database Detection
 */

// Check that supported Docker images & Prisma providers identify their related databases
test("Database Detection: PostgreSQL & MongoDB Evidence Check", () => {
  const result = detect(
    ["compose.yaml", "schema.prisma"],
    {
      "compose.yaml": [
        "services:",
        "  database:",
        "    image: postgres:17",
      ].join("\n"),
      "schema.prisma": 'datasource db { provider = "mongodb" }',
    },
    {},
  );

  expect(result.postgresql).toBeDefined();

  expect(result.mongodb).toBeDefined();
});

// ! Edge case: Commented Prisma provider => no database evidence
test("Prisma Detection: Edge Case - Commented Provider Rejection", () => {
  const result = detect(
    ["schema.prisma"],
    {
      "schema.prisma": '// provider = "postgresql"',
    },
    {},
  );

  expect(result.postgresql).toBeUndefined();
});

// ! Edge case: Invalid package.json => complete detection error
test("Technology Detection: Edge Case - Invalid Package Manifest Rejection", () => {
  expect(() =>
    detect(
      ["package.json"],
      {
        "package.json": "broken manifest",
      },
      {},
    ),
  ).toThrow();
});

/*
 * ✅ Configured Technology Coverage
 */

// Check that every configured adoption technology has deterministic positive evidence
test("Technology Detection: Configured Adoption Technology Coverage Check", () => {
  const config = loadConfig();

  const dependencies = [
    "react",
    "next",
    "react-native",
    "electron",
    "tailwindcss",
    "@storybook/react",
    "@nestjs/core",
    "prisma",
    "pg",
    "mongoose",
    "husky",
    "jest",
    "@playwright/test",
    "@supabase/supabase-js",
    "@biomejs/biome",
    "turbo",
    "express",
  ];

  const result = detect(
    ["package.json", "vercel.json", "Dockerfile"],
    {
      "package.json": JSON.stringify({
        dependencies: Object.fromEntries(
          dependencies.map((dependency) => [dependency, "1"]),
        ),
      }),
    },
    config.detectionRules,
  );

  const adoptionTechnologies = config.definitions
    .flatMap((section) => section.technologies)
    .filter((technology) => technology.metric === "adoption");

  for (const technology of adoptionTechnologies) {
    expect(result[technology.rule], technology.id).toBeDefined();
  }
});

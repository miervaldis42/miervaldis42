// 📦 Imports
import path from "node:path";

// 🧪📦 Test Imports
import test from "node:test";
import assert from "node:assert/strict";

// 📃 Scripts
import {
  summarize,
  readTree,
  selectRepositories,
  githubClient,
  analyze,
} from "../analyze.mjs";
import { detect } from "../rules.mjs";
import { assertPrivateOutputAbsent, render, validateSvg } from "../render.mjs";
import {
  loadConfiguration,
  root,
  iconDirectory,
  privateReportPath,
} from "../index.mjs";

// 🔧 Configuration
const { config, sections } = loadConfiguration();

// 🧪🛠️ Fixture Factory
const repo = (name, overrides = {}) => ({
  full_name: `owner/${name}`,
  owner: { login: "owner" },
  private: false,
  fork: false,
  archived: false,
  ...overrides,
});

/**
 * 🧪 Tests
 */
test("selection includes authorized private repos and enforces every exclusion", () => {
  const repos = [
    repo("a"),
    repo("b", { private: true }),
    repo("fork", { fork: true }),
    repo("old", { archived: true }),
    repo("owner"),
    repo("excluded"),
    repo("foreign", { owner: { login: "elsewhere" } }),
  ];
  const selection = {
    owner: "OWNER",
    include: [],
    exclude: ["OWNER/excluded"],
  };
  assert.deepEqual(
    selectRepositories(repos, selection)
      .filter((r) => !r.reason)
      .map((r) => r.full_name),
    ["owner/a", "owner/b"],
  );
  assert.deepEqual(
    selectRepositories(repos, {
      ...selection,
      include: ["owner/B", "owner/fork", "owner/excluded"],
    })
      .filter((r) => !r.reason)
      .map((r) => r.full_name),
    ["owner/b"],
  );
});

test("language denominator is relevant bytes; adoption counts each repo once, including empty repos", () => {
  const input = [
    {
      languages: { TypeScript: 75, CSS: 25, SCSS: 900 },
      evidence: { react: [{ path: "a" }, { path: "b" }] },
    },
    { languages: {}, evidence: {} },
  ];
  const summary = summarize(input, sections);
  assert.equal(summary.languageBytes, 100);
  assert.equal(summary.metrics.typescript.label, "75.0%");
  assert.equal(summary.metrics.javascript.label, "0.0%");
  assert.equal(summary.metrics.react.label, "50.0%");
  assert.equal(summary.metrics.figma.label, "Curated");
  assert.equal(summary.metrics.github.percentage, undefined);
  assert.equal(summarize([], sections).metrics.react.label, "No data");
  assert.equal(summarize([], sections).metrics.typescript.label, "No data");
  assert.throws(() => summarize([{ languages: { CSS: -1 } }], sections));
});

test("nested manifests count direct dependencies, but not transitive lockfile names", () => {
  const files = {
    "apps/web/package.json": JSON.stringify({
      dependencies: { react: "1", next: "1" },
      devDependencies: { tailwindcss: "1" },
    }),
    "pnpm-lock.yaml": "express: 1\nprisma: 1",
    "apps/web/.storybook/main.ts": "",
  };
  const result = detect(Object.keys(files), files);
  assert.ok(
    result.react && result.nextjs && result.tailwindcss && result.storybook,
  );
  assert.equal(result.nodejs, undefined);
  assert.equal(result.vercel, undefined);
  assert.equal(result.prisma, undefined);
});

test("Node requires runtime evidence, not a package manifest or frontend tooling", () => {
  const cases = [
    [
      {
        dependencies: { next: "1" },
        scripts: { dev: "next dev", build: "node scripts/build.js" },
      },
      ["scripts/build.js"],
      false,
    ],
    [{ devDependencies: { express: "1" } }, [], false],
    [{ dependencies: { express: "1" } }, [], true],
    [{ scripts: { start: "node server.js" } }, ["server.js"], true],
    [{ scripts: { start: "node missing.js" } }, [], false],
    [{ bin: { cli: "./cli.js" }, engines: { node: ">=22" } }, ["cli.js"], true],
    [{ bin: { cli: "./cli.sh" } }, ["cli.sh"], false],
    [{ bin: { cli: "./cli.js" } }, ["cli.js"], false],
  ];
  for (const [manifest, paths, expected] of cases)
    assert.equal(
      !!detect(["package.json", ...paths], {
        "package.json": JSON.stringify(manifest),
      }).nodejs,
      expected,
    );
});

test("Vercel requires explicit integration; database and Docker signals stay specific", () => {
  assert.equal(detect(["next.config.js"], {}).vercel, undefined);
  assert.ok(detect(["vercel.json"], {}).vercel);
  const result = detect(["services/Dockerfile.dev", "compose.yaml"], {
    "compose.yaml": "services:\n  db:\n    image: postgres:17",
    "schema.prisma": 'datasource db { provider = "mongodb" }',
    ".github/workflows/deploy.yml":
      "steps:\n  - uses: amondnet/vercel-action@v25",
  });
  assert.ok(
    result.docker && result.postgresql && result.mongodb && result.vercel,
  );
  assert.equal(
    detect([], { "schema.prisma": '// provider = "postgresql"' }).postgresql,
    undefined,
  );
  assert.throws(() =>
    detect(["package.json"], { "package.json": "broken manifest" }),
  );
});

test("all configured detectable technologies have positive deterministic fixtures", () => {
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
  const result = detect(["package.json", "vercel.json", "Dockerfile"], {
    "package.json": JSON.stringify({
      dependencies: Object.fromEntries(dependencies.map((name) => [name, "1"])),
    }),
  });
  for (const tech of sections
    .flatMap((s) => s.technologies)
    .filter((t) => t.metric === "adoption"))
    assert.ok(result[tech.rule], tech.id);
});

test("truncated tree traversal recovers nested projects and ignores dependencies", () => {
  const replies = [
    { sha: "root", truncated: true },
    {
      tree: [
        { type: "tree", path: "apps", sha: "apps" },
        { type: "tree", path: "node_modules", sha: "deps" },
      ],
    },
    {
      tree: [
        { type: "blob", path: "package.json", mode: "100644", sha: "manifest" },
      ],
    },
  ];
  const entries = readTree(
    () => replies.shift(),
    { full_name: "owner/repo", default_branch: "main" },
    config,
  );
  assert.deepEqual(
    entries.map((item) => item.path),
    ["apps/package.json"],
  );
  assert.equal(replies.length, 0);
});

test("repository analysis merges public and authorized private pages without executing source", () => {
  const calls = [];
  const common = { default_branch: "main", size: 1 };
  const publicRepo = repo("public", common);
  const privateRepo = repo("private", { ...common, private: true });
  const api = (endpoint) => {
    calls.push(endpoint);
    if (endpoint.startsWith("users/")) return [[publicRepo]];
    if (endpoint.startsWith("user/")) return [[publicRepo], [privateRepo]];
    if (endpoint.endsWith("/languages")) return { JavaScript: 100 };
    if (endpoint.includes("/git/trees/"))
      return {
        tree: [
          {
            path: "package.json",
            sha: "blob",
            type: "blob",
            mode: "100644",
            size: 50,
          },
        ],
        truncated: false,
      };
    return {
      encoding: "base64",
      size: 50,
      content: Buffer.from(
        '{"dependencies":{"react":"1"},"scripts":{"postinstall":"DO_NOT_RUN"}}',
      ).toString("base64"),
    };
  };
  const report = analyze(
    api,
    { ...config, owner: "owner", include: [], exclude: [] },
    sections,
  );
  assert.equal(report.includedCount, 2);
  assert.equal(report.summary.metrics.react.label, "100.0%");
  assert.deepEqual(report.privateNames, ["owner/private"]);
  assert.equal(calls.filter((call) => call.endsWith("/languages")).length, 2);
});

test("privacy guard rejects names, URLs, encoded identifiers and token material", () => {
  for (const output of [
    "hidden-project",
    "https://github.com/owner/hidden-project",
    "owner%2Fhidden-project",
    "<!-- hidden-project -->",
  ]) {
    assert.throws(() =>
      assertPrivateOutputAbsent([output], ["owner/hidden-project"]),
    );
  }
  assert.throws(() =>
    assertPrivateOutputAbsent(["credential123"], [], ["credential123"]),
  );
  assert.doesNotThrow(() =>
    assertPrivateOutputAbsent(["React 50.0%"], ["owner/hidden-project"]),
  );
  assert.doesNotThrow(() =>
    assertPrivateOutputAbsent(["compatible"], ["owner/pat"]),
  );
  assert.throws(() =>
    assertPrivateOutputAbsent(
      ["prefixcredential123suffix"],
      [],
      ["credential123"],
    ),
  );
  assert.throws(() => privateReportPath(path.join(root, "private.json")));
});

test("all strips render reproducibly with expected card counts and both icon variants", () => {
  const summary = summarize([], sections);
  for (const section of sections) {
    const svg = render(section, summary, config, iconDirectory);
    validateSvg(svg, section);
    assert.equal(svg, render(section, summary, config, iconDirectory));
    assert.equal(
      (svg.match(/class="pill"/g) ?? []).length,
      section.technologies.length,
    );
    assert.ok(!svg.includes("<image"));
  }
  const section = sections.find((s) => s.id === "backend-data");
  const wrapped = render(
    section,
    summary,
    { ...config, layout: { ...config.layout, maxCardsPerRow: 3 } },
    iconDirectory,
  );
  assert.ok(wrapped.includes('viewBox="0 0 560 312"'));
});

test("one to five cards share a fixed canvas, card scale, and centered rows", () => {
  const summary = summarize([], sections);
  const technologies = sections
    .flatMap((section) => section.technologies)
    .slice(0, 5);
  for (const canvasWidth of [560, 700]) {
    for (let count = 1; count <= 5; count++) {
      const section = {
        title: "Canvas test",
        technologies: technologies.slice(0, count),
      };
      const svg = render(
        section,
        summary,
        { ...config, layout: { ...config.layout, canvasWidth } },
        iconDirectory,
      );
      assert.equal(Number(svg.match(/viewBox="0 0 (\d+)/)[1]), canvasWidth);
      assert.ok(svg.includes('width="48" height="48"'));
      assert.ok(svg.includes('width="72" height="28"'));
      assert.ok(svg.includes("font-size: 15px"));
      assert.ok(svg.includes("font-size: 13px"));
      const rows = new Map();
      for (const match of svg.matchAll(
        /class="card" transform="translate\(([\d.]+) ([\d.]+)\)"/g,
      )) {
        const centers = rows.get(match[2]) ?? [];
        centers.push(Number(match[1]));
        rows.set(match[2], centers);
      }
      for (const centers of rows.values()) {
        assert.equal((centers[0] + centers.at(-1)) / 2, canvasWidth / 2);
        for (let i = 1; i < centers.length; i++)
          assert.equal(
            centers[i] - centers[i - 1],
            config.layout.cardWidth + config.layout.cardGap,
          );
      }
    }
  }
  assert.throws(
    () =>
      render(
        sections[0],
        summary,
        { ...config, layout: { ...config.layout, canvasWidth: 100 } },
        iconDirectory,
      ),
    /do not fit/,
  );
});

test("Actions cannot fall back to the local CLI identity", () => {
  const original = process.env.GITHUB_ACTIONS;
  try {
    process.env.GITHUB_ACTIONS = "true";
    assert.throws(() => githubClient({ localGh: true }));
  } finally {
    if (original === undefined) delete process.env.GITHUB_ACTIONS;
    else process.env.GITHUB_ACTIONS = original;
  }
});

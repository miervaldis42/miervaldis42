// 📦 Imports
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

// 🧪📦 Test Imports
import { expect, test, vi } from "vitest";

// 🧠 Engine
import { buildAnalysisReport, writePrivateReport } from "@/report.js";

// 📍 Engine Paths
import { REPOSITORY_ROOT } from "@constants/paths.js";

// 🧩 Fixtures
import {
  analyzedRepository,
  selectedRepository,
} from "@tests/engine/fixtures/analysis.js";

// 🏷️ Types
import type { AnalysisSummary } from "@customTypes/analysis.js";

/*
 * 🧩 Fixtures
 */

const summary: AnalysisSummary = {
  analyzedRepositories: 1,
  languageBytes: 100,
  allLanguageBytes: {
    TypeScript: 100,
  },
  metrics: {
    typescript: {
      metric: "language",
      numerator: 100,
      denominator: 100,
      percentage: 100,
      label: "100.0%",
    },
  },
};

function createReport() {
  return buildAnalysisReport(
    [selectedRepository("owner/repository")],
    [analyzedRepository("owner/repository")],
    summary,
  );
}

function withoutGitHubActions<T>(callback: () => T): T {
  const originalGitHubActions = process.env.GITHUB_ACTIONS;

  try {
    delete process.env.GITHUB_ACTIONS;

    return callback();
  } finally {
    if (originalGitHubActions === undefined) {
      delete process.env.GITHUB_ACTIONS;
    } else {
      process.env.GITHUB_ACTIONS = originalGitHubActions;
    }
  }
}

/*
 * 🧾 Analysis Report
 */

// Check that repository analysis data is transformed into the expected report structure
test("Report: Analysis Report Construction Check", () => {
  const selection = [
    selectedRepository("owner/public"),
    selectedRepository("Owner/Secret", {
      private: true,
    }),
    selectedRepository("owner/SECRET", {
      private: true,
      archived: true,
      reason: "archived",
    }),
  ];

  const repositories = [
    analyzedRepository("owner/public"),
    analyzedRepository("Owner/Secret", {
      private: true,
    }),
  ];

  const report = buildAnalysisReport(selection, repositories, summary);

  expect(report.schemaVersion).toBe(1);
  expect(Number.isNaN(Date.parse(report.timestamp))).toBe(false);
  expect(report.includedRepositoryCount).toBe(2);
  expect(report.excludedRepositoryCount).toBe(1);
  expect(report.privateRepositoryNames).toEqual(["owner/secret"]);
  expect(report.repositories).toEqual(repositories);
  expect(report.summary).toEqual(summary);
});

/*
 * 💾 Report Persistence
 */

// Check that a custom external report path is created & receives the complete report
test("Report: External Report Persistence Check", () => {
  withoutGitHubActions(() => {
    const temporaryDirectory = mkdtempSync(
      path.join(os.tmpdir(), "tech-stats-report-"),
    );

    try {
      const filename = path.join(temporaryDirectory, "nested", "report.json");

      const report = createReport();

      const writtenPath = writePrivateReport(report, filename);

      expect(writtenPath).toBe(path.resolve(filename));

      expect(existsSync(filename)).toBe(true);

      const content = readFileSync(filename, "utf8");

      expect(JSON.parse(content)).toEqual(report);

      expect(content.endsWith("\n")).toBe(true);
    } finally {
      rmSync(temporaryDirectory, {
        recursive: true,
        force: true,
      });
    }
  });
});

// Check that the default report location resolves inside the user's home directory
test("Report: Default External Path Resolution Check", () => {
  withoutGitHubActions(() => {
    const temporaryHome = mkdtempSync(
      path.join(os.tmpdir(), "tech-stats-home-"),
    );

    const homeSpy = vi.spyOn(os, "homedir").mockReturnValue(temporaryHome);

    try {
      const report = createReport();

      const writtenPath = writePrivateReport(report);

      expect(writtenPath).toBe(
        path.join(
          temporaryHome,
          "tech-stats-reports",
          "tech-stats-report.json",
        ),
      );

      expect(existsSync(writtenPath)).toBe(true);
    } finally {
      homeSpy.mockRestore();

      rmSync(temporaryHome, {
        recursive: true,
        force: true,
      });
    }
  });
});

/*
 * 🔐 Report Security
 */

// ! Edge case: Repository-internal report path => error
test("Report: Edge Case - Repository-Internal Path Rejection", () => {
  withoutGitHubActions(() => {
    const filename = path.join(REPOSITORY_ROOT, "private-report-test.json");

    expect(() => writePrivateReport(createReport(), filename)).toThrow(
      "🔊 Private reports must be stored outside the repository.",
    );
  });
});

// ! Edge case: External symlink pointing back into the repository => error
test("Report: Edge Case - Symlinked Repository Path Rejection", () => {
  withoutGitHubActions(() => {
    const temporaryDirectory = mkdtempSync(
      path.join(os.tmpdir(), "tech-stats-symlink-"),
    );

    try {
      const repositoryLink = path.join(temporaryDirectory, "repository");

      symlinkSync(
        REPOSITORY_ROOT,
        repositoryLink,
        process.platform === "win32" ? "junction" : "dir",
      );

      const filename = path.join(repositoryLink, "private-report.json");

      expect(() => writePrivateReport(createReport(), filename)).toThrow(
        "🔊 Private reports must be stored outside the repository.",
      );
    } finally {
      rmSync(temporaryDirectory, {
        recursive: true,
        force: true,
      });
    }
  });
});

// ! Edge case: Persistent report requested in GitHub Actions => error
test("Report: Edge Case - GitHub Actions Persistence Rejection", () => {
  const originalGitHubActions = process.env.GITHUB_ACTIONS;

  const temporaryDirectory = mkdtempSync(
    path.join(os.tmpdir(), "tech-stats-actions-"),
  );

  try {
    process.env.GITHUB_ACTIONS = "true";

    expect(() =>
      writePrivateReport(
        createReport(),
        path.join(temporaryDirectory, "report.json"),
      ),
    ).toThrow("🔊 Persistent private audit reports are disabled in Actions.");
  } finally {
    if (originalGitHubActions === undefined) {
      delete process.env.GITHUB_ACTIONS;
    } else {
      process.env.GITHUB_ACTIONS = originalGitHubActions;
    }

    rmSync(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  }
});

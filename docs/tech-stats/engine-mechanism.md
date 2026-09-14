# 📈🛠️ Technology Statistics Engine

The **GitHub Technology Statistics engine** is a **_collection of scripts_** forming a **_deterministic analysis & rendering pipeline_**.

Its **_main purpose_** is to **_generate the technology-statistics SVGs displayed on my GitHub profile_** from evidence found across eligible GitHub repositories.

The **_engine_** is **_responsible exclusively for_** answering:

> **_"What technology statistics should be displayed?"_**

> 🖋️ _**N.B.:**_
>
> _Anything related to **scheduling, pull requests, branch management & automatic publication of changed statistics** is handled separately by the [**GitHub Workflow**](./github-workflow.md)._

## 📑 Table of Contents

- [🧭 Overview](#-overview)
  - [🗺️ Engine Flow](#️-engine-flow)
  - [📖 Recommended Reading Order](#-recommended-reading-order)
- [📂 Engine Structure](#-engine-structure)
- [🎯 Metrics](#-metrics)
  - [🌐 Language Share](#-language-share)
  - [📦 Repository Adoption](#-repository-adoption)
  - [🖋️ Curated Technologies](#️-curated-technologies)
- [🔎 Repository Selection](#-repository-selection)
  - [📋 Eligibility Rules](#-eligibility-rules)
  - [🎛️ Include & Exclude Rules](#️-include--exclude-rules)
  - [🔐 Private Selection Overrides](#-private-selection-overrides)
- [🧠 Technology Detection](#-technology-detection)
  - [📋 Accepted Evidence](#-accepted-evidence)
  - [🛡️ Detection Principles](#️-detection-principles)
- [📊 Analysis & Private Report](#-analysis--private-report)
  - [▶️ Running an Analysis](#️-running-an-analysis)
  - [🔍 Reviewing the Report](#-reviewing-the-report)
- [🎨 SVG Rendering](#-svg-rendering)
  - [▶️ Rendering Statistics](#️-rendering-statistics)
  - [📐 Layout Model](#-layout-model)
- [🔐 Privacy & Credential Boundaries](#-privacy--credential-boundaries)
- [✅ Validation & Tests](#-validation--tests)
- [⚠️ Engine Limits](#️-engine-limits)

## 🧭 Overview

The **_Technology Statistics Engine_** separates **_repository evidence, statistical calculation & public presentation into distinct stages_**:

```txt
scripts/
└── technology-statistics/
    ├── tests/
    │   ├── engine.test.mjs
    │   └── workflow.test.mjs
    │
    ├── analyze.mjs
    ├── config.json
    ├── index.mjs
    ├── render.mjs
    └── rules.mjs
```

```txt
technology-statistics/
│
├── index.mjs
│   └── Entry point / orchestration
│
├── analyze.mjs
│   └── Repository analysis & evidence collection
│
├── rules.mjs
│   └── Technology detection rules
│
├── render.mjs
│   └── SVG generation
│
├── config.json
│   └── Shared engine configuration
│
└── tests/
    ├── engine.test.mjs
    │   └── Engine behavior & deterministic logic
    │
    └── workflow.test.mjs
        └── Workflow-specific behavior
```

1. _A repository is first selected for analysis,_
2. _Then it is inspected for recognized technical evidence,_
3. _The resulting evidence is stored in a private analysis report before aggregate statistics are rendered into public SVG files thanks by the workflow._

> 🖋️ _**N.B.:**_
>
> _This **separation** allows the **evidence to remain inspectable** without exposing repository-level information in the GitHub profile._

### 🗺️ Engine Flow

The engine follows the flow below:

```txt
Eligible GitHub repositories
│
▼
┌──────────────────────────────┐
│ Repository Selection │
│ │
│ Ownership │
│ Public / authorized private │
│ Include / exclude rules │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│ Repository Analysis │
│ │
│ GitHub Linguist │
│ Git trees │
│ Manifests │
│ Configuration files │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│ Technology Detection │
│ │
│ Deterministic evidence rules │
│ rules.mjs │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│ Private Analysis Report │
│ │
│ Repository-level evidence │
│ Language bytes │
│ Aggregate measurements │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│ SVG Rendering │
│ │
│ Metric calculation │
│ Card layout │
│ Theme-aware assets │
└──────────────┬───────────────┘
│
▼
assets/tech-stack/statistics/\*.svg
```

The final SVGs contain only aggregate public statistics.

> 🗒️🖋️ **_N.B._:**
>
> _The engine measures **repository evidence**, not personal proficiency._
>
> _A percentage indicates what can be supported by the analyzed repositories. It must not be interpreted as a skill rating._

### 📖 Recommended Reading Order

The implementation is easier to understand when its orchestration is read before its individual detection rules.

```txt
scripts/
└── technology-statistics/
    ├── tests/
    │   ├── engine.test.mjs
    │   └── workflow.test.mjs
    │
    ├── config.json
    ├── index.mjs
    ├── analyze.mjs
    ├── rules.mjs
    └── render.mjs
```

For a first review, follow this order:

| Order |                 File                  | Responsibility                                                        |
| :---: | :-----------------------------------: | --------------------------------------------------------------------- |
| **1** |    `scripts/tech-stack/index.mjs`     | _Understand the engine entry point & available commands_              |
| **2** |   `scripts/tech-stack/config.json`    | _Understand shared analysis, evidence & rendering configuration_      |
| **3** |    `assets/tech-stack/data/*.json`    | _Understand which technologies are displayed & how they are measured_ |
| **4** |    `scripts/tech-stack/rules.mjs`     | _Understand what repository evidence counts for each technology_      |
| **5** | `scripts/tech-stack/tests/*.test.mjs` | _Understand the expected behavior & protected edge cases_             |

This order intentionally leaves `rules.mjs` until the surrounding architecture is understood.

The detection rules contain most of the engine's domain-specific complexity, but they become easier to evaluate once the reader knows what information enters them & how their results are used.

[🔼 Back to Table of Contents](#-table-of-contents)

## 📂 Engine Structure

The engine separates **public configuration**, **analysis logic**, **private evidence** & **generated outputs** so each responsibility can evolve independently.

The main locations are:

| Location                             | Responsibility                                                                                       |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `assets/tech-stack/data/*.json`      | Define the six public sections, technology ordering, metric types, rule references & icon references |
| `assets/tech-stack/icons/`           | Store local technology icons, theme variants & source/license information                            |
| `assets/tech-stack/statistics/*.svg` | Store the six final public statistics SVGs                                                           |
| `scripts/tech-stack/config.json`     | Define repository selection, evidence limits, ignored paths, shared layout & theme values            |
| `scripts/tech-stack/index.mjs`       | Provide the main analysis & rendering entry point                                                    |
| `scripts/tech-stack/rules.mjs`       | Define deterministic technology-detection rules                                                      |
| `scripts/tech-stack/*.test.mjs`      | Validate calculations, detection, privacy, rendering & edge cases                                    |

The six public section-definition files describe **what should be displayed**, while `rules.mjs` describes **what evidence is sufficient to detect it**.

This distinction allows presentation decisions to remain separate from implementation-specific detection logic.

### 🛠️ Common Modification Map

Most changes should begin in one clearly defined part of the engine.

Use the table below to identify the correct starting point before modifying implementation code.

| Goal                                             | Start With                                   |
| ------------------------------------------------ | -------------------------------------------- |
| Add, remove or reorder a displayed technology    | `assets/tech-stack/data/*.json`              |
| Change a technology's metric type                | `assets/tech-stack/data/*.json`              |
| Change what counts as evidence for a technology  | `scripts/tech-stack/rules.mjs`               |
| Change repository selection or evidence limits   | `scripts/tech-stack/config.json`             |
| Change SVG dimensions, spacing or theme values   | `scripts/tech-stack/config.json`             |
| Understand why a repository matched a technology | Generate & inspect a private analysis report |
| Change engine command behavior                   | `scripts/tech-stack/index.mjs`               |
| Verify behavior before or after a refactor       | `scripts/tech-stack/*.test.mjs`              |

> 🗒️🖋️ **_N.B._:**
>
> _Detection must remain **deterministic & evidence-based**._
>
> _Recurring AI inference is intentionally excluded from the engine because the same repository state should produce the same statistical interpretation._

[🔼 Back to Table of Contents](#-table-of-contents)

## 🎯 Metrics

The GitHub profile uses **three metric types** because not every technology can be measured meaningfully from repository contents.

Each displayed technology is assigned one of the following:

- **Language Share**,
- **Repository Adoption**,
- **Curated**.

The metric type determines how its displayed value is produced.

### 🌐 Language Share

**Language Share** represents the proportion of relevant source-code bytes attributed to each displayed web language according to GitHub Linguist.

The relevant languages are:

- TypeScript,
- JavaScript,
- HTML,
- CSS.

The metric is calculated as:

```txt
language bytes
────────────────────────────── × 100
all relevant language bytes
```

Only the displayed relevant languages participate in the denominator.

Other languages returned by GitHub Linguist may remain available in the private analysis report without affecting the public percentage.

For example, SCSS data may be retained for inspection while remaining outside the displayed Language Share calculation.

Values use one decimal place & should total approximately `100%`.

> 🗒️🖋️ **_N.B._:**
>
> _GitHub Linguist data may lag recent repository changes._
>
> _Language Share therefore represents the latest measurements returned by GitHub rather than a perfectly atomic snapshot of every repository._

### 📦 Repository Adoption

**Repository Adoption** represents the percentage of analyzed repositories in which recognized evidence for a technology is found.

The metric is calculated as:

```txt
repositories containing recognized evidence
────────────────────────────────────────── × 100
all analyzed repositories
```

A repository counts only once for a technology, regardless of how many matching packages, workspaces or configuration files it contains.

Repository Adoption values are independent.

They therefore **do not add up to `100%`**.

For example:

```txt
React 70%
Next.js 40%
Storybook 30%
```

means that React evidence was found in `70%` of analyzed repositories, Next.js in `40%` & Storybook in `30%`.

The same repository may contribute to several technologies.

### 🖋️ Curated Technologies

Some technologies belong to my actual workflow but cannot be measured reliably from repository contents.

Those technologies display:

```txt
Curated
```

instead of a percentage.

The current curated technologies are:

- Figma,
- Git,
- GitHub,
- Vercel.

A curated value must not be interpreted as an estimated percentage.

It intentionally communicates:

> _This technology belongs to the represented stack, but repository evidence cannot produce a meaningful numeric measurement._

When a numeric metric has no valid denominator, the engine displays:

```txt
No data
```

instead of fabricating a percentage.

[🔼 Back to Table of Contents](#-table-of-contents)

## 🔎 Repository Selection

Repository selection determines which repositories contribute to the statistics & therefore forms part of the statistical model itself.

The engine analyzes repositories owned by the configured GitHub account that satisfy its eligibility rules.

### 📋 Eligibility Rules

Eligible repositories may be:

- Public repositories,
- Authorized private repositories.

The engine excludes:

- Forks,
- Archived repositories,
- The GitHub profile repository itself,
- Explicitly excluded repositories.

Empty eligible repositories remain part of the analyzed set.

This behavior is deliberate because Repository Adoption answers:

> _In what proportion of my analyzed repositories does this technology appear?_

An empty repository therefore still contributes to the denominator even when it contributes no detected technology.

### 🎛️ Include & Exclude Rules

Public repository selection is controlled through `include` & `exclude` lists.

An empty include list:

```json
{
  "include": []
}
```

means that every otherwise eligible repository may be analyzed.

A non-empty include list restricts the analysis to the listed full repository names.

Exclusions always take precedence.

An include entry cannot bypass:

- Repository ownership,
- Fork exclusion,
- Archive exclusion,
- Profile-repository exclusion.

Repository names are compared case-insensitively.

### 🔐 Private Selection Overrides

Private repository names should not be stored in tracked public configuration.

When private repository selection must differ from the public configuration, the engine accepts the `TECH_STATS_REPOSITORIES` environment variable.

The value is a JSON object containing optional `include` & `exclude` arrays.

Each provided private array replaces its corresponding public selection list.

Locally, it may be supplied as a process environment variable.

In GitHub Actions, it may be provided through an Actions repository variable.

The value is consumed during analysis without being copied into public generated outputs.

[🔼 Back to Table of Contents](#-table-of-contents)

## 🧠 Technology Detection

Technology detection determines whether an analyzed repository contains **recognized evidence** for a displayed technology.

The engine deliberately answers a narrow question:

> **Does this repository contain evidence that satisfies the configured detection rule?**

It does not attempt to prove:

- Production deployment,
- Active runtime usage,
- Personal proficiency,
- Frequency of use inside the repository.

All concrete detection checks are centralized in:

```txt
scripts/tech-stack/rules.mjs
```

The analyzer may inspect:

- Default-branch Git trees,
- Selected manifests,
- Dependency declarations,
- Dedicated configuration files,
- Prisma schemas,
- Compose files,
- Workflow definitions.

It does not:

- Install project dependencies,
- Execute analyzed project scripts,
- Import analyzed project code,
- Treat lockfiles alone as adoption evidence,
- Use recurring AI inference.

### 📋 Accepted Evidence

The table below summarizes the evidence currently recognized for each measurable technology.

| Technology   | Recognized Evidence                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| React        | Direct `react` declaration                                                                                                                                                                       |
| Next.js      | Direct `next` declaration or dedicated Next.js configuration                                                                                                                                     |
| React Native | Direct `react-native` declaration                                                                                                                                                                |
| Electron     | Direct `electron` declaration                                                                                                                                                                    |
| Tailwind CSS | Direct packages or dedicated configuration                                                                                                                                                       |
| Storybook    | Direct Storybook packages, `@storybook/*` or dedicated configuration                                                                                                                             |
| Node.js      | Recognized server runtime dependency; an explicit Node engine combined with a checked-in CLI implementation; or a start/serve/server script explicitly executing checked-in JS/TS through `node` |
| NestJS       | NestJS core declaration or dedicated configuration                                                                                                                                               |
| Prisma       | Prisma package declaration or Prisma schema                                                                                                                                                      |
| PostgreSQL   | Recognized direct driver, Prisma datasource provider or official PostgreSQL Compose image                                                                                                        |
| MongoDB      | Recognized direct driver, Prisma datasource provider or official MongoDB Compose image                                                                                                           |
| Husky        | Direct package or supported configuration                                                                                                                                                        |
| Jest         | Direct package or supported configuration                                                                                                                                                        |
| Playwright   | Direct package or dedicated configuration                                                                                                                                                        |
| Supabase     | Direct package or dedicated configuration                                                                                                                                                        |
| Biome        | Direct package or dedicated configuration                                                                                                                                                        |
| Docker       | Dockerfile or Compose evidence                                                                                                                                                                   |
| Turborepo    | `turbo` dependency, `turbo.json` or `turbo.jsonc`                                                                                                                                                |

Direct package evidence may come from:

- `dependencies`,
- `devDependencies`,
- `peerDependencies`,
- `optionalDependencies`.

Lockfiles alone do not count.

A transitive dependency may appear in a lockfile even when the repository does not directly adopt that technology.

> 🗒️🖋️ **_N.B._:**
>
> _Vercel currently uses the **Curated** metric._
>
> _A deterministic Vercel detection rule may remain available internally for future use, but it does not currently produce the displayed value._

### 🛡️ Detection Principles

Detection rules intentionally favor **supported evidence over inference**.

Examples include:

- A Next.js repository is not automatically considered a Node.js repository,
- A Next.js repository is not automatically considered deployed on Vercel,
- A lockfile does not automatically prove direct adoption,
- A technology configured exclusively outside GitHub may remain invisible,
- An unsupported custom integration may not be recognized.

A displayed `0%` therefore means:

> _No recognized evidence was found in the analyzed default branches._

It does **not** mean:

> _The technology has never been used._

Synthetic fixtures provide positive evidence for detection rules that may not currently match any real analyzed repository.

This allows those rules to remain tested even when current repository adoption is `0%`.

[🔼 Back to Table of Contents](#-table-of-contents)

## 📊 Analysis & Private Report

Analysis gathers repository-level evidence before anything is rendered publicly.

The result is a **private report** that acts as the main inspection & debugging artifact for the engine.

This separation allows evidence to be reviewed before aggregate statistics are published.

### ▶️ Running an Analysis

When `TECH_STATS_TOKEN` is already supplied securely:

```powershell
node scripts/tech-stack/index.mjs analyze --report "$env:TEMP\tech-stack-private-report.json"
```

For a local implementation review using an existing GitHub CLI login:

```powershell
node scripts/tech-stack/index.mjs analyze --local-gh --report "$env:TEMP\tech-stack-private-report.json"
```

The `--local-gh` option is intended for local review only.

It:

- Uses the existing GitHub CLI authentication,
- Does not export the CLI credential into application code,
- Must not be used in GitHub Actions,
- Does not verify the permissions of `TECH_STATS_TOKEN`.

Credentials must never be pasted directly into commands or committed into files.

### 🔍 Reviewing the Report

The private report may contain:

- Included repository counts,
- Excluded repository counts,
- Repository selection,
- Per-repository language bytes,
- Detection evidence,
- Aggregate language totals,
- Calculated statistics.

Because this information may identify private repositories, the report must remain outside the repository checkout.

Paths inside the checkout are rejected, including paths that resolve into it through symlinks.

The report must not be:

- Committed,
- Uploaded as a public artifact,
- Copied into generated SVG files,
- Exposed through workflow logs.

After repository selection or detection rules change, a new analysis must be generated before the resulting statistics are considered current.

[🔼 Back to Table of Contents](#-table-of-contents)

## 🎨 SVG Rendering

SVG rendering transforms the private report's aggregate measurements into the six public technology-statistics strips displayed in the profile README.

Rendering is intentionally separated from repository analysis so visual output may be regenerated from an already-reviewed report without re-reading repositories.

### ▶️ Rendering Statistics

After reviewing the private report, render the public statistics with:

```powershell
node scripts/tech-stack/index.mjs render --report "$env:TEMP\tech-stack-private-report.json"
```

When candidate outputs should be inspected before replacing the final assets, use the command's `--output` option with a temporary directory.

Rendering recalculates aggregate statistics from the report.

If repository selection or detection logic changes, run a new analysis before rendering again.

### 📐 Layout Model

Shared rendering configuration is centralized in:

```txt
scripts/tech-stack/config.json
```

It defines values such as:

- Theme colors,
- Canvas dimensions,
- Card dimensions,
- Icon sizes,
- Font sizes,
- Gaps,
- Pills,
- Padding,
- Row limits.

All statistic sections use a shared outer SVG canvas width of:

```txt
560
```

internal SVG units.

Rows are centered inside the shared canvas.

A section containing fewer cards therefore receives additional horizontal space rather than changing card dimensions.

Five-card sections use centered rows of:

```txt
3 cards
2 cards
```

The GitHub profile README displays all six statistics SVGs using the same image width so their visible scale remains consistent.

> 🗒️🖋️ **_N.B._:**
>
> _The SVG `viewBox` defines the internal coordinate system._
>
> _The README `<img width="...">` defines the SVG's displayed size._
>
> _Changing the README width scales the whole SVG proportionally; it does not change the internal canvas._

The renderer rejects layouts that cannot fit inside the configured canvas instead of silently stretching or distorting them.

[🔼 Back to Table of Contents](#-table-of-contents)

## 🔐 Privacy & Credential Boundaries

The engine allows authorized private repositories to contribute to aggregate statistics without exposing their repository-level information publicly.

Production analysis uses:

```txt
TECH_STATS_TOKEN
```

with read access to eligible repository:

- Metadata,
- Contents.

The credential is used only for repository analysis.

Raw manifests & configuration content remain in memory during processing.

Public SVG outputs contain only:

- Public technology definitions,
- Aggregate statistics,
- Public visual assets.

They must not contain:

- Private repository names,
- Repository URLs,
- File paths,
- Per-repository evidence,
- Credentials,
- Private analysis reports.

Private selection overrides must never be serialized into public files.

Before replacing public SVGs, the engine validates generated outputs & relevant public resources for private repository identifiers or credential material.

Exact collisions between a private repository name & legitimate public technology/source wording may therefore cause a conservative privacy failure requiring manual review.

> 🗒️🖋️ **_N.B._:**
>
> _The engine intentionally prefers a failed generation over silently publishing potentially private information._

[🔼 Back to Table of Contents](#-table-of-contents)

## ✅ Validation & Tests

The test suite protects the engine's calculations, detection behavior, privacy rules & SVG output assumptions.

Run the complete engine test suite with:

```powershell
node --test scripts/tech-stack/\*.test.mjs
```

Tests cover areas such as:

- Repository selection,
- Public & private repository pagination,
- Language Share denominators,
- Repository Adoption denominators,
- Empty datasets,
- Nested manifests,
- Deterministic technology detection,
- Truncated Git trees,
- Privacy validation,
- SVG identifiers,
- Light & dark icon variants,
- Row layouts.

The tests also include positive synthetic fixtures for technologies that may not currently appear in the analyzed repository set.

When modifying engine behavior, the recommended validation sequence is:

```txt
Modify engine
│
▼
Run tests
│
▼
Run analysis
│
▼
Review private report
│
▼
Render candidate SVGs
│
▼
Inspect generated output
```

A change should not be considered complete solely because the renderer produced SVG files.

The resulting evidence & aggregate values should remain understandable through the private report.

[🔼 Back to Table of Contents](#-table-of-contents)

## ⚠️ Engine Limits

The Technology Statistics Engine intentionally accepts several limitations in exchange for deterministic, auditable & privacy-conscious behavior.

Known limits include:

- GitHub Linguist data may lag recent repository changes,
- Repository listing & Linguist measurements do not form a perfectly atomic snapshot,
- Custom or unsupported technology integrations may not be detected,
- Deployment evidence configured only outside GitHub may remain invisible,
- Generated entry points may be missed,
- Conservative rules may produce false negatives,
- Private-name collisions may trigger privacy validation failures.

Analysis also fails rather than silently continuing when required evidence cannot be processed reliably.

Examples include:

- GitHub API failures,
- Malformed manifests,
- Oversized evidence beyond configured limits,
- Unresolved truncated Git-tree traversal.

This failure behavior is deliberate.

> **Incomplete statistics should fail visibly rather than appear complete while being based on incomplete evidence.**

[🔼 Back to Table of Contents](#-table-of-contents)

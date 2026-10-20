# 📈 Technology Statistics Engine

The **_Technology Statistics Engine_** is a **_TypeScript application_** that **_analyzes evidence_** from eligible GitHub repositories **_& generates configurable Technology Statistics SVGs_** for my GitHub Profile.

It **_supports evidence-based measurements & predefined labels_** for technologies that cannot be reliably quantified from repository data.

This **_document provides a starting point_** for installing, exploring & executing the engine.

> 🖋️ **_N.B.:_**
>
> _**Detailed customization instructions** are maintained separately **in the ['Engine Setup' guide](./engine-setup.md)**._

## 📑 Table of Contents

- [🧭 Documentation Listing](#-documentation-listing)
- [🚀 Quick Start](#-quick-start)
- [▶️ Available Commands](#️-available-commands)
- [🛠️ Modifying the Engine](#️-modifying-the-engine)
- [✅ Validation](#-validation)

## 🧭 Documentation Listing

The **_Technology Statistics documentation_** is divided into **_3 complementary documents_**:

|                           Document                            |                      Purpose                       | Examples                                                                |
| :-----------------------------------------------------------: | :------------------------------------------------: | :---------------------------------------------------------------------- |
| [Engine Mechanism](../../docs/tech-stats/engine-mechanism.md) |     **_Understand the engine's architecture_**     | _Detection mechanisms, metrics & security boundaries_                   |
|               [Engine Setup](./engine-setup.md)               |             **_Configure the engine_**             | _Modify its definitions or implementation & validate your changes_      |
|  [GitHub Workflow](../../docs/tech-stats/github-workflow.md)  | **_Understand how GitHub Actions workflow works_** | _How the workflow validates, executes & publishes generated statistics_ |

> 🖋️ **_N.B.:_**
>
> _For **developers unfamiliar with the project**, the **recommended reading order** is to **follow the list in the table above**._

[🔼 Back to the Table of Contents](#-table-of-contents)

## 🚀 Quick Start

To **_start the engine locally_**, the **_following tools are the baseline_** to install on your machine:

- [`Node.js`](https://nodejs.org/en) 22,
- [`pnpm`](https://pnpm.io/) 12.4.2,
- [GitHub CLI _(`gh`)_](https://cli.github.com/) with access to the repositories you intend to analyze.

**_For private repository analysis_**, the **_authenticated GitHub account must_** also have **_access to the selected private repositories_**.

> 🖋️ **_N.B.:_**
>
> _Refer to the [Engine Setup guide](./engine-setup.md) for repository-access requirements._

**_In a terminal_**, follow these steps **_from the repository root_**:

1. Install `pnpm` if it is not already installed:

```bash
npm install -g pnpm@12.4.2
```

2. Navigate to the engine directory:

```bash
cd scripts/tech-stats
```

3. Install the engine dependencies:

```bash
pnpm install
```

4. Check your existing GitHub CLI authentication:

```bash
gh auth status
```

> 🖋️ **_N.B.:_**
>
> _If **`pnpm` is already installed**, **check its version using `pnpm --version`** instead of reinstalling it._
>
> _If you are **not authenticated**, use `gh auth login` to **configure access**._
>
> _**Refer to [Engine Setup](./engine-setup.md)** for detailed authentication, configuration & installation instructions._

[🔼 Back to the Table of Contents](#-table-of-contents)

## ▶️ Available Commands

Here are the **_available commands from_** `scripts/tech-stats/` **_engine directory_**:

|           Command            | Purpose                                                     |
| :--------------------------: | :---------------------------------------------------------- |
|     `pnpm run typecheck`     | Validate the TypeScript implementation                      |
|       `pnpm run test`        | Execute the Engine & Workflow test suites                   |
| `pnpm run tech-stats:report` | Analyze repositories & generate a private inspection report |
|    `pnpm run tech-stats`     | Perform a fresh analysis & regenerate the public SVGs       |

> 🖋️ **_N.B.:_**
>
> _The **private report** is **stored outside the Git repository**. By default, its destination is `~/tech-stats-reports/tech-stats-report.json`._
>
> _A **custom destination can be specified** using the `--report-path` **argument**:_
>
> ```bash
> pnpm run tech-stats:report --report-path "/path/outside/repository/report.json"
> ```
>
> _**Public SVGs** are **generated in** `assets/tech-stats/statistics/`. The **engine synchronizes this directory with the current statistics definitions**, including removing obsolete generated SVGs._

[🔼 Back to the Table of Contents](#-table-of-contents)

## 🛠️ Modifying the Engine

In order to **_modify the engine_**, refer to the following **_table to identify which files or directories are relevant_** to the intended changes:

| Goal                                           |                           Start With                           |
| :--------------------------------------------- | :------------------------------------------------------------: |
| Change repository selection or analysis limits |                           `config/`                            |
| Add, remove or reorder displayed technologies  |                         `definitions/`                         |
| Modify supported technology evidence           |         `config/detection-rules.json` or `detectors/`          |
| Change icons, dimensions, spacing or themes    | `assets/tech-stats/icons/` or `config/rendering-settings.json` |
| Modify implementation behavior                 |                             `src/`                             |
| Update or extend automated verification        |                            `tests/`                            |

> 🖋️ **_N.B.:_**
>
> _The **['Engine Setup' guide](./engine-setup.md) provides the corresponding procedures**._
>
> _It includes the JSON Schema contract, detection-rule modifications, rendering geometry & test updates._

[🔼 Back to the Table of Contents](#-table-of-contents)

## ✅ Validation

After modifying the engine, follow these steps from the `scripts/tech-stats/` directory:

1. Run the **_TypeScript validation_**:

```bash
pnpm run typecheck
```

2. Run the **_automated test suites_**:

```bash
pnpm run test
```

3. **_Generate a private report_** using 🔬 **_'Analyze' mode_**:

```bash
pnpm run tech-stats:report
```

4. **_Inspect the private report_** to verify the recognized evidence & calculated statistics

5. Once the analysis results are satisfactory, **_generate the public SVGs_** using 📈 **_'Generate' mode_**:

```bash
pnpm run tech-stats
```

6. **_Visually inspect the resulting SVGs_** to verify their displayed values, layout & light/dark theme variants

> 🖋️ **_N.B.:_**
>
> _The 📈 **'Generate' mode performs a fresh analysis** rather than reusing the previously generated private report._
>
> _For the **complete validation procedure & GitHub Actions setup**, refer to the ['Engine Setup' guide](./engine-setup.md)._

[🔼 Back to the Table of Contents](#-table-of-contents)

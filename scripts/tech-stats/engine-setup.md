# 📈🛠️ Technology Statistics Engine - Step-by-step Setup

The **_Technology Statistics Engine separates_** its configuration, statistics definitions, detection logic & rendering resources **_into distinct components_**. Consequently, **_modifying the generated statistics may require changes_** to one or several files, depending on the intended result.

This **_guide explains how to prepare_** the engine's development environment, **_configure_** its behavior, **_customize_** the displayed technologies & **_validate changes_** before they are accepted or published. **_It covers both_** routine configuration changes & modifications requiring **_additional implementation or automated tests_**.

> 🖋️ **_N.B.:_**
>
> _For the **underlying architecture & automation mechanisms**, refer to the **[Engine Mechanism](../../docs/tech-stats/engine-mechanism.md) & [GitHub Workflow](../../docs/tech-stats/github-workflow.md) documentation**._

## 📑 Table of Contents

- [🎯 Purpose & Scope](#-purpose--scope)
- [🚀 Development Setup](#-development-setup)
  - [📦 Prerequisites & Installation](#-prerequisites--installation)
  - [🔑 Local GitHub Authentication](#-local-github-authentication)
- [⚙️ Engine Configuration](#️-engine-configuration)
  - [📂 Configuration Files](#-configuration-files)
  - [🔐 Repository Selection & Private Overrides](#-repository-selection--private-overrides)
- [📚 Statistics Definitions & JSON Schema](#-statistics-definitions--json-schema)
  - [📝 Creating & Modifying Definitions](#-creating--modifying-definitions)
  - [🧱 Schema Validation](#-schema-validation)
- [🔎 Technology Detection](#-technology-detection)
  - [📋 Declarative Detection Rules](#-declarative-detection-rules)
  - [🛠️ Specialized Detectors](#️-specialized-detectors)
- [🎨 Visual Customization](#-visual-customization)
  - [🖼️ Technology Icons & Theme Variants](#-technology-icons--theme-variants)
  - [📐 Layout, Margins & Spacing](#-layout-margins--spacing)
- [▶️ Engine Execution](#-engine-execution)
  - [🔬 Private Analysis](#-private-analysis)
  - [📈 Public SVG Generation](#-public-svg-generation)
- [🧪 Tests & Validation](#-tests--validation)
  - [🔧 Updating Implementation & Tests](#-updating-implementation--tests)
  - [✅ Local Validation Sequence](#-local-validation-sequence)
- [☁️ GitHub Actions Setup](#️-github-actions-setup)
  - [🔒 Secrets & Permissions](#-secrets--permissions)
  - [🔄 Manual Execution & Verification](#-manual-execution--verification)
- [🛑 Troubleshooting & Safety](#-troubleshooting--safety)
  - [🚩 Common Issues](#-common-issues)
  - [🔑 Repository Access Problems](#-repository-access-problems)
  - [📋 Configuration or Definition Problems](#-configuration-or-definition-problems)
  - [🔎 Detection Problems](#-detection-problems)
  - [📥 Evidence Collection Limits](#-evidence-collection-limits)
  - [🖼️ Icon & Rendering Problems](#️-icon--rendering-problems)
  - [📈 Missing or Unexpected Generated SVGs](#-missing-or-unexpected-generated-svgs)
  - [☁️ GitHub Actions Problems](#️-github-actions-problems)
  - [🔐 Protect Private Information](#-protect-private-information)
  - [📋 Final Checklist](#-final-checklist)

## 🎯 Purpose & Scope

The **_Engine Setup guide_** provides the **_practical instructions_** required to **_configure, customize, execute & maintain the Technology Statistics Engine_**.

It is **_intended for developers_** who need to **_understand which files to modify, how their changes affect the engine & what must be verified_** before accepting the resulting statistics.

The **_guide covers_** the following development activities:

|        Development Area         | Scope                                                                                                                          |
| :-----------------------------: | :----------------------------------------------------------------------------------------------------------------------------- |
|   **Development Environment**   | _**Install** the required tools, **prepare** dependencies & **configure** GitHub authentication_                               |
|    **Engine Configuration**     | _**Configure** repository selection, private overrides, evidence limits & resource paths_                                      |
|   **Statistics & Detection**    | _**Create or modify** statistics definitions, understand the JSON Schema contract & extend technology detection_               |
|    **Visual Customization**     | _**Manage** technology icons, theme variants, SVG dimensions, margins & spacing_                                               |
| **Implementation & Validation** | _**Modify engine code** when necessary, **update the corresponding tests**, execute both engine modes & inspect their outputs_ |
|    **GitHub Actions Setup**     | _**Configure the required secrets & permissions**, manually execute the workflow & verify its results_                         |

> 🖋️ **_N.B.:_**
>
> _However, this **guide focuses on practical development procedures**, rather than repeating the system's architectural explanations or the workflow's internal publication mechanisms._
>
> _For those subjects, refer to:_
>
> - _[Engine Mechanism](../../docs/tech-stats/engine-mechanism.md) — For architecture, processing responsibilities, metric calculations & security boundaries._
> - _[GitHub Workflow](../../docs/tech-stats/github-workflow.md) — For automated execution, scheduling, pull-request management & publication._

[🔼 Back to the Table of Contents](#-table-of-contents)

## 🚀 Development Setup

This **_section_** covers the **_development requirements_** & explains **_how to configure GitHub authentication & repository access_** for **_local engine execution_**.

### 📦 Prerequisites & Installation

As a reminder, the engine relies on **_3 development tools_**:

|                 Tool                  | Baseline Version | Purpose                                                            |
| :-----------------------------------: | :--------------: | :----------------------------------------------------------------- |
|   [Node.js](https://nodejs.org/en)    |        22        | _To execute the TypeScript engine through its development tooling_ |
|       [pnpm](https://pnpm.io/)        |      12.4.2      | _To install dependencies & execute the engine's package scripts_   |
| [GitHub CLI](https://cli.github.com/) |        —         | _To authenticate & retrieve GitHub repository information_         |

All subsequent **_engine commands must be executed from_**:

```txt
📂 scripts/tech-stats/
```

**1. Verify the installed tools**

Open a terminal & **_check the installed versions_**:

```bash
node --version
pnpm --version
gh --version
```

> 🖋️ **_N.B.:_**
>
> - _If Node is missing, go to [Node.js website](https://nodejs.org/en) and download version 22._
> - _If `pnpm` is missing, install the project's configured version:_
>
> ```bash
> npm install -g pnpm@12.4.2
> ```
>
> - _If GitHub CLI is missing, go to [its website](https://cli.github.com/)._

**2. Prepare the engine dependencies**

Still in the terminal, **_install the dependencies_**:

```bash
pnpm install
```

The **_installation command uses the package configuration & lockfile_** maintained in `/scripts/tech-stats/`.

[🔼 Back to the Table of Contents](#-table-of-contents)

### 🔑 Local GitHub Authentication

To execute the engine **_locally_**, **_both 🔬 'Analyze' & 📈 'Generate' modes_** require an **_authenticated GitHub CLI session_**.

To check if your GitHub account is linked to the GitHub CLI, open a terminal & **_execute_**:

```bash
gh auth status
```

- **_Case 1_**: If you are **_authenticated_**, you should **_receive a response_** like:

```txt
github.com
  ✓ Logged in to github.com account [MonPseudoGitHub] (keyring)
  - Active account: true
  - Git operations protocol: https
  - Token: gho_************************************
  - Token scopes: 'gist', 'project', 'read:org', 'repo'
```

- **_Case 2_**: If you are **_not authenticated_**, **_run_** the following command:

```bash
gh auth login
```

Then, follow the interactive instructions to **_link your GitHub account to GitHub CLI_**.

> 🖋️ **_N.B.:_**
>
> _**Authentication** determines **which repositories the engine can access**. Thus, make sure to **sign in to the GitHub account containing the repositories to analyze**._
>
> _**Repository-selection configuration** determines which of those **repositories participate in the statistics**. For this matter, refer to [Repository Selection & Private Overrides](#-repository-selection--private-overrides)._

[🔼 Back to the Table of Contents](#-table-of-contents)

## ⚙️ Engine Configuration

This **_section_** explains where to **_find the engine's configuration files_**, how to **_modify its settings_** & how to **_customize repository selection_** without exposing private repository names.

[🔼 Back to the Table of Contents](#-table-of-contents)

### 📂 Configuration Files

The **_engine's configuration is centralized_** in:

```txt
📂 scripts/tech-stats/
└── 📂 config/
    ├── analysis-settings.json
    ├── detection-rules.json
    ├── paths-settings.json
    ├── rendering-settings.json
    └── repository-settings.json
```

**_Each file_** controls a **_specific aspect of the engine_**:

|     Configuration File     | What You Can Configure                                                     |
| :------------------------: | :------------------------------------------------------------------------- |
| `repository-settings.json` | _Repository owner, inclusion & exclusion lists_                            |
|  `analysis-settings.json`  | _Ignored paths, evidence-file count & individual file-size limits_         |
|   `detection-rules.json`   | _Recognized dependency declarations, configuration files & package fields_ |
| `rendering-settings.json`  | _SVG dimensions, card layout, spacing, typography & theme colors_          |
|   `paths-settings.json`    | _Locations of statistics definitions, icons & generated SVGs_              |

**_In general_**, you can proceed **_as follows to modify the configuration files_**:

**1. Identify the configuration to modify**

**_Use the table above to locate the file_** corresponding to your intended change.

**2. Open & edit the configuration file**

**_Modify the relevant JSON properties_**, keeping the existing structure & valid JSON syntax.

> 🖋️ **_N.B.:_**
>
> _**Paths** declared in `paths-settings.json` are **relative to the repository root**, not to the engine directory._
>
> _Detailed instructions for modifying `detection-rules.json` & `rendering-settings.json` are provided in [Technology Detection](#-technology-detection) & [Visual Customization](#-visual-customization), respectively._

**3. Save & validate your changes**

After **_saving_** the configuration, **_follow the [Local Validation Sequence](#-local-validation-sequence) to verify_** that the engine accepts the updated settings & produces the intended results.

[🔼 Back to the Table of Contents](#-table-of-contents)

### 🔐 Repository Selection & Private Overrides

**_Repository selection determines which repositories contribute_** to the generated Technology Statistics.

The **_engine supports 2 configuration methods_**:

|          Method          | When to Use It                                                                   |
| :----------------------: | :------------------------------------------------------------------------------- |
| **Public configuration** | _Define **repository-selection settings** that can safely be committed_          |
|   **Private override**   | _**Customize repository selection** without committing private repository names_ |

**1. Configure public repository selection**

Open:

```txt
📄 scripts/tech-stats/config/repository-settings.json
```

The **_configuration contains 3 properties_**:

```json
{
  "owner": "USERNAME",
  "include": [],
  "exclude": []
}
```

**_Configure those required properties_** according to the repositories you want to analyze:

| Property  | What to Configure                                                                                                  | When Left Empty                                      |
| :-------: | :----------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------- |
|  `owner`  | _Enter the GitHub username owning the repositories to analyze_                                                     | _Must **not be empty**_                              |
| `include` | _Enter the full names of repositories **to include**, such as `USERNAME/project-a`_                                | _All otherwise eligible repositories are considered_ |
| `exclude` | _Enter the full names of repositories that must **not** participate in the analysis, such as `USERNAME/project-x`_ | _No additional repositories are explicitly excluded_ |

> 🖋️ **_N.B.:_**
>
> _**Built-in eligibility restrictions** still apply even when **both arrays are empty**._

🗒️ **_Example:_**

```json
{
  "owner": "hal-9000",
  "include": ["hal-9000/help-the-humans", "hal-9000/maintain-the-space-ship"],
  "exclude": ["hal-9000/help-the-humans"]
}
```

_In this example, only `hal-9000/maintain-the-space-ship` remains selected, provided it satisfies the engine's eligibility requirements._

> 🖋️ **_N.B.:_**
>
> _**Exclusion takes precedence** over inclusion._
>
> _The **engine also automatically excludes forks, archived repositories & the GitHub Profile repository**, regardless of the configured lists._

**2. _Optional_: Configure private repository-selection overrides**

If your **_configuration needs to reference private repositories whose names should not appear_** in committed files:

1. Create a `.env` file inside:

```txt
📂 scripts/tech-stats/
└── 📄 .env
```

2. Add an **_environment variable exactly named_** `TECH_STATS_REPOSITORIES` in the file with a **_JSON object containing the selection overrides_**

🗒️ **_Example:_**

```dotenv
TECH_STATS_REPOSITORIES='{"include":["hal-9000/earth-destruction", "hal-9000/solar-system-destruction"]}'
```

The **_private override supports 2 optional properties_**:

| Property  | Behavior                                               |
| :-------: | :----------------------------------------------------- |
| `include` | _**Replaces the public inclusion list** when provided_ |
| `exclude` | _**Replaces the public exclusion list** when provided_ |

> 🖋️ **_N.B.:_**
>
> _You may **provide either property or both**. An **omitted property retains** its corresponding **value from the public configuration**._
>
> _The `.env` file **must** remain **excluded from Git**. It is used **only** for optional **local** repository-selection overrides, not for storing GitHub authentication credentials._

**3. Verify the effective repository selection**

**_Execute_** 🔬 'Analyze' mode:

```bash
pnpm run tech-stats:report
```

- Open the **_resulting private report_** & **_inspect_** its repository-selection information,
- **_Check_** that the intended repositories were included & that excluded or ineligible repositories do not contribute to the analysis.

If the **_selection is incorrect_**, **_adjust_** the relevant configuration & **_repeat_** the analysis.

> 🖋️ **_N.B.:_**
>
> _A **private override controls repository selection** but does **not grant repository access**. **Local repository access still depends on the GitHub CLI authentication** configured during [Development Setup](#-development-setup)._
>
> _For **automated execution**, the **optional `TECH_STATS_REPOSITORIES` value must be configured as a GitHub repository secret** rather than through the local `.env` file. For this subject, refer to [GitHub Actions Setup](#️-github-actions-setup)._

[🔼 Back to the Table of Contents](#-table-of-contents)

## 📚 Statistics Definitions & JSON Schema

This **_section explains how to create or modify the statistics displayed_** on the GitHub Profile & how to ensure their definitions follow the engine's required structure.

**_Each statistics section_** is configured through a **_JSON file_**. The **_engine reads these definitions_** to determine which technologies to display, how their values are produced & which icons to use.

[🔼 Back to the Table of Contents](#-table-of-contents)

### 📝 Creating & Modifying Definitions

The **_statistics definitions are located_** in:

```txt
📂 scripts/tech-stats/
└── 📂 definitions/
    └── [section-name].json
```

**_Each JSON file defines one statistics section_** & contains the technologies displayed in its corresponding SVG.

**1. Identify the definition to modify**

- Open the JSON file corresponding to the statistics section you want to change

**_Each definition_** follows this **_general structure_**:

```json
{
  "$schema": "../schemas/statistics-definition.schema.json",
  "id": "frontend",
  "title": "Frontend",
  "technologies": [
    {
      "id": "react",
      "name": "React",
      "metric": "adoption",
      "rule": "react",
      "icon": "react.svg"
    }
  ]
}
```

|    Property    | Purpose                                                                      |
| :------------: | :--------------------------------------------------------------------------- |
|   `$schema`    | _References the JSON Schema used to ensure the validation of the definition_ |
|      `id`      | _Identifies the statistics section & determines its generated SVG filename_  |
|    `title`     | _Defines the statistics section's accessible title_                          |
| `technologies` | _Contains the ordered list of technologies displayed in the section_         |

> 🖋️ **_N.B.:_**
>
> _Within the `technologies` array, **each technology also requires**:_
>
> - _An `id`,_
> - _A `name`,_
> - _A **metric strategy**,_
> - _& an **icon configuration**._

🗒️ **_Example:_**

```txt
        📄
    svg-1.json
         │
         ▼
Section ID: frontend
         │
         ▼
   Generated file
         │
         ▼
        🖼️
   frontend.svg
```

> 🖋️ **_N.B.:_**
>
> _The **JSON filename** is used **for organizing definition files** whereas the section's `id` determines the **generated SVG filename**._

**2. Add, remove or reorder technologies**

- To **_modify the technologies displayed_** in the section, **_edit the `technologies` array_**, which also determines their order,
- To **_remove a technology_**, **_remove its corresponding object_**,
- To **_change its position_**, **_simply move that object within the array_**,
- To **_add a technology_**, **_create a new object_** containing the required properties & a suitable metric strategy.

The engine supports **_3 metric strategies_**:

|   Metric   | Required Property | Purpose                                                             |
| :--------: | :---------------: | :------------------------------------------------------------------ |
| `language` |    `language`     | _Calculate a language's share of the selected language bytes_       |
| `adoption` |      `rule`       | _Calculate repository adoption from recognized technology evidence_ |
| `curated`  |      `label`      | _Display a predefined label without calculating a percentage_       |

> 🖋️ **_N.B.:_**
>
> _Each technology **must use exactly one** metric strategy._

**_Choose the appropriate metric_** according to the information available for the technology:

|   Metric   | When to Choose It                                                                                                          | Examples                |
| :--------: | :------------------------------------------------------------------------------------------------------------------------- | :---------------------- |
| `language` | GitHub Linguist provides language byte counts that the engine can use for measurement                                      | _Python, HTML, Haskell_ |
| `adoption` | The technology can be identified through supported repository evidence, such as dependencies or configuration files        | _React, NestJS, Docker_ |
| `curated`  | The technology belongs to the displayed stack, but its actual usage cannot be reliably quantified from repository evidence | _Figma, Jira_           |

```txt
                  New Technology
                         │
                         ▼
             How can it be measured?
                         │
      ┌──────────────────┼──────────────────┐
      │                  │                  │
      ▼                  ▼                  ▼
   Python              NestJS             Figma
      │                  │                  │
      ▼                  ▼                  ▼
GitHub language      Repository        No reliable
  byte counts         evidence         measurement
      │                  │                  │
      ▼                  ▼                  ▼
  `language`        `adoption`          `curated`
```

> 🖋️ **_N.B.:_**
>
> _Before using the `language` metric, check the [official GitHub Linguist language list](https://github.com/github-linguist/linguist/blob/main/lib/linguist/languages.yml) to verify that the intended language is supported._
>
> _The following **command can also be used to inspect the language byte counts reported by GitHub** for a repository using its owner & repository name:_
>
> ```bash
> gh api repos/<OWNER>/<REPOSITORY>/languages
> ```
>
> _A supported language is not necessarily detected in every repository. The engine relies on the language measurements actually returned by GitHub._

🗒️ _**Example:** Add Python to the "Languages & Web Foundations" section_

1. _Open_ `definitions/languages-web-foundations.json`
2. _Add the following object to its existing `technologies` array:_

```json
{
  "id": "python",
  "name": "Python",
  "metric": "language",
  "language": "Python",
  "icon": "python.svg"
}
```

3. _Provide the technology icon (here, `python.svg`) in the `assets/tech-stats/icons/` directory_

> 🖋️ **_N.B.:_**
>
> _Some of those icons can be found on websites like [Devicons](https://devicons.io/icons/)._

_Because Python uses the `language` metric, its language bytes will participate in the shared denominator used to calculate the displayed language percentages._

> 🖋️ **_N.B.:_**
>
> _Adding a technology using `adoption` requires an existing supported detection rule or a new detection mechanism._
>
> _**Follow the [Technology Detection](#-technology-detection) instructions** when the **engine has to recognize the intended evidence through information other than GitHub Linguist**._
>
> _Adding a technology using `curated` does not require repository-based detection or evidence._

**3. Modify a technology's displayed information**

The technology's `id` **_identifies it internally_** whereas its `name` determines its **_visible label_**.

You can therefore change the displayed name without changing the technology's internal identity.

🗒️ _**Example:** Change the displayed name of HTML_

```json
{
  "id": "html",
  "name": "HTML 5",
  "metric": "language",
  "language": "HTML",
  "icon": "html.svg"
}
```

_The engine continues to use GitHub's HTML language measurements while the SVG displays `HTML 5`._

_For **Curated technologies**, change the `label` property to **customize their displayed statistic**._

**4. Configure technology icons**

Each technology **must** define one of the following icon strategies:

- `icon`: **_1 SVG icon_** for **_both light & dark themes_**,
- `icons`: **_Separate SVG icons_** for **_each theme_**.

🗒️ _**Example:** `Vercel` uses separate icon variants_

```json
{
  "id": "vercel",
  "name": "Vercel",
  "metric": "curated",
  "label": "Curated",
  "icons": {
    "light": "vercel.svg",
    "dark": "vercel-dark.svg"
  }
}
```

> 🖋️ **_N.B.:_**
>
> _The **two strategies cannot be combined** in the same technology definition._
>
> _Refer to [Technology Icons & Theme Variants](#️-technology-icons--theme-variants) for instructions on preparing & modifying the icon files._

**5. Create a new statistics section**

To **_introduce a new statistics section_** rather than modify an existing one:

1. Create a new `.json` file inside `definitions/`,
2. Reference the **_existing statistics-definition schema_**,
3. **_Assign a unique section_** `id` & provide its title,
4. **_Add at least one technology_** to its `technologies` array,
5. **_Save_** the file.

The **_engine automatically discovers the JSON definition files_** during execution.

It then **_generates the corresponding SVG according to each section's_** `id`. The output directory is synchronized with the current definitions, including removing obsolete generated SVGs.

🗒️ _**Example:** Create a new "Development Tools" statistics section_

1. _Create `definitions/development-tools.json` with the following content:_

```json
{
  "$schema": "../schemas/statistics-definition.schema.json",
  "id": "development-tools",
  "title": "Development Tools",
  "technologies": [
    {
      "id": "vscode",
      "name": "VS Code",
      "metric": "curated",
      "label": "Curated",
      "icon": "vscode.svg"
    }
  ]
}
```

2. _Provide the corresponding `vscode.svg` icon in `assets/tech-stats/icons/`_
3. _Once the updated definitions have been validated & the engine's 📈 'Generate' mode has completed, the **new statistics file will be available** at:_

```txt
📂 assets/tech-stats/statistics/
└── development-tools.svg
```

4. **_Reference the new SVG_** in the GitHub Profile README if it should be publicly displayed

```md
![Development Tools](./assets/tech-stats/statistics/development-tools.svg)
```

> 🖋️ **_N.B.:_**
>
> _For this GitHub Profile, the **Markdown image format provided more suitable sizing** across the desktop & mobile views tested._
>
> _The **HTML `<img>` format remains an alternative** when **explicit image width or alignment is needed**. **Always inspect the resulting README on both desktop & mobile** when changing its image presentation._

[🔼 Back to the Table of Contents](#-table-of-contents)

### 🧱 Schema Validation

The **_engine uses a JSON Schema_** to **_define the structure accepted_** for statistics definitions.

Its **_location is_**:

```txt
📂 scripts/tech-stats/
└── 📂 schemas/
    └── statistics-definition.schema.json
```

The **_schema is referenced by the_** `$schema` **_property_** inside each definition:

```json
"$schema": "../schemas/statistics-definition.schema.json"
```

> 🖋️ **_N.B.:_**
>
> _This **reference also allows compatible editors**, such as VS Code, to **provide schema-based validation** while you modify a definition._
>
> _**JSON syntax validation & JSON Schema validation are 2 separate validation layers**._
>
> _The engine first **reads & parses the file as JSON**. If the file cannot be read or contains malformed JSON, processing stops **before the JSON Schema is evaluated**._
>
> _Only **syntactically valid JSON** reaches `statistics-definition.schema.json`, which then validates the accepted structure, required properties & metric-specific contracts._

When modifying the definition files, follow these simple steps:

**1. Respect the definition requirements**

The **_schema establishes the following requirements_**:

|         Element         | Requirements                                                      |
| :---------------------: | :---------------------------------------------------------------- |
|   **Root** `$schema`    | _Exactly `../schemas/statistics-definition.schema.json`_          |
|    **Section** `id`     | _Lowercase letters, digits & hyphens_                             |
|   **Section** `title`   | _Non-empty text containing at least one non-whitespace character_ |
|     `technologies`      | _At least one technology_                                         |
|   **Technology** `id`   | _Lowercase letters, digits & hyphens_                             |
|  **Technology** `name`  | _Non-empty text containing at least one non-whitespace character_ |
| **Technology** `metric` | _`language`, `adoption` or `curated`_                             |
| **Icon configuration**  | _Exactly one of `icon` or `icons`_                                |

> 🖋️ **_N.B.:_**
>
> _The schema also prevents additional, unsupported properties from being introduced into a definition._

**2. Check metric-specific requirements**

**_Each metric_** permits a **_specific property_**:

```txt
🌐 language
└── requires `"language"`
    └── excludes `"rule"` & `"label"`

📦 adoption
└── requires `"rule"`
    └── excludes `"language"` & `"label"`

🖋️ curated
└── requires `"label"`
    └── excludes `"language"` & `"rule"`
```

🗒️ _**Example:** The following definition is **invalid**:_

```json
{
  "id": "react",
  "name": "React",
  "metric": "adoption",
  "language": "JavaScript",
  "icon": "react.svg"
}
```

_The **JSON syntax is valid**, but the definition is rejected by the schema because the `adoption` metric requires `rule` rather than `language`._

_Its **corrected configuration** is:_

```json
{
  "id": "react",
  "name": "React",
  "metric": "adoption",
  "rule": "react",
  "icon": "react.svg"
}
```

**3. Check identifier uniqueness**

In addition to **_validating each individual definition_**, the **_engine checks identifiers across all loaded definitions_**.

Thus, the engine applies **_2 restrictions_**:

- Each statistics section **_must_** have a **_unique section_** `id`.
- Each technology **_must_** have a **_unique technology_** `id` across every statistics section.

Consequently, moving a technology from one section to another requires removing its previous definition rather than duplicating it.

🗒️ **_Example:_**

```txt
📄 frontend.json
└── Technology ID: testing-library
              │
              ▼
📄 testing-tools.json
└── Technology ID: testing-library
              │
              ▼
             ❌
          Duplicate
       Engine rejects
       the definitions
```

**4. Validate the updated definitions**

1. **_Save_** the modified JSON files & **_execute the automated tests_**:

```bash
pnpm run test
```

2. Then, **_perform a fresh analysis_** using the 🔬 'Analyze' mode:

```bash
pnpm run tech-stats:report
```

3. If the **_definitions are valid_**, **_inspect the resulting private report_** to verify the calculated statistics

4. **_Generate the public SVGs_** with the 📈 'Generate' mode:

```bash
pnpm run tech-stats
```

5. **_Inspect the generated files_** to verify the expected technologies, displayed values, card ordering & icon variants.

> 🖋️ **_N.B.:_**
>
> _The **schema validates individual definition structures** while the **definition loader performs additional checks** across the complete set of loaded definitions._
>
> _If a **modification requires changing the schema itself**, **update the corresponding implementation or automated tests** as necessary. Refer to [Updating Implementation & Tests](#-updating-implementation--tests) for this purpose._

[🔼 Back to the Table of Contents](#-table-of-contents)

## 🔎 Technology Detection

This **_section_** explains **_how to add or modify the evidence_** used to recognize technologies in analyzed repositories.

Before **_implementing a detection mechanism_**, **_identify_** which repository information **_reliably indicates the presence of the intended technology_**.

The **_engine supports 2 complementary mechanisms_**:

|         Mechanism         | When to Use It                                                                                                     |           Location            |
| :-----------------------: | :----------------------------------------------------------------------------------------------------------------- | :---------------------------: |
|   **Declarative rules**   | _**Evidence can be recognized** through dependencies, configuration-file paths or supported `package.json` fields_ | `config/detection-rules.json` |
| **Specialized detectors** | _**Evidence requires additional interpretation** of file paths, declared runtime behavior or file contents_        |       `detectors/*.ts`        |

- **_Start with declarative rules_** whenever they can express the required evidence,
- **_Only introduce a specialized detector_** when **_additional interpretation is necessary_**.

> 🖋️ **_N.B.:_**
>
> _The **detection mechanism** determines **which evidence the engine recognizes**._
>
> _A **statistics definition** determines **whether the corresponding technology is displayed & which metric it uses**. Refer to [Creating & Modifying Definitions](#-creating--modifying-definitions) to **include a detected technology** in the generated statistics._

[🔼 Back to the Table of Contents](#-table-of-contents)

### 📋 Declarative Detection Rules

**_Declarative detection rules_** describe repository evidence **_using JSON configuration_** rather than additional TypeScript implementation.

Here are the **_steps to follow_** to modify the detection rules file:

**1. Identify the evidence to recognize**

- Before modifying the configuration, **_inspect the official documentation of the technology_** to understand which files or declarations are specific to the technology & can serve as reliable evidence during analysis,
- **_Look for evidence_** belonging to one of the following categories:

|        Evidence         | Configuration Property | What to Identify                                    |
| :---------------------: | :--------------------: | :-------------------------------------------------- |
| **Direct dependencies** |  `dependencies.exact`  | _Specific package names declared in `package.json`_ |
| **Dependency prefixes** | `dependencies.prefix`  | _Package names sharing a recognizable prefix_       |
| **Configuration files** |     `configFiles`      | _Dedicated configuration filenames or paths_        |
|   **Package fields**    |  `packageJsonFields`   | _Dedicated properties declared in `package.json`_   |

> 🖋️ **_N.B.:_**
>
> _A **technology** may have **several supported forms of evidence**._
>
> _**Evidence can be combined** through the relevant properties within the same detection rule._

🗒️ _**Example:** Identify `NestJS` through its declared package dependency or dedicated configuration file_

_A NestJS project may contain:_

```txt
📂 project/
├── package.json
└── nest-cli.json
```

_Its `package.json` may declare:_

```json
{
  "dependencies": {
    "@nestjs/core": "^11.0.0"
  }
}
```

_The **dependency & the dedicated configuration file** provide two **independently recognizable signals**._

> 🖋️ **_N.B.:_**
>
> _For dependency-based detection, the engine inspects direct declarations in `dependencies`, `devDependencies`, `peerDependencies` & `optionalDependencies`._
>
> _**Lockfiles alone** are **not** accepted as **direct dependency evidence**. **Recognizing a framework** also does **not automatically establish the presence of other technologies**._
>
> _When the engine downloads a `package.json` for evidence analysis, the file must contain **valid JSON whose root value is an object**._
>
> _A **malformed or non-object package manifest stops the repository analysis** rather than being silently ignored, because skipping required manifest evidence could incorrectly lower the detected technology adoption._

**2. Open the detection-rules configuration**

- **_Locate_** the detection rules file:

```txt
📂 scripts/tech-stats/
└── 📂 config/
    └── detection-rules.json
```

- **_Find the technology whose evidence you want to modify_** or **_create a new entry_** if the technology is not yet supported

🗒️ _**Example:** The existing `NestJS` rule follows this structure:_

```json
{
  "nestjs": {
    "dependencies": {
      "exact": ["@nestjs/core"]
    },
    "configFiles": ["nest-cli.json"]
  }
}
```

_The engine recognizes `NestJS` when **at least one** of these signals is present._

> 🖋️ **_N.B.:_**
>
> _When **adding a new rule**, use a **lowercase technology key** containing **only letters, digits or hyphens**._
>
> _Keep the technology keys organized **alphabetically** to simplify navigation & maintenance._

**3. Add or modify the required evidence**

- **_Update_** the corresponding configuration properties

🗒️ _**Example:** Add declarative detection for `Vitest`_

_After identifying the intended evidence, add a new `vitest` entry to `detection-rules.json`:_

- **_Before:_**

```json
{
  "vercel": {
    "configFiles": ["vercel.json"]
  }
}
```

- **_After:_**

```json
{
  "vercel": {
    "configFiles": ["vercel.json"]
  },
  "vitest": {
    "dependencies": {
      "exact": ["vitest"]
    },
    "configFiles": ["vitest.config.ts", "vitest.config.js"]
  }
}
```

> 🖋️ **_N.B.:_**
>
> _The snippets above only represent the relevant end of `detection-rules.json`._
>
> _If `Vitest` should also **appear in the public statistics**, **create its corresponding technology definition & provide an icon**, following [Creating & Modifying Definitions](#-creating--modifying-definitions)._

**4. Add detection tests**

- Open the **_tests related to detection rules_**:

```txt
📂 scripts/tech-stats/
└── 📂 tests/
    └── 📂 engine/
        └── detect.ts
```

- **_Add controlled examples_** that verify the engine recognizes the intended evidence & rejects unrelated information

🗒️ _**Example:** Verify the proposed `Vitest` rule_

```ts
test("Vitest Detection: Supported Evidence Check", () => {
  const rules = {
    vitest: {
      dependencies: {
        exact: ["vitest"],
      },
    },
  };

  const matching = detect(
    ["package.json"],
    {
      "package.json": JSON.stringify({
        devDependencies: {
          vitest: "^3.0.0",
        },
      }),
    },
    rules,
  );

  const unrelated = detect(
    ["package.json"],
    {
      "package.json": JSON.stringify({
        devDependencies: {
          jest: "^29.0.0",
        },
      }),
    },
    rules,
  );

  expect(matching.vitest).toBeDefined();
  expect(unrelated.vitest).toBeUndefined();
});
```

_This test confirms that the proposed dependency rule accepts `Vitest` without confusing it with another testing framework._

> 🖋️ **_N.B.:_**
>
> _Because this proposed rule **also supports configuration-file detection**, **add corresponding positive & negative tests** for those paths. Refer to [🧪 Tests & Validation](#-tests--validation) to do so._

**5. Validate the updated detection rule**

- **_Save_** the changes & **_execute_**:

```bash
pnpm run typecheck
pnpm run test
```

- Then, **_use 🔬 'Analyze' mode_** to inspect recognized evidence from your authorized repositories:

```bash
pnpm run tech-stats:report
```

- **_Open the private report & verify_** that the expected repositories contain the new evidence.

> 🖋️ **_N.B.:_**
>
> _A **successful detection test** does **not guarantee** that the technology will be detected in your currently analyzed repositories._
>
> _If the **technology has been added to the statistics definitions**, **also update the configured-adoption coverage test** when its existing fixtures do not provide the new technology's evidence._

[🔼 Back to the Table of Contents](#-table-of-contents)

### 🛠️ Specialized Detectors

**_Specialized detectors_** are used **_when the evidence requires more_** than matching a declared dependency, a configuration filename or a supported package field.

They allow the **_engine to inspect specific_** file contents, validate declared runtime behavior or interpret combinations of evidence.

**1. Determine why a specialized detector is required**

- First, identify the information you need to inspect & **_verify that it cannot be expressed adequately through the existing declarative rules_**

🗒️ _**Example:** Recognize `PostgreSQL` through a `Prisma` database provider_

- _A repository containing `schema.prisma` may use PostgreSQL, MongoDB or another supported database_
- _The existence of `schema.prisma` alone therefore cannot establish PostgreSQL adoption_
- _The engine must inspect the file's contents:_

```prisma
datasource db {
  provider = "postgresql"
}
```

_For this reason, the existing `detectors/prisma.ts` implements additional database-provider detection._

**2. Locate or create the specialized detector**

**_Specialized detectors are organized_** inside:

```txt
📂 scripts/tech-stats/
└── 📂 detectors/
    └── [technology-or-evidence-domain].ts
```

> 🖋️ **_N.B.:_**
>
> _By convention, **name the detector after the technology or evidence domain** it handles._
>
> 🗒️ **_Example:_**
>
> - `prisma.ts`,
> - `docker.ts`,
> - or `vercel.ts`.

- **_Review an existing detector_** with similar evidence requirements **_before creating another one_**
- **_Choose the approach_** according to the information required:

|        Evidence type         | Guidance                                                                                   |
| :--------------------------: | :----------------------------------------------------------------------------------------- |
|   **Path-based evidence**    | _Use the eligible repository file paths_                                                   |
|  **Content-based evidence**  | _Identify the specific files whose contents must be retrieved_                             |
| **Multi-condition evidence** | _Implement the necessary checks without assuming that one unrelated signal proves another_ |

**3. Implement the detection logic**

- **_Open the appropriate detector or create a new TypeScript file_** inside `detectors/`,
- **_Record recognized evidence_** through the engine's `addEvidence` **_callback_**,
- **_Provide the technology key, evidence path & recognition reason_** for each accepted signal.

🗒️ _**Example:** The existing `Prisma` detector recognizes a `PostgreSQL` provider through a supported declaration_

```txt
             📄
       `schema.prisma`
              │
              ▼
            🔎📄
    Inspect file contents
              │
              ▼
          PostgreSQL
     provider declared?
              │
   ┌──────────┴──────────┐
   │                     │
  ✅                    ❌
   │                     │
   ▼                     ▼
 Record            Do not record
evidence        `PostgreSQL` evidence
```

When **_implementing a new detector_**, **_use the appropriate technology key_** consistently. For a **_displayed technology using the_** `adoption` **_metric_**, it **_must match_** the `rule` **_referenced_** by its statistics definition.

🗒️ _**Example:** Keep the `PostgreSQL` evidence key aligned with its statistics definition_

_The statistics definition uses:_

```json
{
  "id": "postgresql",
  "name": "PostgreSQL",
  "metric": "adoption",
  "rule": "postgresql",
  "icon": "postgresql.svg"
}
```

_The specialized detector therefore records `PostgreSQL` evidence using the **same technology key** referenced by `rule`:_

```ts
addEvidence("postgresql", filename, "Prisma PostgreSQL provider");
```

_Thus, in summary:_

```txt
    Statistics definition
     `rule: "postgresql"`
              │
              ▼
     Specialized detector
`addEvidence("postgresql", ...)`
              │
              ▼
         ✅ Match
```

_If the two keys differ, the detector may collect evidence that the configured `adoption` metric does not use._

> 🖋️ **_N.B.:_**
>
> _Only recognize evidence that satisfies the conditions established for the technology._
>
> _Avoid using broad keywords, unrelated dependencies or documentation mentions as proof of adoption without additional justification._

**4. Connect the detector to the engine**

- Open the **_engine detection file_**:

```txt
📂 scripts/tech-stats/
└── 📂 src/
    └── detect.ts
```

This engine module **_coordinates generic detection rules & specialized detectors_**.

For a **_new specialized detector_**:

1. **_Import its exported_** detection functions into the engine detector
2. **_Call the functions_** from the appropriate part of `detect()`
3. If the **_detector requires file contents_**, **_update_** `isEvidenceFile()` so the relevant files are selected for retrieval
4. **_Ensure the detector records its results_** using the expected technology key

🗒️ _**Example:** The existing `Prisma` integration follows this process:_

```txt
         `isEvidenceFile()`
                 │
                 ▼
      Identify `.prisma` files
                 │
                 ▼
                🔎
        Repository analysis
                 │
                 ▼
  Retrieve selected file contents
                 │
                 ▼
            `detect()`
                 │
                 ▼
     `detectPrismaProviders()`
                 │
                 ▼
Record recognized database evidence
```

> 🖋️ **_N.B.:_**
>
> _When a **new detector needs file contents**, update `isEvidenceFile()` to select **only the files required by that detector**._
>
> _**Selecting files too broadly** can make the **engine retrieve unnecessary repository content** & may cause the **analysis to stop when the limits configured** in `config/analysis-settings.json` are **exceeded**._
>
> _A **detector** that **only examines file paths** does **not need to download** the files' contents._

🗒️ **_Example:_**

```txt
Detector needs:

    📄
`AGENTS.md`
     │
     ├── ✅ Select `AGENTS.md`
     │
     └── ❌ Select every `.md` file
              │
              └── README, documentation, changelogs, etc...
                     would be downloaded unnecessarily
```

> 🖋️ **_N.B.:_**
>
> _**New file types** may therefore **require corresponding evidence-collection tests**, in addition to **technology-detection tests**._
>
> _When **adding content-based detection**, **keep the evidence-file selection sufficiently specific**._

**5. Add positive & negative test scenarios**

- Open `tests/engine/detect.ts`,
- **_Introduce fixtures_** covering the detector's expected behavior.

**_Each new detector should be tested_** against both recognized evidence & information that must not trigger detection.

🗒️ _**Example:** The existing `Prisma` tests distinguish between an actual `PostgreSQL` provider declaration and a commented declaration_

- _Positive example_

```prisma
datasource db {
  provider = "postgresql"
}
```

- _Negative example_

```prisma
datasource db {
  // provider = "postgresql"
}
```

_The **second example** must **not establish** `PostgreSQL` adoption **because the declaration is commented out**._

> 🖋️ **_N.B.:_**
>
> _For a **new detector**, **consider other potential false positives** associated with its particular evidence._
>
> _If the **detector introduces additional evidence-file types**, **extend the relevant tests** in `tests/engine/analyze.ts` to verify that the files are collected correctly & that incomplete evidence is rejected when necessary._

**6. Validate the complete detection mechanism**

After **_saving the implementation & updating its tests_**, follow these steps:

1. Execute **_TypeScript validation_**
2. Execute **_the automated test suites_**
3. **_Run 🔬 'Analyze' mode_**.
4. **_Inspect the private report_** to identify the recognized evidence & resulting statistics
5. **_Run 📈 'Generate' mode_** when the analysis results are satisfactory
6. **_Inspect the resulting SVGs_** if the technology is displayed publicly

> 🖋️ **_N.B.:_**
>
> _**Refer to the [Local Validation Sequence](#-local-validation-sequence)** for the corresponding **commands & complete validation procedure**._

It is **_important to remember_** that:

- **_Specialized detectors_** should remain **_deterministic, independently testable & based on supported repository evidence_**,
- Before **_adding a new detector_**, **_establish its acceptance criteria_** & **_identify possible false positives_**,
- The **_implementation should follow concrete criteria_** rather than inventing them during detection.

[🔼 Back to the Table of Contents](#-table-of-contents)

## 🎨 Visual Customization

As a reminder, **_each generated Technology Statistics SVG_** is a **_single public SVG containing several technology cards_**.

Each **_technology card_** contains:

- The **_technology icon SVG_**,
- The **_technology name_**,
- & the **_statistic or Curated label_**.

```txt
🖼️ Generated Technology Statistics SVG
│
├── Technology Card
│   ├── 🖼️ Technology Icon SVG
│   ├── 📝 Technology Name
│   └── 📊 Statistic / Curated Label
│
├── Technology Card
│   └── ...
│
└── Technology Card
    └── ...
```

Those different **_visual elements are controlled_** through:

```txt
📂 assets/tech-stats/icons/
│   └── 🖼️ Technology icon SVG files
│
📂 scripts/tech-stats/
├── 📂 definitions/
│   └── 📄 Displayed technologies, names, metrics & icon references
│
└── 📂 config/
    └── 📄 rendering-settings.json
        └── 📐 Layout, typography & theme colors
```

Thus, the **_visual concepts & their corresponding engine resources can be connected_** as follows:

|             Visual Concept              | Description                                                                         |                      Engine Link                      |
| :-------------------------------------: | :---------------------------------------------------------------------------------- | :---------------------------------------------------: |
| **Generated Technology Statistics SVG** | _Final public SVG representing one statistics section_                              |            `assets/tech-stats/statistics/`            |
|           **Technology Card**           | _One technology presentation inside the generated SVG_                              |              _Generated by the renderer_              |
|         **Technology Icon SVG**         | _Source SVG embedded inside its technology card_                                    |              `assets/tech-stats/icons/`               |
|           **Technology Name**           | _Displayed name associated with the technology_                                     |           `scripts/tech-stats/definitions/`           |
|      **Statistic / Curated Label**      | _Calculated statistic or predefined label displayed below the name_                 | `scripts/tech-stats/definitions/` _+ engine analysis_ |
|           **Layout & Theme**            | _Dimensions, spacing, typography & light/dark colors shared by the generated cards_ |  `scripts/tech-stats/config/rendering-settings.json`  |

This **_section_** explains how to **_add or modify technology icons_** & how to **_customize the dimensions, spacing, typography & colors_** of the **_generated Technology Statistics SVGs_**.

[🔼 Back to the Table of Contents](#-table-of-contents)

### 🖼️ Technology Icons & Theme Variants

The **_first visual element to configure is the technology icon_**, since each card embeds one of these SVG assets before the remaining layout & theme settings are applied.

**_Technology icons are stored_** in:

```txt
📂 assets/
└── 📂 tech-stats/
    └── 📂 icons/
        ├── react.svg
        ├── nestjs.svg
        ├── nextjs.svg
        ├── nextjs-dark.svg
        └── ...
```

**_Each technology definition_** references either **_1 icon shared by both themes_** or **_2 different icons for light & dark themes_**.

**1. Choose the icon strategy**

- Use a **_single icon_** when the SVG remains readable on both GitHub themes:

```json
{
  "id": "react",
  "name": "React",
  "metric": "adoption",
  "rule": "react",
  "icon": "react.svg"
}
```

- Use **_theme variants_** when the same icon would become difficult to see against one of the themes:

```json
{
  "id": "nextjs",
  "name": "Next.js",
  "metric": "adoption",
  "rule": "nextjs",
  "icons": {
    "light": "nextjs.svg",
    "dark": "nextjs-dark.svg"
  }
}
```

> 🖋️ **_N.B.:_**
>
> _A technology must use **either** `icon` **or** `icons`, never both._

🗒️ _**Example:** Convert a technology from one shared icon to theme variants_

- **_Before:_**

```json
{
  "id": "example",
  "name": "Example",
  "metric": "curated",
  "label": "Curated",
  "icon": "example.svg"
}
```

- **_After:_**

```json
{
  "id": "example",
  "name": "Example",
  "metric": "curated",
  "label": "Curated",
  "icons": {
    "light": "example.svg",
    "dark": "example-dark.svg"
  }
}
```

> 🖋️ **_N.B.:_**
>
> _The engine **automatically displays the appropriate variant according to** the user's light or dark **color scheme**._

**2. Add the SVG icon files**

- Place the **_required SVG file or files_** inside `assets/tech-stats/icons/`,
- Use **_lowercase filenames_** containing **_only letters, digits or hyphens_**,
- **_Keep the_** `.svg` **_extension_**,
- **_Reference the exact filenames_** from the technology definition.

🗒️ _**Example:** Add a Python icon_

```txt
📂 assets/tech-stats/icons/
└── python.svg
```

_Then, reference it from the definition:_

```json
{
  "id": "python",
  "name": "Python",
  "metric": "language",
  "language": "Python",
  "icon": "python.svg"
}
```

> 🖋️ **_N.B.:_**
>
> _**Icons can be obtained from trusted sources**, such as [Devicons](https://devicons.io/icons/), when an appropriate technology icon is available._
>
> _Make sure the **selected asset can legally be reused** & preserve any **required attribution or license** information._

**3. Check that the SVG can be embedded**

The engine **_embeds each icon directly inside_** the generated statistics SVG.

For this purpose, the **_icon must_**:

| Requirement  |          Expected Result           |
| :----------: | :--------------------------------: |
| **SVG root** | _Contains a valid `<svg>` element_ |
|  **Sizing**  |  _Contains a `viewBox` attribute_  |
| **Content**  |     _Uses SVG vector geometry_     |

> 🖋️ **_N.B.:_**
>
> _The icon must **not depend on external images or resources** & must **not contain executable content**._
>
> _The engine **rejects unsupported or unsafe SVG content**, such as scripts, external images or external references._

🗒️ _**Example:**_

```svg
<svg viewBox="0 0 24 24">
  <path d="..." />
</svg>
```

> 🖋️ **_N.B.:_**
>
> _The icon's **original dimensions** do **not** determine **its displayed size**._
>
> _The **generated statistics apply** the `iconSize` value configured in `rendering-settings.json`._

**4. Generate & inspect the icon**

After adding or modifying an icon:

- Run the **_automated tests_**

```bash
pnpm run test
```

- **_Generate_** the public SVGs

```bash
pnpm run tech-stats
```

- **_Open_** the generated statistics SVG,
- **_Check_** the icon in both light & dark themes,
- **_Verify_** that its shape, contrast & apparent size remain consistent with the surrounding technology cards.

> 🖋️ **_N.B.:_**
>
> _**Theme variants** are **automatically embedded** into the same generated statistics SVG. You do **not need to generate** separate light & dark statistics files._

[🔼 Back to the Table of Contents](#-table-of-contents)

### 📐 Layout, Margins & Spacing

Once the technology icons are defined, the **remaining visual structure of the generated statistics** is controlled **_through the engine's rendering configuration_**.

It allows you to **_customize_**:

- The **_dimensions_** of the generated SVG & its cards,
- The **_spacing_** between & within technology cards,
- The **_typography_** of technology names & statistics,
- & the **_colors_** used for the light & dark themes.

Those **_settings are centralized_** in:

```txt
📂 scripts/tech-stats/
└── 📂 config/
    └── rendering-settings.json
```

The **_file is divided into 2 groups_**:

```json
{
  "layout": {
    ...
  },
  "colors": {
    "light": {
      ...
    },
    "dark": {
      ...
    }
  }
}
```

The `layout` **_group_** controls the **_structure & positioning_** of the generated cards, while the `colors` **_group_** controls their **_light & dark theme appearance_**.

Once you have identified which group contains the visual element you want to change, follow the steps below:

**1. Identify the visual property to modify**

The current `layout` **_configuration contains_**:

|         Property         | Controls                                                         |
| :----------------------: | :--------------------------------------------------------------- |
|      `canvasWidth`       | _Total width of the generated SVG coordinate system_             |
|       `cardWidth`        | _Horizontal space reserved for each technology card_             |
|        `cardGap`         | _Horizontal space between cards_                                 |
|        `iconSize`        | _Rendered icon width & height_                                   |
|      `nameFontSize`      | _Technology-name font size_                                      |
|   `statisticFontSize`    | _Statistic or Curated-label font size_                           |
|       `pillWidth`        | _Width of the statistic pill_                                    |
|       `pillHeight`       | _Height of the statistic pill_                                   |
| `outerHorizontalPadding` | _Minimum horizontal space around card rows_                      |
|  `outerVerticalPadding`  | _Vertical space above the icon & below each row_                 |
|      `iconNameGap`       | _Vertical distance between the icon & technology name_           |
|      `namePillGap`       | _Vertical distance between the technology name & statistic pill_ |
|    `pillTextBaseline`    | _Vertical position of the statistic text inside its pill_        |
|     `maxCardsPerRow`     | _Maximum number of cards used to determine row wrapping_         |
|         `rowGap`         | _Vertical space between multiple rows_                           |

The **_current configuration_** is:

```json
{
  "layout": {
    "canvasWidth": 560,
    "cardWidth": 120,
    "cardGap": 20,
    "iconSize": 48,
    "nameFontSize": 15,
    "statisticFontSize": 13,
    "pillWidth": 72,
    "pillHeight": 28,
    "outerHorizontalPadding": 10,
    "outerVerticalPadding": 16,
    "iconNameGap": 27,
    "namePillGap": 13,
    "pillTextBaseline": 18,
    "maxCardsPerRow": 4,
    "rowGap": 16
  }
}
```

**2. Modify one visual property at a time**

Whenever possible, **_change one or a small group of related values_** before regenerating the SVGs.

This **_makes it easier to identify_** which configuration produced the visual change.

🗒️ _**Example:** Increase the technology icon size_

- **_Before:_**

```json
"iconSize": 48
```

- **_After:_**

```json
"iconSize": 56
```

_Then regenerate the statistics:_

```bash
pnpm run tech-stats
```

_Open the resulting SVGs & verify that the larger icons still fit correctly inside every card._

> 🖋️ **_N.B.:_**
>
> _`cardWidth` **must remain large enough** to contain both the configured `iconSize` & `pillWidth`._

**3. Modify card spacing**

Use `cardGap` to **_change the horizontal separation_** between cards.

🗒️ _**Example:** Increase horizontal spacing_

- **_Before:_**

```json
"cardGap": 20
```

- **_After:_**

```json
"cardGap": 28
```

_If the **cards no longer fit inside the configured** `canvasWidth`, **either reduce** the spacing **or increase** the canvas width._

```txt
canvasWidth
┌──────────────────────────────────────────┐
│                                          │
│   ┌──────┐ ← gap → ┌──────┐ ← gap →      │
│   │ Card │         │ Card │              │
│   └──────┘         └──────┘              │
│                                          │
└──────────────────────────────────────────┘
```

> 🖋️ **_N.B.:_**
>
> _The **engine rejects a layout** when the **configured cards cannot fit inside** `canvasWidth`._

**4. Modify row wrapping**

Use `maxCardsPerRow` to **_control_** how the renderer **_distributes larger statistics sections across multiple rows_**.

🗒️ _**Example:**_

```json
"maxCardsPerRow": 3
```

_A section containing 5 technologies is then rendered across multiple centered rows rather than forcing every card onto one line._

```txt
        ┌──────┐ ┌──────┐ ┌──────┐
        │ Card │ │ Card │ │ Card │
        └──────┘ └──────┘ └──────┘

            ┌──────┐ ┌──────┐
            │ Card │ │ Card │
            └──────┘ └──────┘
```

> 🖋️ **_N.B.:_**
>
> _The **renderer automatically centers** each row inside the configured canvas._

**5. Modify vertical spacing**

Use the **_vertical layout properties_** according to the space you want to change:

```txt
     `"outerVerticalPadding"`
               │
               ▼
            [Icon]
               │
         `"iconNameGap"`
               │
               ▼
        Technology Name
               │
         `"namePillGap"`
               │
               ▼
         ┌───────────┐
         │ Statistic │
         └───────────┘
               │
      `"outerVerticalPadding"`
```

> 🖋️ **_N.B.:_**
>
> _For **sections containing several rows**, `rowGap` controls the **additional space between those rows**._

🗒️ _**Example:** Increase the distance between the icon & technology name_

- **_Before:_**

```json
"iconNameGap": 27
```

- **_After:_**

```json
"iconNameGap": 32
```

_**Regenerate** the SVGs & **inspect** the resulting vertical balance before modifying another spacing value._

**6. Modify light & dark theme colors**

**_Theme colors are configured_** under:

```json
{
  "colors": {
    "light": {
      "text": "#1f2328",
      "pill": "#eff1f3",
      "statistic": "#59636e"
    },
    "dark": {
      "text": "#f0f6fc",
      "pill": "#262c36",
      "statistic": "#c9d1d9"
    }
  }
}
```

**_Each theme_** provides:

|  Property   | Controls                          |
| :---------: | :-------------------------------- |
|   `text`    | _Technology names_                |
|   `pill`    | _Statistic pill background_       |
| `statistic` | _Statistic or Curated-label text_ |

When modifying those theme colors, follow these **_visual consistency rules_**:

- **_Use 6-digit hexadecimal colors_** in the `#RRGGBB` format
- **_Configure both light & dark themes_**
- **_Regenerate the SVGs_** after modifying the colors
- **_Check contrast_** in both GitHub themes

🗒️ _**Example:** Modify the light-theme statistic text_

- **_Before:_**

```json
"statistic": "#59636e"
```

- **_After:_**

```json
"statistic": "#444c56"
```

> 🖋️ **_N.B.:_**
>
> _The generated SVG uses `prefers-color-scheme` to **switch between the configured light & dark visual styles**._

**7. Validate the complete visual result**

After modifying the icons or rendering configuration:

- Run **_TypeScript validation_**

```bash
pnpm run typecheck
```

- Run the **_automated tests_**

```bash
pnpm run test
```

- **_Generate_** the public SVGs

```bash
pnpm run tech-stats
```

- **_Inspect_** all affected statistics SVGs,
- **_Check_** both light & dark themes,
- **_Check_** sections containing different numbers of technology cards,
- **_Verify_** the final presentation from the GitHub Profile README.

> 🖋️ **_N.B.:_**
>
> _A **layout that passes automated validation** can **still require visual adjustment**._
>
> _**Always perform a final visual inspection** after changing icon dimensions, spacing, typography or colors._

[🔼 Back to the Table of Contents](#-table-of-contents)

## ▶️ Engine Execution

This **_section_** explains how to **_execute the 2 engine modes locally_**, **_inspect_** the resulting private analysis & **_generate the public Technology Statistics SVGs_**.

The **_engine provides_**:

|      Mode       |           Command            | Purpose                                                      |
| :-------------: | :--------------------------: | :----------------------------------------------------------- |
| 🔬 **Analyze**  | `pnpm run tech-stats:report` | _Analyze repositories & create a private inspection report_  |
| 📈 **Generate** |    `pnpm run tech-stats`     | _Perform a fresh analysis & regenerate the public SVG files_ |

> 🖋️ **_N.B.:_**
>
> _**Both modes** use the **same repository configuration, detection mechanisms & GitHub authentication**._

[🔼 Back to the Table of Contents](#-table-of-contents)

### 🔬 Private Analysis

🔬 **_'Analyze' mode_** is used to **_inspect the repository selection, recognized evidence & calculated statistics_** before updating the public SVGs:

**1. Execute 'Analyze' mode**

From:

```txt
📂 scripts/tech-stats/
```

Run:

```bash
pnpm run tech-stats:report
```

The 🔬 **_'Analyze' mode_** follows this process:

```txt
     🔬 'Analyze' mode
             │
             ▼
            ⚙️
     Load configuration
             │
             ▼
            🗃️
    Discover repositories
             │
             ▼
            🎛️
  Apply repository selection
             │
             ▼
            🔬
 Analyze languages & evidence
             │
             ▼
            📊
    Calculate statistics
             │
             ▼
            📜
   Create private report
```

Once the **_analysis completes successfully_**, the **_terminal displays the location of the generated report_**.

**2. Locate the private report**

By **_default_**, the **_report is stored outside the Git repository_** at:

```txt
📂 ~/
└── 📂 tech-stats-reports/
    └── tech-stats-report.json
```

> 🖋️ **_N.B.:_**
>
> _The **report is intentionally stored outside the repository** because it may contain private repository names & repository-level evidence._
>
> _Do **not** copy the report into the Git repository, commit it, upload it as a public artifact or expose its contents in public logs._

**3. _Optional_: Choose another report location**

To **_store the private report at another location_**, use:

```bash
pnpm run tech-stats:report --report-path "/path/outside/repository/report.json"
```

🗒️ _**Example:**_

```bash
pnpm run tech-stats:report --report-path "/home/user/private-reports/profile-tech-stats.json"
```

> 🖋️ **_N.B.:_**
>
> _The destination must remain **outside the Git repository**. If the provided location resolves **inside the repository**, the **engine rejects it**._
>
> _The `--report-path` option is **available only for 🔬 'Analyze' mode**._

**4. Inspect the report**

The **_report contains several areas to inspect_** when verifying the analysis results:

|        Report Data        | What to Verify                                              |
| :-----------------------: | :---------------------------------------------------------- |
| `includedRepositoryCount` | _Expected number of analyzed repositories_                  |
| `excludedRepositoryCount` | _Expected number of repositories excluded from analysis_    |
|        `selection`        | _Which repositories were included or excluded & why_        |
|      `repositories`       | _Repository-level language information & detected evidence_ |
|         `summary`         | _Aggregated measurements used by the statistics engine_     |

🗒️ _**Example:** Inspect repository selection_

```json
{
  "selection": [
    {
      "name": "USERNAME/project-a",
      "private": false,
      "reason": null
    },
    {
      "name": "USERNAME/project-b",
      "private": false,
      "reason": "explicit exclusion"
    }
  ]
}
```

_In this example:_

```txt
project-a
└── reason: null
    └── ✅ Included

project-b
└── reason: "explicit exclusion"
    └── ❌ Excluded
```

The `reason` field indicates **_why a repository was excluded from the analysis_**, while a `null` value indicates that the repository was **_included_**.

The **_possible values_** are:

|          Value           | Meaning                                                       |
| :----------------------: | :------------------------------------------------------------ |
|      `other owner`       | _Repository does not belong to the configured owner_          |
|          `fork`          | _Repository is a fork_                                        |
|        `archived`        | _Repository is archived_                                      |
|   `profile repository`   | _Repository is the GitHub Profile repository itself_          |
|   `explicit exclusion`   | _Repository appears in the configured exclusion list_         |
| `outside inclusion list` | _An inclusion list exists & the repository is not part of it_ |
|          `null`          | _Repository is included in the analysis_                      |

**5. Inspect detected evidence**

Inside each entry of the report's `repositories` array, **_inspect_** the `evidence` object.

🗒️ **_Example:_**

```json
{
  "evidence": {
    "nestjs": [
      {
        "path": "package.json",
        "signal": "direct package declaration: @nestjs/core"
      }
    ]
  }
}
```

_This example confirms that the engine detected `NestJS` through the repository's `package.json`._

When **_reviewing a new or modified detector_**, verify the following points to ensure its behavior remains **_accurate, deterministic & consistent with the engine's detection rules_**:

- Check that **_expected repositories contain the evidence_**,
- Check that **_unrelated repositories_** do **_not_** contain **_false-positive evidence_**,
- Check that the **_recorded path & signal explain why_** the technology was detected.

**6. Inspect the calculated statistics**

Inside `summary.metrics`, **_verify the final measurement produced_** for each configured technology.

🗒️ **_Example:_**

```json
{
  "metrics": {
    "nestjs": {
      "metric": "adoption",
      "numerator": 2,
      "denominator": 10,
      "percentage": 20,
      "label": "20.0%"
    }
  }
}
```

_For an `adoption` metric:_

```txt
numerator
└── Repositories where the technology was detected

denominator
└── Total analyzed repositories

percentage
└── Calculated adoption percentage

label
└── Value displayed in the generated SVG
```

Once the **_repository selection, evidence & calculated statistics are satisfactory_**, proceed to 📈 **_'Generate' mode_**.

[🔼 Back to the Table of Contents](#-table-of-contents)

### 📈 Public SVG Generation

📈 **_'Generate' mode_** performs a **_fresh repository analysis_** & uses its aggregate results to **_regenerate the public Technology Statistics SVGs_**:

**1. Execute 📈 'Generate' mode**

From:

```txt
📂 scripts/tech-stats/
```

Run:

```bash
pnpm run tech-stats
```

The **_engine follows this process_**:

```txt
   📈 'Generate' mode
             │
             ▼
            ⚙️
    Load configuration
             │
             ▼
            🔬
Analyze languages & evidence
             │
             ▼
            📊
   Calculate statistics
             │
             ▼
            🎨
   Render SVG sections
             │
             ▼
            ✅
  Validate public outputs
             │
             ▼
            🔄
 Synchronize generated SVGs
```

> 🖋️ **_N.B.:_**
>
> _📈 **'Generate' mode performs its own analysis**._
>
> _**Running** 🔬 **'Analyze' mode beforehand is useful** for inspection, but its generated report is **not used as input** for generation._

**2. Locate the generated SVGs**

By **_default_**, the **_public files are written_** to:

```txt
📂 assets/
└── 📂 tech-stats/
    └── 📂 statistics/
        └── [definition-id].svg
```

**_Each definition produces_**:

```txt
Definition ID
  `ui-tools`
      │
      ▼
     🖼️
Generated SVG
`ui-tools.svg`
```

**3. Check output synchronization**

During generation, the engine **_synchronizes the statistics directory with the current definitions_**:

- **_Current definitions generate or replace_** their corresponding SVGs,
- **_Obsolete_** generated `.svg` files are **_removed_**,
- **_Non-SVG files_** in the directory are **_left untouched_**.

🗒️ _**Example:** Remove a statistics definition_

- **_Before:_**

```txt
📂 definitions/
├── frontend.json
└── development-tools.json

📂 statistics/
├── frontend.svg
└── development-tools.svg
```

- _After `development-tools.json` is removed and **after running 📈 'Generate' mode:**_

```txt
📂 definitions/
└── frontend.json

📂 statistics/
└── frontend.svg
```

_The obsolete `development-tools.svg` is **automatically removed**._

**4. Check public-output privacy validation**

Before the SVGs are **_accepted as generated public output_**, the **_engine checks the generated SVGs & their public rendering inputs_** for private repository identifiers or credential material.

If this **_check fails_**, **_generation stops with an error_** instead of accepting the unsafe output.

> 🖋️ **_N.B.:_**
>
> _**Public SVGs** should contain **only aggregate statistics & configured public labels**, not repository-level detection evidence._

**5. Inspect the generated SVGs**

After **_successful generation_**:

1. **_Open_** each affected SVG
2. **_Verify_** the displayed technologies,
3. **_Verify_** the displayed percentages or Curated labels,
4. **_Check_** technology ordering,
5. **_Check_** icon rendering,
6. **_Inspect_** light & dark themes,
7. **_Verify_** multi-row sections if applicable.

If a **_statistics definition was added, removed or renamed_**, also **_verify_** that the GitHub Profile README references the correct generated SVG.

🗒️ _**Example:** If the definition ID is `frontend`, the README reference must use the corresponding generated filename:_

```md
![Frontend statistics](./assets/tech-stats/statistics/front-end.svg) ❌

![Frontend statistics](./assets/tech-stats/statistics/frontend.svg) ✅
```

**6. Verify the final GitHub presentation**

Once the **_generated files are correct locally_**:

- **_Open_** the GitHub Profile README,
- **_Verify_** that each statistics image loads correctly,
- **_Check_** the visual presentation on desktop & mobile,
- **_Check_** both light & dark themes when possible.

> 🖋️ **_N.B.:_**
>
> _The **generated SVG files** are the **public output of the engine**._
>
> _The **private analysis report remains a separate local inspection artifact** & must **not** be used as a **public output**._

[🔼 Back to the Table of Contents](#-table-of-contents)

## 🧪 Tests & Validation

This **_section_** explains how to **_update the implementation & corresponding automated tests_** when the engine behavior changes, then how to **_validate the complete engine locally_** before accepting the resulting statistics.

The engine uses **_2 complementary validation levels_**:

|        Validation         |       Command        | Purpose                                                       |
| :-----------------------: | :------------------: | :------------------------------------------------------------ |
| **TypeScript validation** | `pnpm run typecheck` | _**Check the TypeScript codebase** without generating output_ |
|    **Automated tests**    |   `pnpm run test`    | _Execute the **Engine & Workflow test suites**_               |

> 🖋️ **_N.B.:_**
>
> _Those commands confirm the following:_
>
> - _**TypeScript validation confirms** that the code satisfies the **configured type checks**,_
> - _The **automated tests confirm** that the **tested engine & workflow behaviors still produce the expected results**,_
> - _**Neither replaces the final inspection** through real 🔬 'Analyze' & 📈 'Generate' executions._

[🔼 Back to the Table of Contents](#-table-of-contents)

### 🔧 Updating Implementation & Tests

When a **_modification changes how the engine behaves_**, **_update the implementation & the tests_** describing that behavior together:

**1. Identify which implementation area is affected**

The **_main engine implementation is located_** in:

```txt
📂 scripts/tech-stats/
├── 📂 detectors/
│   └── Specialized technology detection
│
└── 📂 src/
    ├── analyze.ts
    ├── detect.ts
    ├── github.ts
    ├── load-config.ts
    ├── load-definitions.ts
    ├── metrics.ts
    ├── output.ts
    ├── render.ts
    ├── report.ts
    ├── 📂 constants/
    ├── 📂 types/
    └── 📂 utils/
```

Use the following **_table to identify a likely starting point_**:

| Intended Change                                                       |      Implementation Area       |
| :-------------------------------------------------------------------- | :----------------------------: |
| _Repository selection, evidence collection or analysis orchestration_ |        `src/analyze.ts`        |
| _Generic or specialized technology detection coordination_            | `src/detect.ts` & `detectors/` |
| _GitHub API access or repository-tree retrieval_                      |        `src/github.ts`         |
| _Configuration loading & validation_                                  |      `src/load-config.ts`      |
| _Statistics-definition loading & validation_                          |   `src/load-definitions.ts`    |
| _Metric calculation_                                                  |        `src/metrics.ts`        |
| _Public output generation, synchronization or privacy checks_         |        `src/output.ts`         |
| _SVG rendering, icons, layout or theme behavior_                      |        `src/render.ts`         |
| _Private report creation or persistence_                              |        `src/report.ts`         |
| _CLI argument parsing or shared engine utilities_                     |          `src/utils/`          |

**2. Locate the corresponding Engine tests**

The **_Engine tests are located_** in:

```txt
📂 scripts/tech-stats/
└── 📂 tests/
    └── 📂 engine/
        ├── 📂 fixtures/
        │   ├── analysis.ts
        │   └── github.ts
        │
        ├── 📂 helpers/
        │   └── assertions.ts
        │
        ├── 📂 utils/
        │   ├── commands.ts
        │   └── json.ts
        │
        ├── analyze.ts
        ├── detect.ts
        ├── github.ts
        ├── load-config.ts
        ├── load-definitions.ts
        ├── metrics.ts
        ├── output.ts
        ├── render.ts
        └── report.ts
```

The **_root Engine test files mirror the main engine modules_**, while the dedicated directories separate other testing responsibilities:

- `utils/` contains tests for production utilities,
- `fixtures/` contains reusable controlled test data,
- `helpers/` contains test-only utilities shared by several test files.

The `fixtures/` & `helpers/` files support the test suites through imports rather than acting as standalone test suites themselves.

🗒️ _**Example:** Modify SVG rendering behavior_

```txt
     Implementation
   📄 src/render.ts
           │
           ▼
   Corresponding tests
📄 tests/engine/render.ts
```

_If a **change affects several engine responsibilities**, **inspect & update** each relevant test file._

🗒️ _**Example:** Add a content-based technology detector_

_A detector requiring new evidence-file retrieval may involve:_

```txt
📄 detectors/[technology].ts
        │
        ├── Detection behavior
        │       ▼
        │      📄 tests/engine/detect.ts
        │
        └── Evidence retrieval
                ▼
               📄 tests/engine/analyze.ts
```

**3. Update the implementation**

- **_Open_** the relevant implementation file,
- **_Apply the intended behavior change_**,
- **_Keep the change_** within the existing responsibility of the module **_when possible_**,
- **_Update related types, utilities or constants_** if the implementation contract changes.

🗒️ _**Example:** If the engine gains a new rendering property_

```txt
       🎨
New rendering property
        │
        ├── Configuration validation
        │      └── src/load-config.ts
        │
        ├── Rendering type
        │      └── src/types/rendering.ts
        │
        └── Rendering behavior
               └── src/render.ts
```

> 🖋️ **_N.B.:_**
>
> _The **corresponding tests** should then **verify both the accepted configuration & the resulting rendering behavior**._

**4. Update or add automated tests**

For **_every behavior change_**:

- **_Add or update a positive scenario_** demonstrating the **_expected behavior_**,
- **_Add a negative or edge-case scenario_** when incorrect input or false-positive behavior is possible,
- **_Use controlled fixtures_** so the test result does **_not depend on live GitHub repository data_**,
- **_Keep the expected result explicit_** so a **_regression produces a meaningful failure_**.

🗒️ **_Example:_**

_For a new detector:_

```txt
Positive fixture
└── Valid technology evidence
    └── ✅ Technology detected

Negative fixture
└── Similar but insufficient evidence
    └── ❌ Technology not detected
```

_For configuration validation:_

```txt
Valid configuration
└── ✅ Loaded successfully

Invalid configuration
└── ❌ Rejected with an error
```

> 🖋️ **_N.B.:_**
>
> _A **test should confirm the behavior being introduced**, not merely execute the new code without asserting its result._

**5. Update Workflow tests when the automation contract changes**

**_Workflow-specific tests are located_** in:

```txt
📂 scripts/tech-stats/
└── 📂 tests/
    └── 📂 workflow/
        ├── 📂 constants/
        │   ├── branches.ts
        │   ├── commands.ts
        │   ├── commits.ts
        │   ├── secret-names.ts
        │   └── step-ids.ts
        │
        ├── 📂 fixtures/
        │   ├── cadence-guard.ts
        │   └── update-tech-stats-workflow.ts
        │
        ├── cadence.ts
        ├── generation.ts
        ├── publication.ts
        ├── setup.ts
        └── validation.ts
```

- **_Update these tests_** when a change affects the GitHub Actions workflow contract rather than only the local engine implementation,
- **_Use the corresponding test area_** according to the workflow behavior being modified:

|  Workflow Test   | Example Responsibility                                 |
| :--------------: | :----------------------------------------------------- |
|   `cadence.ts`   | _Workflow scheduling or execution cadence_             |
| `generation.ts`  | _Statistics generation behavior used by the workflow_  |
| `publication.ts` | _Generated-output staging, PR or publication behavior_ |
|    `setup.ts`    | _Workflow environment & dependency setup_              |
| `validation.ts`  | _Required workflow validation steps_                   |

> 🖋️ **_N.B.:_**
>
> _For the **internal GitHub Actions mechanism itself**, refer to the **[GitHub Workflow](../../docs/tech-stats/github-workflow.md) documentation**._

**6. Execute the automated tests**

After updating the implementation & tests, **_execute_**:

```bash
pnpm run test
```

This command runs **_both the Engine & Workflow test suites_**.

If a **_test fails_**:

1. **_Read_** the failing test name,
2. **_Identify whether_** the implementation or the expected behavior is incorrect,
3. **_Correct_** the appropriate file,
4. **_Run the test suite again_**.

> 🖋️ **_N.B.:_**
>
> _Do **not update a failing expectation only** to make the test pass._
>
> _**First verify** whether the intended engine behavior has actually changed._

[🔼 Back to the Table of Contents](#-table-of-contents)

### ✅ Local Validation Sequence

Once the **_implementation, configuration or statistics definitions have been modified_**, follow the **_complete local validation sequence_**.

From:

```txt
📂 scripts/tech-stats/
```

**1. Validate the TypeScript codebase**

Run:

```bash
pnpm run typecheck
```

The **_command must complete_** without TypeScript errors.

> 🖋️ **_N.B.:_**
>
> _If it **fails**:_
>
> - _**Correct** the reported type errors_,
> - _**Run the command again**_,
> - _Do **not continue** to engine execution until the typecheck succeeds._

**2. Execute the automated tests**

- Run:

```bash
pnpm run test
```

- Verify that **_all Engine & Workflow tests pass_**.

```txt
     TypeScript validation
               │
               ▼
              ✅
               │
               ▼
     Automated test suites
               │
               ▼
              ✅
               │
               ▼
Continue to real engine execution
```

**3. Run 🔬 'Analyze' mode**

- Execute:

```bash
pnpm run tech-stats:report
```

- **_Open the generated private report_** & verify:
  - _Repository selection_
  - _Detected technology evidence_
  - _Language measurements_
  - _Calculated statistics_
  - _Any behavior directly affected by the modification_

> 🖋️ **_N.B.:_**
>
> _Refer to [Private Analysis](#-private-analysis) for the **complete inspection procedure**._

**4. Correct unexpected analysis results**

If the **_report contains an unexpected_** repository, evidence signal or calculated value:

```txt
      Unexpected result
              │
              ▼
Identify affected configuration,
  definition or implementation
              │
              ▼
      Correct the change
              │
              ▼
             Run
     `pnpm run typecheck`
              │
              ▼
       `pnpm run test`
              │
              ▼
        Analyze again
```

**_Repeat the validation steps_** until the private analysis produces the intended result.

**5. Run 📈 'Generate' mode**

Once the **_private analysis is satisfactory_**, execute:

```bash
pnpm run tech-stats
```

**6. Inspect the generated SVGs**

- **_Verify all affected_** generated statistics files,
- **_Check_**:
  - _Displayed technologies_,
  - _Calculated percentages or Curated labels_,
  - _Technology ordering_,
  - _Icons_,
  - _Layout & spacing_,
  - _Light & dark theme rendering_,
  - _Any newly created or removed SVG files_.

If the **_modification affects shared rendering behavior_**, **_inspect every generated section_** rather than only the section that originally motivated the change.

**7. Verify the GitHub Profile presentation**

**_Open the root GitHub Profile README_** & verify that:

- Every referenced statistics **_SVG loads correctly_**,
- The expected **_statistics sections are displayed_**,
- The resulting **_image sizing remains appropriate_**,
- The **_presentation works on desktop & mobile_**,
- **_Light & dark themes remain readable_**.

**8. Review the modified files**

Before accepting the change, **_inspect the Git diff_**:

```bash
git status
git diff
```

**_Verify_** that:

- **_Only intended_** implementation, configuration, test or generated files changed,
- **_No private analysis report was added_** to the repository,
- **_No credential or private repository information appears_** in tracked files,
- **_Generated SVG changes correspond_** to the intended engine modification.

The **_complete local sequence can therefore be summarized_** as:

```txt
     🔧 Modification
             │
             ▼
    `pnpm run typecheck`
             │
             ▼
            ✅
             │
             ▼
      `pnpm run test`
             │
             ▼
            ✅
             │
             ▼
            🔬
 `pnpm run tech-stats:report`
             │
             ▼
            📜
    Inspect private report
             │
             ▼
    Results satisfactory?
        │           │
       ❌          ✅
        │           │
        ▼           ▼
     Correct    📈 Generate
   the change   public SVGs
        │           │
        │           ▼
        │      Inspect SVGs
        │           │
        │           ▼
        │      Check README
        │           │
        │           ▼
        │      ✅ Validated
        │
        └───────────→ Restart local validation
```

> 🖋️ **_N.B.:_**
>
> _**Local validation** confirms the **engine's behavior before automation**._
>
> _The following **[GitHub Actions Setup](#️-github-actions-setup) section** explains **how to configure & verify the automated execution environment**._

[🔼 Back to the Table of Contents](#-table-of-contents)

## ☁️ GitHub Actions Setup

This **_section_** explains how to **_prepare the GitHub repository for automated Technology Statistics execution_**, configure the required secrets & **_manually verify the complete workflow_**.

The **_automation is defined_** in:

```txt
📂 .github/
└── 📂 workflows/
    └── update-tech-statistics.yml
```

The workflow uses **_two separate credential boundaries_**:

|     Credential     | Purpose                                                                        |                   Source                   |
| :----------------: | :----------------------------------------------------------------------------- | :----------------------------------------: |
| `TECH_STATS_TOKEN` | Read repository information required for Technology Statistics analysis        |            _Repository secret_             |
|   `GITHUB_TOKEN`   | Persist generated SVGs, manage the update pull request & integrate the refresh | _Automatically provided by GitHub Actions_ |

An **_optional `TECH_STATS_REPOSITORIES` secret_** can also **_provide private repository-selection overrides_**.

> 🖋️ **_N.B.:_**
>
> _The **analysis token & publication token are intentionally separated**._
>
> _`TECH_STATS_TOKEN` is **used during repository analysis** & is **not** used to publish generated changes._
>
> _The **automatically provided** `GITHUB_TOKEN` is used **for publication** & is **not** passed to the engine analysis._

[🔼 Back to the Table of Contents](#-table-of-contents)

### 🔒 Secrets & Permissions

Before executing the workflow, **_configure the credential_** used to analyze repositories & **_verify the permissions required for publication_**.

**1. Create the analysis token**

**_Create a GitHub access token_** for the account owning the repositories to analyze.

The **_token must_** have **_read access to every repository_** that may participate in the Technology Statistics analysis.

For a **_fine-grained personal access token_**, **_configure_**:

|     Configuration     | Required Value                                                           |
| :-------------------: | :----------------------------------------------------------------------- |
|  **Resource owner**   | _GitHub account owning the repositories to analyze_                      |
| **Repository access** | _Repositories that may participate in the analysis_                      |
|     **Contents**      | _Read-only_                                                              |
|     **Metadata**      | _Read-only access used by repository discovery & repository information_ |

🗒️ **_Example:_**

_If the statistics may analyze:_

```txt
hal-9000/help-the-humans
hal-9000/maintain-the-space-vessel
hal-9000/earth-destruction
```

_The **token must** be able to **read all repositories from this list** that the engine may select._

> 🖋️ **_N.B.:_**
>
> _Grant the analysis token **only the repository access required by the engine**._
>
> _The token does **not** need permission to modify repository contents, branches or pull requests._

**2. Store the token as a repository secret**

- **_Open the GitHub Profile repository settings_**,
- Navigate to the **_repository's GitHub Actions secrets_**,
- **_Create a new repository secret_** using the **_exact name_**:

```txt
TECH_STATS_TOKEN
```

- **_Paste the analysis token as its value_**,
- **_Save_** the secret.

The **_workflow then exposes it only_** to the generation step:

```txt
     Repository Secret
    `TECH_STATS_TOKEN`
             │
             ▼
      GitHub Actions
     Generation step
             │
             ▼
Technology Statistics Engine
             │
             ▼
  Read repository evidence
```

> 🖋️ **_N.B.:_**
>
> _Do **not** add `TECH_STATS_TOKEN` to `.env`, workflow source, configuration files or any other tracked file._

**3. _Optional_: Configure private repository-selection overrides**

If **_automated execution requires a different repository selection_** from the public `repository-settings.json` configuration, **_create another repository secret_** named:

```txt
TECH_STATS_REPOSITORIES
```

Its **_value follows the same JSON structure_** used for the local private override.

🗒️ **_Example:_**

```json
{
  "include": ["hal-9000/help-the-humans", "hal-9000/earth-destruction"]
}
```

_Store the JSON object itself as the secret value._

The **_resulting configuration sources are_**:

```txt
Local execution
└── 📄 .env
    └── TECH_STATS_REPOSITORIES

GitHub Actions
└── 🔒 Repository Secret
    └── TECH_STATS_REPOSITORIES
```

> 🖋️ **_N.B.:_**
>
> _`TECH_STATS_REPOSITORIES` is **optional**. If it is **not configured**, **automated execution** uses the public repository selection from `config/repository-settings.json`._
>
> _The **override changes repository selection**, **not** repository access. `TECH_STATS_TOKEN` **must** still be able to **read every selected private repository**._

**4. Verify the workflow publication permissions**

- Open:

```txt
📄 .github/workflows/update-tech-statistics.yml
```

- Verify that the workflow declares:

```yaml
permissions:
  contents: write
  pull-requests: write
```

These **_permissions_** allow the **_automatically provided_** `GITHUB_TOKEN` to perform the publication lifecycle.

```txt
`contents: write`
    └── Push generated update state
        & manage repository contents

`pull-requests: write`
    └── Create & manage
        the Technology Statistics pull request
```

> 🖋️ **_N.B.:_**
>
> _You do **not** need to create a `GITHUB_TOKEN` repository secret._
>
> _**GitHub automatically creates** this token for each workflow job._

**5. Allow GitHub Actions to create pull requests**

In the repository's GitHub Actions settings, follow these steps:

1. Open **_Settings_**,
2. Open **_Actions_**,
3. Open **_General_**,
4. Locate **_Workflow permissions_**,
5. Enable **_"Allow GitHub Actions to create and approve pull requests"_**,
6. **_Save_** the setting.

The **_workflow requires this capability_** because changed Technology Statistics are published through an automated pull request.

🗒️ **_Example:_**

```txt
  Generated SVGs changed
             │
             ▼
  Periodic branch updated
             │
             ▼
  GitHub Actions creates
    or refreshes the PR
             │
             ▼
    PR is squash-merged
             │
             ▼
     `master` receives
Technology Statistics Refresh
```

> 🖋️ **_N.B.:_**
>
> _The **workflow file already restricts its** `GITHUB_TOKEN` to the two permissions it requires: `contents: write` & `pull-requests: write`._

**6. Verify the workflow configuration**

Before **_manually executing the workflow_**, confirm:

```txt
✅ `.github/workflows/update-tech-statistics.yml` exists

✅ `TECH_STATS_TOKEN` exists
     └── Can read every intended repository

✅ `TECH_STATS_REPOSITORIES` exists
     └── Only if a private selection override is required

✅ `contents: write`

✅ `pull-requests: write`

✅ GitHub Actions may create pull requests
```

Once these **_requirements are satisfied_**, **_proceed to manual execution_**.

[🔼 Back to the Table of Contents](#-table-of-contents)

### 🔄 Manual Execution & Verification

The **_workflow supports manual execution_** through `workflow_dispatch`.

A **_manual run is automatically authorized by the cadence check_** & therefore proceeds **_immediately_** through the Technology Statistics workflow regardless of the current ISO week.

> 🖋️ **_N.B.:_**
>
> _A **manual workflow run** is **not** a dry run._
>
> _If the generated Technology Statistics differ from the currently accepted SVGs, the **workflow can create or refresh its update pull request & squash-merge** the resulting changes into `master`._

**1. Confirm the state you intend to execute**

The workflow currently defines:

```yaml
env:
  BASE_BRANCH: master
  UPDATE_BRANCH: miervaldis42/update-tech-stats-periodically
```

During execution, the **_workflow explicitly checks out_**:

```txt
master
```

before installing dependencies, running tests & executing the engine.

Therefore, a **_manual run validates & regenerates statistics_** from the **_current accepted `master` state_**.

> 🖋️ **_N.B.:_**
>
> _Selecting another branch when starting `workflow_dispatch` changes the **workflow definition revision being executed**, but does **not change the workflow's configured `BASE_BRANCH`**._
>
> _The engine implementation, tests & configuration are still retrieved from `master` by the explicit checkout step._
>
> _For **final production verification**, select `master` & execute the workflow only when the intended Technology Statistics implementation & configuration are available from `master`._

**2. Start the workflow manually**

Go to the [GitHub website](https://github.com/) and follow these steps:

1. **_Open the repository_**,
2. Open **_Actions_**,
3. Select **_"Update GitHub Profile Technology Statistics"_**,
4. Select **_"Run workflow"_**,
5. Select `master` for **_final production verification_**,
6. Confirm **_"Run workflow"_**.

Because the **_execution is manual_**:

```txt
     `workflow_dispatch`
              │
              ▼
        Cadence check
              │
              ▼
✅ Authorized immediately
```

The **_odd/even ISO-week restriction_** applies **_only_** to scheduled executions.

**3. Open the workflow run**

Once the **_workflow starts_**:

- Open the **_new workflow run_**,
- **_Open the `update` job_**,
- Follow the **_execution steps in order_**.

The **_expected process is_**:

```txt
          🕰️
        Cadence
           │
           ▼
          📥
    Checkout `master`
           │
           ▼
          🟢
     Node.js Setup
           │
           ▼
          📦
Dependency Installation
           │
           ▼
          ✅
       Typecheck
           │
           ▼
          🧪
    Automated Tests
           │
           ▼
          📈
 Statistics Generation
           │
           ▼
Generated SVGs changed?
    │              │
   ❌             ✅
    │              │
    ▼              ▼
   🏁             💾
  Finish     Persist changes
successfully       │
                   ▼
                  🔀
           Create / Refresh PR
                   │
                   ▼
                  🧹
              Squash Merge
                   │
                   ▼
                  🔄
              Realignment
```

**4. Verify the validation & generation steps**

Confirm that the following **_operations complete successfully_**:

```txt
`pnpm install --frozen-lockfile`
              │
              ▼
     `pnpm run typecheck`
              │
              ▼
       `pnpm run test`
              │
              ▼
    `pnpm run tech-stats`
```

If **_any of these operations fails_**, the **_workflow must stop_** before accepting a Technology Statistics refresh.

**5. Determine whether statistics changed**

- Open the **_"Publication: Statistics Persistence"_** step.

**_2 outcomes_** are possible:

- _**Case 1**: No generated statistics changed_

The **_workflow finishes successfully_** without creating a new commit, pull request or merge.

```txt
Generated statistics
         │
         ▼
    No Git diff
         │
         ▼
   `update=false`
         │
         ▼
    ✅ Finish
```

This is an **_expected successful result_**.

- _**Case 2**: Generated statistics changed_

The **_workflow continues through the publication sequence_**:

```txt
           📈
Generated statistics changed
            │
            ▼
           💾
   Create Update commit
            │
            ▼
           🚀
   Push periodic branch
            │
            ▼
           🔀
   Create / Refresh PR
            │
            ▼
           🧹
      Squash Merge
            │
            ▼
           📈
   Refresh commit lands
       on `master`
            │
            ▼
           🔄
 Realign periodic branch
```

**6. Verify a workflow run with changes**

If the **_workflow detected changed SVGs_**, **_verify_** the following repository state.

- **_Pull request_**

Confirm that a **_Technology Statistics pull request was created or refreshed_**:

```txt
📈 Technology Statistics Update
```

The **_pull request should identify_** the generated statistics files that changed.

- **_Accepted commit_**

After the **_squash merge_**, verify that `master` contains the resulting commit:

```txt
📈 (tech-stats): Technology Statistics Refresh
```

Its **_body should contain_**:

```txt
Refresh the generated technology statistics from current repository evidence

Metadata: gh-pr=<pull-request-number>
```

- **_Generated SVGs_**

Open:

```txt
📂 assets/tech-stats/statistics/
```

**_Verify that the accepted SVG files_** correspond to the generated statistics from the workflow run.

- **_Periodic branch_**

Verify that:

```txt
miervaldis42/update-tech-stats-periodically
```

**_has been realigned with the latest accepted_** `master` state after the merge.

**7. Verify the GitHub Profile**

Finally:

1. **_Open the GitHub Profile README_**,
2. **_Verify that every Technology Statistics image loads_**,
3. **_Check the displayed values_**,
4. **_Check the visual presentation_**,
5. **_Verify both desktop & mobile rendering_**,
6. **_Check light & dark themes when possible_**.

> 🖋️ **_N.B.:_**
>
> _For the **complete workflow lifecycle**, including cadence behavior, persistence, pull-request management, squash merging, failure recovery & branch realignment, refer to the **[GitHub Workflow](../../docs/tech-stats/github-workflow.md) documentation**._

[🔼 Back to the Table of Contents](#-table-of-contents)

## 🛑 Troubleshooting & Safety

This **_section_** provides a **_practical reference for diagnosing common Technology Statistics problems_** & summarizes the **_security boundaries that must remain protected_** while configuring, testing or executing the engine.

When a **_failure occurs_**, **_start from the first failing stage_** rather than modifying several parts of the engine simultaneously.

```txt
Something failed
      │
      ▼
Which stage failed?
      │
      ├── Configuration / TypeScript
      │
      ├── Automated tests
      │
      ├── 🔬 Analysis
      │
      ├── 📈 Generation
      │
      └── ☁️ GitHub Actions
              │
              ▼
  Investigate that stage first
```

[🔼 Back to the Table of Contents](#-table-of-contents)

### 🚩 Common Issues

Use the following **_table to identify the most likely starting point_**:

| Problem                                               | Check First                                                       |                                     Relevant Area                                     |
| :---------------------------------------------------- | :---------------------------------------------------------------- | :-----------------------------------------------------------------------------------: |
| _Engine cannot access expected repositories locally_  | `gh auth status` & repository selection                           |                       [Development Setup](#-development-setup)                        |
| _Wrong repositories participate in statistics_        | `repository-settings.json`, `.env` override & private report      | [Repository Selection & Private Overrides](#-repository-selection--private-overrides) |
| _Configuration is rejected_                           | JSON syntax & expected property structure                         |                    [Engine Configuration](#-engine-configuration)                     |
| _Statistics definition is rejected_                   | JSON Schema requirements, metric properties & duplicate IDs       |                       [Schema Validation](#-schema-validation)                        |
| _Technology is not detected_                          | Detection rule, detector implementation & private evidence report |                    [Technology Detection](#-technology-detection)                     |
| _Technology is detected unexpectedly_                 | Detection acceptance criteria & negative tests                    |                    [Technology Detection](#-technology-detection)                     |
| _Icon is rejected or rendered incorrectly_            | SVG structure, definition icon reference & theme variant          |        [Technology Icons & Theme Variants](#️-technology-icons--theme-variants)        |
| _Cards no longer fit inside the SVG_                  | `canvasWidth`, card dimensions & spacing                          |                [Layout, Margins & Spacing](#-layout-margins--spacing)                 |
| _Private report cannot be created_                    | Report destination                                                |                        [Private Analysis](#-private-analysis)                         |
| _Generated SVG disappeared_                           | Corresponding statistics definition                               |                   [Public SVG Generation](#-public-svg-generation)                    |
| _Automated tests fail after an implementation change_ | Test covering the changed behavior                                |          [Updating Implementation & Tests](#-updating-implementation--tests)          |
| _GitHub Actions cannot analyze repositories_          | `TECH_STATS_TOKEN` access                                         |                    [Secrets & Permissions](#-secrets--permissions)                    |
| _Workflow cannot publish changes_                     | Workflow permissions & repository Actions settings                |                    [Secrets & Permissions](#-secrets--permissions)                    |
| _Manual workflow finishes without creating a PR_      | Whether generated SVGs actually changed                           |          [Manual Execution & Verification](#-manual-execution--verification)          |

[🔼 Back to the Table of Contents](#-table-of-contents)

### 🔑 Repository Access Problems

If **_🔬 'Analyze' or 📈 'Generate' mode cannot access_** an expected repository **_locally_**:

**1. Check GitHub CLI authentication**

```bash
gh auth status
```

**2. Verify that the active account can access the repository**

**3. Check the effective repository-selection configuration**

```bash
pnpm run tech-stats:report
```

**4. Inspect the private report's `selection` information**

If an **_expected repository does not appear_** in `selection` at all, first **_verify that the active credentials can discover & access it_**.

The **_engine can record an exclusion reason only_** for repositories returned during repository discovery.

A **_repository may be excluded because_** it is:

- _Fork_,
- _Archived_,
- _Profile repository_,
- _Explicitly excluded_,
- _Outside the inclusion list_,
- _Owned by another account_.

> 🖋️ **_N.B.:_**
>
> _Authentication controls **which repositories can be accessed** whereas repository configuration controls **which accessible repositories participate**._

**_For GitHub Actions_**, **_perform the equivalent access check_** against `TECH_STATS_TOKEN` rather than the local GitHub CLI session.

[🔼 Back to the Table of Contents](#-table-of-contents)

### 📋 Configuration or Definition Problems

If the **_engine rejects a JSON configuration or statistics definition_**:

**1. Check that the file exists, can be read & contains valid JSON syntax**

**2. Verify the expected property names & value types**

**3. For statistics definitions, verify the referenced JSON Schema**

```json
"$schema": "../schemas/statistics-definition.schema.json"
```

**4. Check metric-specific properties**

```txt
`language`
  └── requires `language`

`adoption`
  └── requires `rule`

`curated`
  └── requires `label`
```

**5. Check section & technology identifier uniqueness**

**6. Run the automated tests**

```bash
pnpm run test
```

> 🖋️ **_N.B.:_**
>
> _Do **not** add unsupported properties merely to make the JSON describe the intended behavior._
>
> _If the **engine genuinely requires a new configuration contract**, **update** the corresponding schema, types, implementation & tests instead._

[🔼 Back to the Table of Contents](#-table-of-contents)

### 🔎 Detection Problems

If an **_adoption-based technology is missing_** from the expected statistics:

**1. Run 🔬 'Analyze' mode**

```bash
pnpm run tech-stats:report
```

**2. Inspect the affected repository's `evidence` object**

**3. Determine whether the expected evidence is absent or simply not connected to the technology definition**

```txt
Expected evidence missing?
            │
    ┌───────┴───────┐
    │               │
   ✅              ❌
    │               │
    ▼               ▼
Detection   Check definition
  logic       `rule` key
```

For **_declarative detection_**, **_verify_**:

```txt
dependencies.exact
dependencies.prefix
configFiles
packageJsonFields
```

For **_specialized detection_**, **_verify_**:

```txt
Detector logic
      │
      ├── Correct technology key?
      ├── Correct evidence path?
      ├── Correct acceptance condition?
      └── Content file selected by `isEvidenceFile()` if required?
```

If the **_technology appears where it should not_**, **_create or update a negative test case_** reproducing the false-positive evidence before correcting the detector.

> 🖋️ **_N.B.:_**
>
> _Do **not** broaden detection simply because one repository is not recognized._
>
> _First determine whether the missing repository actually contains reliable evidence supported by the detection criteria._

[🔼 Back to the Table of Contents](#-table-of-contents)

### 📥 Evidence Collection Limits

If **_repository analysis stops because too many evidence files or an oversized evidence file_** would need to be retrieved, **_inspect_**:

```txt
📄 config/analysis-settings.json
```

The **_relevant properties are_**:

```json
{
  "maxEvidenceFiles": 500,
  "maxEvidenceBytes": 2097152
}
```

Before increasing those limits, **_check whether a new content-based detector_** selects files too broadly.

🗒️ **_Example:_**

```txt
Detector needs:
`AGENTS.md`

Good selection
└── `AGENTS.md`

Overly broad selection
└── every `.md`
    ├── README.md
    ├── CHANGELOG.md
    ├── docs/*.md
    └── ...
```

In this situation, **_narrow the evidence-file selection first_** rather than immediately increasing the configured limits.

[🔼 Back to the Table of Contents](#-table-of-contents)

### 🖼️ Icon & Rendering Problems

If an **_icon is rejected_**:

- **_Verify_** that the filename referenced by the technology definition exists,
- **_Verify_** that the SVG contains a `viewBox`,
- **_Remove_** unsupported executable or externally loaded content,
- **_Check_** that light & dark variants are both provided when using `icons`.

If the **_generated cards no longer fit_**:

```txt
    Card width
        +
    Card gaps
        +
Horizontal padding
        │
        ▼
 Must fit inside
  `canvasWidth`
```

**_Review_**:

```txt
cardWidth
cardGap
iconSize
pillWidth
outerHorizontalPadding
maxCardsPerRow
canvasWidth
```

Then **_regenerate_**:

```bash
pnpm run tech-stats
```

> 🖋️ **_N.B.:_**
>
> _A **rendering configuration may be technically valid** while still producing an undesirable visual result._
>
> _**Always inspect** generated SVGs after visual changes._

[🔼 Back to the Table of Contents](#-table-of-contents)

### 📈 Missing or Unexpected Generated SVGs

The **_generated SVG set_** follows the current statistics definitions:

```txt
Definition exists
└── `<section-id>.svg` generated

Definition removed
└── obsolete `<section-id>.svg` removed
```

If an **_expected SVG disappears_**:

**1. Verify that its definition file still exists**

**2. Verify its section `id`**

**3. Run 📈 'Generate' mode again**

```bash
pnpm run tech-stats
```

**4. Check the configured statistics output path**

If a **_section `id` changes_**, remember to **_update any README image reference_** using the previous filename.

[🔼 Back to the Table of Contents](#-table-of-contents)

### ☁️ GitHub Actions Problems

If the **_workflow fails_** during repository analysis:

- **_Verify_** that `TECH_STATS_TOKEN` exists,
- **_Verify_** that the token can read every selected repository,
- **_Verify_** the optional `TECH_STATS_REPOSITORIES` JSON when configured.

If **_generation succeeds but publication fails_**:

- **_Check_** the workflow's `contents: write` permission,
- **_Check_** its `pull-requests: write` permission,
- **_Check_** the repository's GitHub Actions workflow settings,
- **_Inspect_** the first failed publication step.

If a **_manual run succeeds without a pull request_**:

```txt
 Generation succeeded
          │
          ▼
Generated SVGs changed?
    │             │
   ❌            ✅
    │             │
    ▼             ▼
  No PR      Publication
 required     continues
```

**_No pull request is expected_** when the **_generated statistics are identical_** to the files already stored in the repository.

For **_scheduled executions_**, also remember that **_odd-numbered ISO weeks intentionally stop_** after the cadence decision.

> 🖋️ **_N.B.:_**
>
> _A **workflow run that produces no statistics change** is **not** a failed run._

[🔼 Back to the Table of Contents](#-table-of-contents)

### 🔐 Protect Private Information

The **_Technology Statistics system intentionally_** separates **_private analysis information_** from public generated statistics.

**_Always preserve_** the following boundary:

```txt
Private
├── Repository-level evidence
├── Private repository names
├── `TECH_STATS_TOKEN`
├── Private repository override
└── Analysis report

            ❌
        Never expose
             ↓

Public
├── Aggregate statistics
├── Public technology definitions
├── Icons
└── Generated SVGs
```

**_Never:_**

- **_Commit a private analysis report_**
- **_Copy private repository names into public configuration when they should remain private_**
- **_Store access tokens in tracked files_**
- **_Print credentials into logs_**
- **_Insert private evidence into generated SVGs_**
- **_Bypass privacy validation to force generation to succeed_**

> 🖋️ **_N.B.:_**
>
> _For **local authentication**, use the existing **GitHub CLI session**._
>
> _For **optional local private repository selection**, **use** `TECH_STATS_REPOSITORIES` **without committing its value**._
>
> _For **GitHub Actions**, **store sensitive values** through repository **secrets**._

[🔼 Back to the Table of Contents](#-table-of-contents)

### 📋 Final Checklist

**_Before committing or publishing Technology Statistics changes_**, perform one final check:

```txt
□ Typecheck passes

□ Automated tests pass

□ Private analysis was inspected

□ Repository selection is correct

□ Detection evidence is credible

□ Generated values are expected

□ Generated SVGs are visually correct

□ No private report is tracked

□ No credentials are present in tracked files

□ No private repository identifiers leaked into public files

□ Git diff contains only intended changes

□ GitHub Profile README references & displays the expected SVGs

□ GitHub Actions was manually verified when workflow, secrets or publication behavior changed
```

If **_every item is satisfied_**:

```txt
Technology Statistics change
            │
            ▼
           ✅
    Ready to accept
```

> 🖋️ **_N.B.:_**
>
> _For **architectural explanations** behind these protections, refer to the [**Engine Mechanism**](../../docs/tech-stats/engine-mechanism.md)._
>
> _For **automated publication failures & recovery states**, refer to the [**GitHub Workflow**](../../docs/tech-stats/github-workflow.md)._

[🔼 Back to the Table of Contents](#-table-of-contents)

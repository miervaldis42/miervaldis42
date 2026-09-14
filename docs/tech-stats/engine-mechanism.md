# 📈🛠️ Technology Statistics Engine

The **Technology Statistics Engine** is a **_deterministic TypeScript pipeline_** responsible for **_repository analysis, metric calculation & SVG generation_**.

Its **_main purpose_** is to **_generate the Technology Statistics SVGs displayed on my GitHub profile_** from evidence found across eligible GitHub repositories.

The **engine** is **responsible exclusively for** answering:

> **_"What Technology Statistics should be generated from the user's definitions and the current language & technology evidence recognized across eligible GitHub repositories?"_**

> 🖋️ **_N.B.:_**
>
> _Anything related to **scheduling, branch management & automatic publication of changed statistics** is handled separately by the [**GitHub Workflow**](./github-workflow.md)._

## 📑 Table of Contents

- [🧭 Overview](#-overview)
  - [🔀 Engine Modes](#-engine-modes)
  - [🗺️ Engine Flow](#️-engine-flow)
- [🗄️ Engine Structure](#️-engine-structure)
  - [🗂️ Package Organization](#️-package-organization)
  - [⚙️ Configuration Loading](#️-configuration-loading)
  - [📚 Statistics Definitions](#-statistics-definitions)
  - [🔄 Engine Script Flow](#-engine-script-flow)
- [🗃️ Repository Selection](#️-repository-selection)
  - [📋 Eligibility Rules](#-eligibility-rules)
  - [🎛️ Include & Exclude Rules](#️-include--exclude-rules)
  - [🔐 Private Selection Overrides](#-private-selection-overrides)
  - [📂 Empty Repositories](#-empty-repositories)
- [🔬 Repository Analysis](#-repository-analysis)
  - [📸 Evidence Collection](#-evidence-collection)
  - [📥 Evidence Limits](#-evidence-limits)
- [🔎 Technology Detection](#-technology-detection)
  - [📰 Accepted Evidence](#-accepted-evidence)
  - [📒 Detection Principles](#-detection-principles)
- [📊 Metrics](#-metrics)
  - [🌐 Language Share](#-language-share)
  - [📦 Repository Adoption](#-repository-adoption)
  - [🖋️ Curated Technologies](#️-curated-technologies)
  - [📭 No Data](#-no-data)
- [📜 Private Analysis Report](#-private-analysis-report)
  - [▶️ Analysis Execution](#️-analysis-execution)
  - [🧐 Report Inspection](#-report-inspection)
- [🎨 SVG Rendering](#-svg-rendering)
  - [🖼️ Statistics Generation](#️-statistics-generation)
  - [📐 Layout Model](#-layout-model)
  - [🌓 Theme Adaptation](#-theme-adaptation)
- [🛡️ Security](#️-security)
  - [🕶️ Privacy & Credential Boundaries](#️-privacy--credential-boundaries)
  - [🔑 Authentication & Secrets Setup](#-authentication--secrets-setup)
  - [ 🧱 Secret Configuration Boundaries](#-secret-configuration-boundaries)
- [✅ Validation & Tests](#-validation--tests)
  - [🧪 Test Coverage](#-test-coverage)
  - [🔄 Validation Sequence](#-validation-sequence)
- [⚠️ Engine Limits](#️-engine-limits)
  - [🛑 Analysis Failure Boundaries](#-analysis-failure-boundaries)

## 🧭 Overview

The **_Technology Statistics system_** separates **_configuration, repository evidence, statistical processing & publication into distinct responsibilities_**:

```txt
Definitions → define WHAT is configured
Evidence    → provides WHAT exists in repositories
Engine      → computes WHAT statistics result
Workflow    → decides WHEN & HOW they are published
```

This **_separation of responsibilities_** keeps the **_Technology Statistics Engine focused on transforming configured definitions & repository evidence into deterministic statistical outputs_**, while publication remains the responsibility of the GitHub workflow.

[🔼 Back to Table of Contents](#-table-of-contents)

### 🔀 Engine Modes

The **_Technology Statistics Engine_** exposes **_two execution modes_**:

- 🔬 **_'Analyze'_** mode,
- & 📈 **_'Generate'_** mode.

Those **_2 modes_** share the **_same repository-analysis core_** but differ in **_what they persist after the analysis completes_**.

The resulting **_mode behavior can be summarized_** as follows:

```txt
🔬 'Analyze' mode
→ analyze repositories
→ persist private report
```

```txt
📈 'Generate' mode
→ analyze repositories
→ keep analysis result in memory
→ generate SVGs
→ write generated outputs
```

[🔼 Back to Table of Contents](#-table-of-contents)

### 🗺️ Engine Flow

The **_Technology Statistics Engine_** combines **_configured statistics definitions, engine configuration & repository evidence_** to produce the Technology Statistics SVGs:

```txt
Statistics definitions
        +
Engine configuration
        +
Repository evidence
        │
        ▼
Technology Statistics Engine
        ├── Analyze evidence
        ├── Calculate metrics
        └── Generate & validate outputs
        │
        │
        ▼
Technology Statistics SVGs
```

Within this **_engine boundary_**, **_repository evidence_** moves through a more **_detailed analysis & rendering pipeline_**:

```txt
  Candidate GitHub repositories
               │
               ▼
┌───────────────────────────────┐
│ Repository Selection          │
│                               │
│ Ownership                     │
│ Public / authorized private   │
│ Include / exclude rules       │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│ Repository Evidence           │
│                               │
│ GitHub Linguist               │
│ Git trees                     │
│ Manifests                     │
│ Configuration files           │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│ Technology Detection          │
│                               │
│ Declarative detection rules   │
│ Specialized TypeScript logic  │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│ Analysis & Metric Calculation │
│                               │
│ Repository-level evidence     │
│ Language bytes                │
│ Aggregate measurements        │
└──────────────┬────────────────┘
               │
               ▼
        Analysis result
        held in memory
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
       🔬            📈
     Analyze      Generate
      mode          mode
        │             │
        ▼             ▼
 Persist private     Generate & validate
 report outside      public SVGs
 repository           │
                      ▼
                     Synchronize
                     generated SVG directory
```

In other words, the **_engine flow can therefore be summarized_** as:

```txt
Technology Statistics Engine
→ deterministic TypeScript pipeline

Inputs
→ definitions
→ configuration
→ repository evidence

Shared analysis core
→ selection
→ evidence collection
→ detection
→ metric calculation

Then
├── 🔬 'Analyze' mode
│      → private inspection report
│
└── 📈 'Generate' mode
       → validated public SVGs
       → synchronized output directory

Workflow
→ remains outside engine boundary
```

This **_separation between private analysis & public generation_** ensures that **_repository-level evidence remains available for inspection when needed_**, while the **_public generation path exposes only the aggregate statistics intended for the profile_**.

The **_final SVGs display aggregate measurements alongside any configured Curated labels_**. They do not expose the repository-level evidence used to calculate the measurements.

🗒️ **_Example:_**

```txt
Repository-level analysis
→ Repo A contains React evidence
→ Repo B contains React evidence
→ Repo C contains no React evidence

Public SVG
→ React — 66.7%
```

> 🖋️ **_N.B.:_**
>
> _The **engine** measures **repository evidence**, not personal proficiency._
>
> _A **percentage** indicates **what can be supported by the analyzed repositories**._
>
> _It **must not** be interpreted as a **skill rating**._

[🔼 Back to Table of Contents](#-table-of-contents)

## 🗄️ Engine Structure

The **_Technology Statistics Engine_** separates **_configurable data, implementation logic, structural contracts & verification by responsibility_**.

In that way, each **_concern can evolve without coupling unrelated parts_** of the system.

[🔼 Back to Table of Contents](#-table-of-contents)

### 🗂️ Package Organization

The **_engine package is organized around responsibility boundaries_** rather than file type alone.

Its **_main directories_** separate:

- _Configuration,_
- _Statistics definitions,_
- _Specialized detection logic,_
- _Structural contracts,_
- _Implementation code,_
- _& automated verification._

The **_directory tree of the engine is summarized_** as:

```txt
📂 scripts/tech-stats/
├── 📂 config/
│   ├── analysis-settings.json
│   ├── detection-rules.json
│   ├── paths-settings.json
│   ├── rendering-settings.json
│   └── repository-settings.json
│
├── 📂 definitions/
│   └── *.json
│
├── 📂 detectors/
│   └── *.ts
│
├── 📂 schemas/
│   └── statistics-definition.schema.json
│
├── 📂 src/
│   ├── 📂 constants/
│   ├── 📂 types/
│   ├── 📂 utils/
│   ├── analyze.ts
│   ├── detect.ts
│   ├── github.ts
│   ├── index.ts
│   ├── load-config.ts
│   ├── load-definitions.ts
│   ├── metrics.ts
│   ├── output.ts
│   ├── render.ts
│   └── report.ts
│
├── 📂 tests/
│   ├── 📂 engine/
│   └── 📂 workflow/
│
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
└── vitest.config.ts
```

**_Each top-level directory_** therefore represents a **_distinct responsibility_** within the engine:

```txt
📂 src/
→ engine implementation

📂 config/
→ HOW the engine operates

📂 definitions/
→ WHAT statistics the engine should generate

📂 detectors/
→ HOW specialized evidence is interpreted

📂 schemas/
→ WHAT configurable definition structures are valid

📂 tests/
→ WHAT behavior must remain protected
```

> 🖋️ **_N.B.:_**
>
> _The **engine package** also **interacts with public repository resources located outside** `scripts/tech-stats/`:_
>
> ```txt
> 📂 assets/tech-stats/icons/
> → Public technology icons
> → Used during SVG rendering
>
> 📂 assets/tech-stats/statistics/
> → Generated public Technology Statistics SVGs
> → Used in the GitHub Profile
> ```
>
> _Those **external resources** remain **separate from the engine implementation** to ensure **rendering inputs, generated outputs & engine code remain isolated** by responsibility._

This **_organization_** keeps configuration, statistics definitions, specialized detection logic, structural contracts, verification & public assets **_separated by responsibility_**, while the `src/` **_directory_** remains focused on **_executing the engine code_**.

[🔼 Back to Table of Contents](#-table-of-contents)

### ⚙️ Configuration Loading

The **_Configuration Loading step_** prepares the **_engine with the parameters it needs to operate correctly_**.

Rather than letting the engine use raw configuration files directly, this **_step retrieves, checks, normalizes & prepares their values_** before providing them to the implementation code.

```txt
        📄 config/*.json
               │
               ▼
       📄 load-config.ts
               ├── Validate engine settings
               ├── Resolve repository-relative paths
               └── Apply private repository override
               │
               │
               ▼
Validated & Normalized Configuration
               │
               ▼
      Engine Implementation
```

Each **_configuration file_** provides the **_parameters for a specific operational concern_**:

```txt
📄 repository-settings.json
→ repository ownership & selection

📄 analysis-settings.json
→ evidence boundaries & safeguards

📄 rendering-settings.json
→ SVG layout & theme

📄 paths-settings.json
→ definitions, icons & statistics output locations

📄 detection-rules.json
→ declarative technology evidence rules
```

This **_step_** therefore ensures the **_configuration is usable before the engine relies on it_**.

Once prepared, those **_settings calibrate how the engine does_** the repository selection, the evidence interpretation, locates its resources & finally, renders the resulting Technology Statistics SVGs.

By **_preparing configuration first_**, the engine can **_generate the expected SVGs with the appropriate repository, analysis, rendering & path settings_** without each part of the implementation having to prepare those values itself.

[🔼 Back to Table of Contents](#-table-of-contents)

### 📚 Statistics Definitions

The **_Statistics Definitions_** describe **_which Technology Statistics the engine is expected to generate_**.

**_Each definition_** acts as the **_blueprint for one statistics SVG_**, describing its identity, displayed technologies, metric strategies & icon references without embedding those decisions directly into the engine code.

```txt
📄 definitions/*.json
→ WHAT statistics should exist
→ technology ordering
→ metric strategy
→ icon references
→ detection-rule references where required
```

Before a definition can be used, the **_engine_** ensures that it **_follows the expected structure_** & does not conflict with another definition:

```txt
     📄 load-definitions.ts
                │
                ├── Load definition files
                │
                ▼
📄 statistics-definition.schema.json
                │
                ▼
     Validate each definition
                │
                ▼
       Check duplicate IDs
                │
                ▼
   Usable Statistics Definitions
```

The **_JSON Schema defines what a valid statistics definition may contain_**, while `load-definitions.ts` performs the checks that depend on the **_complete set of loaded definitions_**.

> 🖋️ **_N.B.:_**
>
> _**JSON parsing & JSON Schema validation form 2 separate validation boundaries**._
>
> _A **definition must** first be **readable & contain syntactically valid JSON** before its structure can be evaluated against `statistics-definition.schema.json`._
>
> _Once the **individual definition satisfies the schema**, `load-definitions.ts` performs the **cross-definition checks**, such as section & technology identifier uniqueness._

Once validated, the **_definitions become the source of truth_** for the generated Technology Statistics set:

```txt
Statistics Definitions
→ decide WHAT statistics should exist
      │
      ▼
Engine
→ generates & synchronizes the expected SVG set
      │
      ▼
Workflow
→ publishes resulting directory changes
      │
      ▼
Tests
→ protect the definition contract & synchronization behavior
```

This **_separation_** allows **_statistics content to evolve through configuration rather than implementation changes_**, while the **_engine_** remains responsible for **_turning those definitions into the corresponding public SVGs_**.

[🔼 Back to Table of Contents](#-table-of-contents)

### 🔄 Engine Script Flow

The **_Engine Script Flow_** describes **_how the engine's implementation modules work together_** to transform repository evidence into calculated statistics & their corresponding outputs.

The `src/index.ts` **_file_** acts as the **_engine's entry point_**, coordinating configuration loading, repository analysis & the execution of the requested command.

Each **_implementation module handles a specific responsibility_**:

```txt
📄 index.ts
→ engine entry point & orchestration

📄 load-config.ts
→ configuration preparation

📄 load-definitions.ts
→ statistics definition loading & validation

📄 github.ts
→ GitHub repository data

📄 analyze.ts
→ repository-analysis orchestration

📄 detect.ts + 📂 detectors/
→ technology evidence detection

📄 metrics.ts
→ statistical calculations

📄 report.ts
→ private analysis report

📄 render.ts
→ SVG generation & validation

📄 output.ts
→ public-output validation & persistence
```

The **_engine shares its repository-analysis mechanism_** between its two main commands, but **_produces different outputs depending on the requested operation_**.

Their **_outputs serve different purposes_**:

- 🔬 **_'Analyze' mode_** produces a **_private report_** for inspecting the collected evidence & calculated results.
- 📈 **_'Generate' mode_** uses the validated statistics definitions to **_render the expected SVGs & synchronize their public output directory_**.

This separation allows **_repository analysis to be reused without mixing private inspection data with public SVG generation_**.

The **_simplified execution flow_** can be represented as:

```txt
                📄 index.ts
      Select command & coordinate execution
                      │
                      ▼
              📄 load-config.ts
       Load & prepare engine settings
                      │
                      ▼
           📄 load-definitions.ts
     Load & validate statistics definitions
                      │
                      ▼
               📄 analyze.ts
       Select repositories & coordinate
              repository analysis
                      │
                      ▼
               📄 github.ts
        Access GitHub repository data
                      │
                      ▼
        📄 detect.ts + 📂 detectors/
        Interpret repository evidence
            using detection rules
                      │
                      ▼
                📄 metrics.ts
           Calculate statistics from
            evidence & definitions
                      │
                      ▼
                📄 report.ts
           Assemble analysis results
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
         🔬                      📈
    'Analyze' mode        'Generate' mode
          │                       │
          ▼                       ▼
         📄                      📄
      report.ts                render.ts
Save private report           Render SVGs
                                  │
                                  │
                                  ▼
                                 📄
                              output.ts
                       Validate & save outputs
                                  │
                                  ▼
                          Public Technology
                           Statistics SVGs
```

This **_diagram_** summarizes the **_engine's responsibilities rather than the exact internal function-call sequence_**.

> 🖋️ **_N.B.:_**
>
> _**Technology detection** must remain **deterministic & evidence-based**._
>
> _The **engine** uses **predefined rules & specialized detectors** to ensure that the same repository evidence & configuration **produce consistent detection results**._
>
> _**AI-based detection** could help **recognize technologies whose evidence is difficult to capture through predefined rules**. However, it would introduce **model-dependent judgments, API costs & additional maintenance** to ensure detection remains reliable as models evolve._

[🔼 Back to Table of Contents](#-table-of-contents)

## 🗃️ Repository Selection

Once the **_engine settings & statistics definitions have been loaded_**, the engine enters the **_analysis phase_**, starting with **_Repository Selection_**.

The **_Repository Selection step_** determines **_which GitHub repositories are included in the Technology Statistics analysis_**.

This **_selection directly influences the statistical results_**. In fact, the selected repositories provide the language data used **_for the [Language Share metric](#-language-share)_** & determine how many repositories are counted when **_calculating the [Repository Adoption metric](#-repository-adoption)_**.

To ensure **_only the intended repositories contribute to these calculations_**, the engine applies a combination of **_eligibility, inclusion & exclusion rules_**.

[🔼 Back to Table of Contents](#-table-of-contents)

### 📋 Eligibility Rules

The **_Technology Statistics Engine_** applies a **_set of eligibility rules_** to determine **_which repositories qualify for analysis_**.

These **_rules establish the selection boundaries_** by restricting the analysis to **_repositories owned by the configured GitHub account_**.

The **_eligible repositories_** are currently:

- _Public repositories,_
- _Authorized private repositories._

However, **_ownership alone does not guarantee eligibility_**. To ensure the **_statistics reflect the intended scope of the GitHub Profile_**, the engine applies **_additional restrictions_** to remove repositories that should not contribute to the analysis.

Therefore, the **_engine automatically excludes_**:

- _Forks,_
- _Archived repositories,_
- _The GitHub Profile repository itself,_
- _Explicitly excluded repositories._

These **_eligibility rules prevent repositories outside the intended analysis scope_** from contributing to the generated statistics.

[🔼 Back to Table of Contents](#-table-of-contents)

### 🎛️ Include & Exclude Rules

Once the **_repository eligibility requirements have been established_**, the **_engine uses configurable inclusion & exclusion rules_** to refine which repositories participate in the analysis.

These **_rules_** are **_defined through the `include` & `exclude` lists in `config/repository-settings.json`_**, allowing repository selection to be adjusted without modifying the engine code.

Both **_lists serve different purposes_**:

| Configuration | Purpose                                                                       |
| :-----------: | :---------------------------------------------------------------------------- |
| **`include`** | _Specifies **which eligible repositories** should be considered for analysis_ |
| **`exclude`** | _Identifies **which repositories must be excluded** from the analysis_        |

The **_engine interprets these lists_** according to the following principles:

1. **_An empty `include` list_** allows **_all otherwise eligible repositories_** to participate in the analysis:

   ```json
   {
     "include": []
   }
   ```

2. **_A non-empty `include` list_** restricts the analysis to **_the repositories explicitly identified by their full names_**.

3. **_The `exclude` list always takes precedence_** over the `include` list.

🗒️ _**Example:** Only `project-a` remains selected_

```json
{
  "include": ["username/project-a", "username/project-b"],
  "exclude": ["username/project-b"]
}
```

The **_selection process can be summarized_** as:

```txt
         Eligible repositories
                  │
                  ▼
      Is `include` array empty?
                  │
          ┌───────┴───────┐
          │               │
          ▼               ▼
         ✅              ❌
          │               │
          ▼               ▼
     Consider          Consider
 all eligible          only listed
 repositories          repositories
          │               │
          └───────┬───────┘
                  │
                  ▼
           Apply exclusions
                  │
                  ▼
        Selected repositories
                  │
                  ▼
                 🔎
             Repository
              analysis
```

> 🖋️ **_N.B.:_**
>
> _**Inclusion cannot override the built-in eligibility requirements**: repository ownership, fork exclusion, archive exclusion & GitHub Profile repository exclusion remain enforced._
>
> _**Repository names** are **compared case-insensitively**, preventing capitalization differences from affecting selection._

[🔼 Back to Table of Contents](#-table-of-contents)

### 🔐 Private Selection Overrides

The **_Private Selection Overrides mechanism_** allows the **_engine to customize repository selection without exposing private repository names_** in publicly tracked configuration files.

Instead of modifying `config/repository-settings.json`, the **_engine accepts an optional_** `TECH_STATS_REPOSITORIES` **_environment variable containing private selection settings_**.

The **_configuration source depends on the execution environment_**, allowing developers to test private repository selection locally before transferring the validated configuration to GitHub Actions:

|     Configuration Source     |                                 Configuration                                 | Dev & Tests | Automated Execution |
| :--------------------------: | :---------------------------------------------------------------------------: | :---------: | :-----------------: |
|       **Local `.env`**       | _`TECH_STATS_REPOSITORIES` **environment variable** containing a JSON object_ |     ✅      |         ❌          |
| **GitHub repository secret** | _**Secret** named `TECH_STATS_REPOSITORIES` containing the same JSON object_  |     ❌      |         ✅          |

> 🖋️ **_N.B.:_**
>
> _The `.env` **file is used exclusively during local development** when running the engine through script commands whereas the **GitHub Actions workflow uses the GitHub repository secret**._
>
> _For this reason, the **optional `.env` file must remain excluded from Git**._
>
> _If **GitHub Actions should use the same private repository selection**, store the validated JSON value in the `TECH_STATS_REPOSITORIES` repository secret._
>
> _The local `.env` file remains **optional & independent from the automated configuration**. It may be kept Git-ignored when the same or another private override is still useful for local execution._

The **_configuration value must contain a valid JSON object_** with two **_optional_** arrays:

| Configuration | Behavior                                               |
| :-----------: | :----------------------------------------------------- |
| **`include`** | _Replaces the **public inclusion list** when provided_ |
| **`exclude`** | _Replaces the **public exclusion list** when provided_ |

Both **_arrays operate independently_**: when an array is omitted, the engine keeps its corresponding public configuration.

The **_override mechanism follows this process_**:

```txt
         Private Selection Overrides
                     │
           Execution environment
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
      💻 LOCAL         ☁️ GITHUB ACTIONS
          │                     │
          ▼                     ▼
   Optional `.env`        GitHub Secret
          │                     │
          └──────────┬──────────┘
                     │
                     ▼
         `TECH_STATS_REPOSITORIES`
            Environment variable
                     │
                     ▼
          Is the variable provided
                & non-empty?
                     │
           ┌─────────┴─────────┐
           │                   │
           ▼                   ▼
          ❌                  ✅
           │                   │
           ▼                   ▼
      Keep public         Parse & validate
     configuration        private override
           │                   │
           │                   ▼
           │          Check provided arrays
           │                   │
           │         ┌─────────┴─────────┐
           │         │                   │
           │         ▼                   ▼
           │     `include`           `exclude`
           │         │                   │
           │         ▼                   ▼
           │    Replace public     Replace public
           │    inclusion list     exclusion list
           │    if provided        if provided
           │         │                   │
           │         └─────────┬─────────┘
           │                   │
           └─────────┬─────────┘
                     │
                     ▼
           Effective selection
              configuration
                     │
                     ▼
             Apply repository
             selection rules
```

🗒️ _**Example:** The following scenario illustrates **how a private override modifies the public configuration & determines which repositories are ultimately selected**_

**1. Public Configuration**

The `config/repository-settings.json` file initially defines:

```json
{
  "owner": "username",
  "include": ["username/portfolio", "username/old-project"],
  "exclude": ["username/internal-tool"]
}
```

**2. Private Override**

The `TECH_STATS_REPOSITORIES` configuration, supplied through the local `.env` file or a GitHub repository secret, provides:

```json
{
  "include": [
    "username/public-project",
    "username/private-project",
    "username/internal-tool",
    "username/fork-template"
  ]
}
```

Since the **_private override provides only the `include` array_**, the engine:

- **_Replaces_** the public `include` list **_with the private one_**,
- **_Preserves_** the public `exclude` list because no replacement was provided.

The **_resulting configuration_** becomes:

```json
{
  "owner": "username",
  "include": [
    "username/public-project",
    "username/private-project",
    "username/internal-tool",
    "username/fork-template"
  ],
  "exclude": ["username/internal-tool"]
}
```

**3. Final Repository Selection**

The **_engine applies the effective configuration_** alongside its built-in eligibility rules:

```txt
           Discovered Repositories
                     │
                     ▼
           Apply eligibility rules
                     │
                     ▼
           Effective Configuration
                     │
                     ▼
               Apply `include`
                     │
                     ▼
               Apply `exclude`
                     │
                     ▼
               Final Selection
```

|    Repository     |  Selection  | Reason                                                    |
| :---------------: | :---------: | :-------------------------------------------------------- |
| `public-project`  | ✅ Included | _**Public, eligible & explicitly** included_              |
| `private-project` | ✅ Included | _**Authorized, eligible & explicitly** included_          |
|  `internal-tool`  | ❌ Excluded | _**Explicit exclusion** takes precedence_                 |
|  `fork-template`  | ❌ Excluded | _**Forks** are ineligible, even when included_            |
|    `portfolio`    | ❌ Excluded | _Removed when the **public `include` list was replaced**_ |
|   `old-project`   | ❌ Excluded | _Removed when the **public `include` list was replaced**_ |

**_Final result:_**

```txt
✅ Repositories selected for analysis
   ├── `username/public-project`
   └── `username/private-project`

❌ Repositories excluded
   ├── `username/internal-tool`
   ├── `username/fork-template`
   ├── `username/portfolio`
   └── `username/old-project`
```

> 🖋️ **_N.B.:_**
>
> _This example assumes that the **private repository is accessible through the configured GitHub credentials**._
>
> _**Repositories listed** in the configuration **but not found** during repository discovery are **simply ignored**._

This **_approach keeps private repository selection separate from publicly tracked configuration_**, while preserving the same eligibility, inclusion & exclusion rules.

> 🖋️ **_N.B.:_**
>
> _An **empty array is different from an omitted array**._
>
> _Providing `"include": []` means the **engine does not restrict selection to specific repositories**. It considers **every discovered repository** under the configured GitHub account, while still excluding **forks, archived repositories, the GitHub Profile repository & repositories listed in `exclude`**._

[🔼 Back to Table of Contents](#-table-of-contents)

### 📂 Empty Repositories

Once the **_repository selection rules have been applied_**, the **_engine_** retains **_all selected repositories for analysis_**, including those that contain no files or detectable technologies.

This **_behavior is intentional_** because **_Repository Adoption measures the proportion_** of analyzed repositories containing evidence of a particular technology.

Consequently, **_every selected repository contributes to the calculation_** whether the technology is detected or not.

🗒️ **_Example:_**

```txt
       Selected Repositories
                │
       ┌────────┼────────┐
       │        │        │
       ▼        ▼        ▼
      📂       📂      📂
     Repo A   Repo B   Repo C
       │        │        │
       ▼        ▼        ▼
      ⚛️       🧹      ⚛️
     React   No files  React
       │        │        │
       └────────┼────────┘
                │
                ▼
       Repository Adoption
                │
                ▼
       React detected: 2
       Repositories:   3
                │
                ▼
          React: 66.7%
```

_Although **Repo B contains no files**, it still **contributes to the denominator** because it passed the repository selection rules._

**_Excluding empty repositories_** would **_artificially increase Repository Adoption percentages_** by removing selected repositories where the technology is absent.

> 🖋️ **_N.B.:_**
>
> _The **same principle applies to repositories containing files but no detectable technologies**: they remain part of the analysis & contribute to the Repository Adoption denominator._

[🔼 Back to Table of Contents](#-table-of-contents)

## 🔬 Repository Analysis

Once the **_Repository Selection phase has determined which repositories should participate_**, the engine proceeds to **_Repository Analysis_**.

This **_phase_** gathers the **_language statistics & repository file information_** required to calculate metrics and identify technologies.

For each selected repository, the **_engine retrieves information from GitHub_** through 2 complementary mechanisms:

|          Data Source           | Provides                              |                    Used For                    |
| :----------------------------: | :------------------------------------ | :--------------------------------------------: |
| **Repository file inspection** | _File paths & selected file contents_ | [Technology Detection](#-technology-detection) |
| **GitHub language statistics** | _Language usage data_                 |   [Language Share metric](#-language-share)    |

The **_engine does not clone or download entire repositories_**. Instead, **_it inspects repository file trees_** to identify potentially relevant evidence & retrieves selected file contents only when necessary.

To ensure **_the collected evidence remains complete & manageable_**, the analysis also **_operates within a set of configurable limits_**.

[🔼 Back to Table of Contents](#-table-of-contents)

### 📸 Evidence Collection

The **_Evidence Collection step gathers the information required_** to analyze each selected repository without downloading unnecessary source files.

The **_engine retrieves 2 categories of information_** _(language statistics & file-based evidence)_ through the **_following GitHub API endpoints_**:

|       Data Source        | Information Retrieved                                                       | Purpose                                                                                       |
| :----------------------: | :-------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| **GitHub Git Trees API** | _**Checked-in file paths & metadata** from the repository's default branch_ | _Identifies **files potentially relevant** to [Technology Detection](#-technology-detection)_ |
| **GitHub Git Blobs API** | _**Contents of selected evidence files**_                                   | _Provides **additional information** for content-based detection_                             |
| **GitHub Languages API** | _**Language usage** expressed as byte counts_                               | _Provides the **data used to calculate** [Language Share metric](#-language-share)_           |

While **_language statistics are retrieved directly from GitHub_**, **_file-based evidence_** requires an **_additional selection process_**.

The **_engine first inspects the repository's file tree_** to identify its checked-in files. It then **_filters out ignored paths & symbolic links_** before determining which remaining files require further inspection.

This **_distinction_** allows the engine to collect **_two types of file-based information_**:

| File-Based Information | Use                                                                                     | Examples                                                                      |
| :--------------------: | :-------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
|     **File paths**     | _Identify potentially relevant technologies through **file names & locations**_         | `next.config.ts`, `tailwind.config.ts`, `turbo.json`, `playwright.config.ts`  |
|   **File contents**    | _Inspect **information declared inside files** when their paths alone are insufficient_ | `package.json`, `schema.prisma`, `Dockerfile`, `.github/workflows/deploy.yml` |

🗒️ _**Example:** Consider a repository containing both a `next.config.ts` & a `package.json` file_

_The **engine collects evidence differently** depending on the information required:_

```txt
               Repository File Tree
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
             📄                    📄
       `next.config.ts`       `package.json`
              │                     │
              ▼                     ▼
         Retain path         Retrieve contents
              │                     │
              ▼                     ▼
         File exists         Read dependencies
              │                     │
              ▼                     ▼
         Next.js path         React dependency
           evidence              evidence
              │                     │
              └──────────┬──────────┘
                         │
                         ▼
                  🔎 Technology
                     Detection
```

_The **presence of** `next.config.ts` **provides path-based evidence for Next.js**, without requiring its contents to be downloaded._

_However, identifying **React as a declared dependency** requires the engine to retrieve & inspect the contents of `package.json`._

The **_complete collection process can be represented_** as follows:

```txt
                          📔
                   Selected Repository
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
             🗨️                        🌳
        GitHub Languages          GitHub Git Trees
              │                         │
              ▼                         ▼
         Language byte            Default-branch
            counts                  file tree
              │                         │
              │                         ▼
              │                 Filter ignored paths
              │                  & symbolic links
              │                         │
              │                         ▼
              │                  Eligible file paths
              │                         │
              │              ┌──────────┴──────────┐
              │              │                     │
              │              ▼                     ▼
              │         Retain paths         Identify files
              │              │             requiring content
              │              │                     │
              │              │                     ▼
              │              │                  Enforce
              │              │              evidence limits
              │              │                     │
              │              │                     ▼
              │              │                    🫧
              │              │              GitHub Git Blobs
              │              │                     │
              │              │                     ▼
              │              │                  Retrieve
              │              │           selected file contents
              │              │                     │
              │              └──────────┬──────────┘
              │                         │
              │                         ▼
              │                  File-based inputs
              │                         │
              ▼                         ▼
        Language Share         Technology Detection
            inputs                    inputs
```

The **_file-based inputs_** include both the **_eligible file paths_** & the **_contents of files requiring additional inspection_**.

These **_inputs are passed to the [Technology Detection phase](#-technology-detection)_**, where the engine evaluates them against its detection rules.

> 🖋️ **_N.B.:_**
>
> _**File inspection** concerns **checked-in files from the repository's default branch**, not its complete Git history._
>
> _The **ignored-path configuration applies to file-based evidence inspection**. It does not modify the language statistics supplied independently by GitHub._
>
> _If **GitHub returns an incomplete repository file tree**, the **engine attempts to recover the missing information** by inspecting its subtrees individually rather than accepting partial evidence._

[🔼 Back to Table of Contents](#-table-of-contents)

### 📥 Evidence Limits

Although the engine retrieves **_only the file contents required for technology detection_**, some repositories **_may contain an exceptionally large number of relevant files or oversized configuration files_**.

To prevent these situations from producing **_incomplete or unreliable statistics_**, the **_engine_** applies **_configurable evidence limits_** during Repository Analysis.

These **_limits are defined in `config/analysis-settings.json`_**:

|       Configuration       | Purpose                                                                                                   |
| :-----------------------: | :-------------------------------------------------------------------------------------------------------- |
| **`ignoredPathSegments`** | _Identifies **directory or path segments that must be excluded** from file-based evidence inspection_     |
|  **`maxEvidenceFiles`**   | _**Restricts the maximum number of files** whose contents may be retrieved from an individual repository_ |
|  **`maxEvidenceBytes`**   | _**Restricts the maximum size**, in bytes, of each individual evidence file_                              |

The **_ignored-path configuration prevents the engine from inspecting files_** inside directories that should not contribute technology evidence, _such as dependency installations, generated builds or test coverage outputs_.

Meanwhile, the **_file-count & file-size limits establish boundaries_** for the evidence that the engine is prepared to retrieve & process.

The **_engine enforces these limits_** through the following process:

```txt
              Eligible file paths
                       │
                       ▼
                Identify files
             requiring inspection
                       │
                       ▼
              Check evidence count
               & known file sizes
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
             ✅                ❌
              │                 │
              ▼                 ▼
    Retrieve selected    Reject analysis
       evidence files
              │
              ▼
      Verify retrieved
     file size & format
              │
        ┌─────┴─────┐
        │           │
        ▼           ▼
       ✅          ❌
        │           │
        ▼           ▼
  Accept file    Reject analysis
        │
        ▼
     Continue
evidence collection
```

If the **_number of required evidence files exceeds the configured limit_**, or an individual evidence file exceeds the permitted size, the **_engine rejects the analysis_**.

Likewise, if **_GitHub returns an unsupported evidence-file format or the engine cannot recover a complete repository file tree_**, the **_analysis is rejected_** rather than continued with incomplete information.

This **_fail-closed behavior_** ensures that the **_engine does not generate potentially misleading statistics_** from partially collected evidence.

> 🖋️ **_N.B.:_**
>
> _The **file-count limit applies only to files whose contents must be retrieved**, not to every file path discovered in the repository._
>
> _The **file-size limit applies to each individual evidence file**, rather than to the combined size of all evidence files._
>
> _A **repository containing no eligible files or no required evidence files** does **not** violate these limits. It remains part of the analysis, as established in [Empty Repositories](#-empty-repositories)._

[🔼 Back to Table of Contents](#-table-of-contents)

## 🔎 Technology Detection

Once the **_Repository Analysis phase has collected the required information_**, the engine proceeds to **_Technology Detection phase_**.

This **_phase_** determines **_whether an analyzed repository contains recognized evidence of a particular technology_**, using its collected file paths & selected file contents.

The **_engine deliberately answers one specific question_**:

> **_Does this repository contain evidence that satisfies a supported technology detection rule?_**

The **_presence of recognized evidence_** allows the engine to **_identify technology adoption_**. However, it does **_not attempt to establish_**:

- _Whether the technology is deployed in production,_
- _Whether it is actively used at runtime,_
- _The developer's proficiency with that technology,_
- _How frequently the technology is used within the repository._

To ensure **_technology identification remains consistent & reproducible_**, the engine uses **_deterministic detection rules_** rather than attempting to infer technology usage through AI.

These **_rules are implemented through two complementary mechanisms_**:

|    Detection Mechanism    |           Location            | Responsibility                                                                  | Examples                                                                                                   |
| :-----------------------: | :---------------------------: | :------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------- |
|   **Generic Detection**   | `config/detection-rules.json` | _Defines **common evidence** through declarative rules_                         | _Dependency declarations, configuration file paths & package fields_                                       |
| **Specialized Detection** |       `detectors/*.ts`        | _Implements **technology-specific checks** requiring additional interpretation_ | _Node.js runtime scripts, Prisma database providers, Docker Compose images & Vercel workflow integrations_ |

**_Both mechanisms are coordinated by_** `src/detect.ts`, which evaluates the collected information & records the recognized evidence for each repository.

The **_detection architecture can be represented_** as follows:

```txt
                          🔎
                 Technology Detection
                           │
                           ▼
                          📄
                      `detect.ts`
                           │
               ┌───────────┴───────────┐
               │                       │
               ▼                       ▼
              📋                      🛠️
          Generic Rules        Specialized Detectors
               │                       │
               ▼                       ▼
              📄                      📄
       `detection-rules.json`   `detectors/*.ts`
               │                       │
               ▼                       ▼
         Dependencies               Node.js
         Config paths               Prisma
         Package fields             Docker
               │                    Husky
               │                    Vercel
               │                       │
               └───────────┬───────────┘
                           │
                           ▼
                  Recognized Evidence
                           │
                           ▼
                  Repository Evidence
                           │
                           ▼
                          📊
                  Metrics Calculation
```

The **_resulting evidence is organized by technology & passed to the [Metrics phase](#-metrics)_**, where it can contribute to the corresponding [Repository Adoption metric](#-repository-adoption).

> 🖋️ **_N.B.:_**
>
> _**Technology detection & displaying a technology are separate decisions**._
>
> _A **detection rule may exist** even when the **corresponding technology is not included in the displayed statistics**._
>
> _Similarly, technologies using the **[Curated metric](#️-curated-technologies) receive their configured display labels** without requiring repository-derived adoption percentages._

[🔼 Back to Table of Contents](#-table-of-contents)

### 📰 Accepted Evidence

The **_Accepted Evidence rules_** define which **_repository information the engine recognizes as evidence of a technology_**.

Rather than relying on the presence of arbitrary filenames or unrelated dependencies, the **_engine evaluates specific signals_** through its **_generic rules & specialized detectors_**.

The following **_table summarizes examples of supported evidence for technologies_** currently displayed using the [Repository Adoption metric](#-repository-adoption):

|    Technology    | Recognized Evidence                                                                                                                                                                                                                               |
| :--------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|    **React**     | _Direct `react` dependency declaration_                                                                                                                                                                                                           |
|   **Next.js**    | _Direct `next` dependency declaration or dedicated configuration, such as `next.config.js` & `next.config.ts`_                                                                                                                                    |
| **React Native** | _Direct `react-native` dependency declaration_                                                                                                                                                                                                    |
|   **Electron**   | _Direct `electron` dependency declaration_                                                                                                                                                                                                        |
| **Tailwind CSS** | _Direct `tailwindcss` dependency declaration or dedicated configuration, such as `tailwind.config.js` & `tailwind.config.ts`_                                                                                                                     |
|  **Storybook**   | _Direct `storybook` or `@storybook/*` dependency declaration, or dedicated configuration such as `.storybook/main.js` & `.storybook/main.ts`_                                                                                                     |
|   **Node.js**    | _Recognized server runtime dependency; an explicit Node.js engine requirement combined with a checked-in JavaScript/TypeScript CLI implementation; or a `start`, `serve` or `server` script executing a checked-in implementation through `node`_ |
|    **NestJS**    | _Direct `@nestjs/core` dependency declaration or `nest-cli.json`_                                                                                                                                                                                 |
|    **Prisma**    | _Direct `prisma` or `@prisma/client` dependency declaration, or dedicated configuration such as `schema.prisma` & `prisma.config.ts`_                                                                                                             |
|  **PostgreSQL**  | _Recognized direct database driver, a PostgreSQL provider declared in a Prisma schema, or a supported PostgreSQL image declared in Docker Compose_                                                                                                |
|   **MongoDB**    | _Recognized direct database driver, a MongoDB provider declared in a Prisma schema, or a supported MongoDB image declared in Docker Compose_                                                                                                      |
|    **Husky**     | _Direct `husky` dependency declaration, a supported `package.json` field or checked-in Husky hook configuration_                                                                                                                                  |
|     **Jest**     | _Direct `jest` or `@jest/core` dependency declaration, a supported `package.json` field or dedicated configuration such as `jest.config.js` & `jest.config.ts`_                                                                                   |
|  **Playwright**  | _Direct `playwright`, `playwright-core` or `@playwright/test` dependency declaration, or dedicated configuration such as `playwright.config.js` & `playwright.config.ts`_                                                                         |
|   **Supabase**   | _Direct supported Supabase dependency declaration or `supabase/config.toml`_                                                                                                                                                                      |
|    **Biome**     | _Direct `@biomejs/biome` dependency declaration, `biome.json` or `biome.jsonc`_                                                                                                                                                                   |
|    **Docker**    | _Supported Dockerfile or Docker Compose configuration, such as `Dockerfile`, `Dockerfile.dev`, `compose.yaml` & `docker-compose.yml`_                                                                                                             |
|  **Turborepo**   | _Direct `turbo` dependency declaration, `turbo.json` or `turbo.jsonc`_                                                                                                                                                                            |

> 🖋️ **_N.B.:_**
>
> _The **recognized evidence is defined through two complementary mechanisms**:_
>
> |              Mechanism              | Role                                             |
> | :---------------------------------: | :----------------------------------------------- |
> | _**`config/detection-rules.json`**_ | _Defines common **declarative detection rules**_ |
> |       _**`detectors/*.ts`**_        | _Implements **specialized detection checks**_    |
>
> _**Both mechanisms** are coordinated by **`src/detect.ts`**._
>
> _The **table above summarizes recognized evidence** rather than documenting every supported configuration filename or implementation detail._

The **_recognized evidence belongs to several categories_**, each requiring a different level of inspection.

|    Evidence Category     | Information Inspected                                                                     | Examples                                                             |
| :----------------------: | :---------------------------------------------------------------------------------------- | :------------------------------------------------------------------- |
|     **Dependencies**     | _Packages declared directly inside `package.json`_                                        | `react`, `next`, `@nestjs/core`, `@playwright/test`                  |
| **Configuration Files**  | _The existence of recognized configuration files_                                         | `next.config.ts`, `playwright.config.ts`, `turbo.json`, `biome.json` |
|    **Package Fields**    | _Supported configuration properties inside `package.json`_                                | `jest`, `husky`                                                      |
| **Specialized Evidence** | _Technology-specific configurations, declared runtime behavior or supported integrations_ | `schema.prisma`, `compose.yaml`, `.husky/pre-commit`, `server.js`    |

For **_direct dependency detection_**, the engine recognizes packages declared in any of the following `package.json` fields:

- `dependencies`,
- `devDependencies`,
- `peerDependencies`,
- `optionalDependencies`.

> 🖋️ **_N.B.:_**
>
> _A retrieved `package.json` used as repository evidence must contain **valid JSON whose root value is an object**._
>
> _Malformed JSON or a non-object package manifest **stops the repository analysis** rather than being ignored, because silently discarding required manifest evidence could incorrectly lower the resulting technology-adoption statistics._

However, **_not every technology uses the same evidence requirements_**.

🗒️ **_Example:_** Consider two repositories containing different types of evidence:

```txt
                   📂 REPOSITORY A
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
       `next.config.ts`          `package.json`
              │                       │
              ▼                       ▼
       Recognized path           Direct `react`
                                  dependency
              │                       │
              ▼                       ▼
           Next.js                   React
              │                       │
              └───────────┬───────────┘
                          │
                          ▼
                  Both recognized


                   📂 REPOSITORY B
                          │
                          ▼
                   `package.json`
                          │
                          ▼
                Direct `next` dependency
                          │
                          ▼
                    Next.js recognized
                          │
                          ▼
                Node.js automatically?
                          │
                          ▼
                          ❌
              Additional runtime evidence
                      is required
```

_In **Repository A**, the engine recognizes Next.js through its configuration file & React through its declared dependency._

_In **Repository B**, the Next.js dependency is sufficient to recognize Next.js, but it does **not automatically establish Node.js adoption**. Node.js requires its own supported runtime evidence._

_This **independent evaluation** prevents the engine from assuming that recognizing one technology automatically proves the adoption of another._

_Therefore, Node.js detection distinguishes **server runtime dependencies** from development-only dependencies. A supported server framework declared exclusively in `devDependencies` does not, by itself, establish Node.js runtime evidence._

> 🖋️ **_N.B.:_**
>
> _**Lockfiles alone do not constitute adoption evidence**. A package may appear as a transitive dependency without being directly adopted by the repository._
>
> _The **presence of multiple recognized signals for the same technology does not multiply repository adoption**._
>
> _**Each repository** can **contribute only once** to a **technology's adoption count**._

[🔼 Back to Table of Contents](#-table-of-contents)

### 📒 Detection Principles

Although the **_engine supports multiple types of technology evidence_**, it follows a **_common set of principles_** to ensure **_consistent, deterministic & verifiable detection_**.

The **_detection implementation favors declarative configuration_** whenever the evidence can be expressed through ordinary dependency declarations, recognized configuration paths or supported package fields.

When **_additional interpretation is required_**, the engine uses a **_specialized TypeScript detector_** instead.

The **_decision process can be summarized_** as follows:

```txt
             New Detection Requirement
                         │
                         ▼
           Can the evidence be expressed
                   declaratively?
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
           ✅                        ❌
            │                         │
            ▼                         ▼
     Configure JSON         Implement specialized
     detection rule          TypeScript detector
            │                         │
            ▼                         ▼
           📄                        📄
 `detection-rules.json`       `detectors/*.ts`
            │                         │
            └────────────┬────────────┘
                         │
                         ▼
                        📄
                    `detect.ts`
                         │
                         ▼
                 Recognized Evidence
```

These **_mechanisms follow several detection principles_**:

1. Recognize **_explicit evidence rather than infer adoption_**

The **_engine accepts only supported evidence_** obtained from the analyzed repository.

Consequently:

- _A Next.js repository is **not automatically considered** a Node.js repository,_
- _A Next.js repository is **not automatically considered** deployed on Vercel,_
- _A lockfile does **not independently establish direct technology adoption**,_
- _A technology configured **exclusively outside GitHub may remain invisible** to the engine,_
- _An **unsupported custom integration may not be recognized**, even when the technology is actually used._

2. Inspect repository information **without executing analyzed projects**

**_Technology detection_** relies on **_checked-in file paths & selected file contents_** collected during [Repository Analysis](#-repository-analysis).

The **_engine does not_**:

- _Install the analyzed projects' dependencies,_
- _Execute their scripts,_
- _Import their application code,_
- _Inspect their complete Git history,_
- _Use recurring AI inference to determine technology adoption._

This ensures **_the same recognized evidence is evaluated through the same deterministic rules_**.

3. Preserve the **_distinction between missing evidence & missing data_**

A **_displayed `0%` for Repository Adoption_** means:

> _None of the successfully analyzed repositories contained evidence satisfying the configured detection rule._

It does **_not mean_**:

> _The developer has never used the technology._

Furthermore, **_`0%` & `No data` are different results_**.

When repositories have been successfully analyzed but none provide recognized evidence of a particular technology, the corresponding **_Repository Adoption result is `0%`_**.

When **_no repositories have been analyzed_**, the engine cannot calculate Repository Adoption & displays **_`No data`_** instead.

4. Keep **_detection rules independently testable_**

The **_engine uses synthetic test fixtures_** to verify technology detection without depending exclusively on evidence from real GitHub repositories.

These **_fixtures provide controlled examples_** that allow the tests to **_verify both recognized & rejected evidence_**.

Thus, a **_detection rule can remain implemented & tested_** even when no currently analyzed repository satisfies it.

This **_approach prevents a displayed `0%`_** from being mistaken for an **_unimplemented or untested detection rule_**.

> 🖋️ **_N.B.:_**
>
> _When **a new measurable technology needs to be supported**, its **detection mechanism, statistics definition & visual assets must be coordinated**._
>
> _Refer to the ["Engine Setup" documentation](../../scripts/tech-stats/engine-setup.md) for instructions on **adding detection rules, implementing specialized detectors, configuring statistics definitions, providing icons & validating the changes**._

[🔼 Back to Table of Contents](#-table-of-contents)

## 📊 Metrics

The **_Technology Statistics Engine_** uses **_metrics to represent the selected technologies displayed_** on the GitHub Profile.

However, **_repository evidence_** can **_quantify only certain aspects of a technical stack_**. While **_some technologies can be measured through recognized evidence_**, others **_cannot be reliably quantified_** from repository data.

To **_accommodate these differences_**, the **_engine supports 3 metric types_**, each following a different approach to calculating or displaying a technology's value:

|        Metric Type         | Description                                                                                                 |
| :------------------------: | :---------------------------------------------------------------------------------------------------------- |
|   🌐 **Language Share**    | _Measures the **proportion of relevant source-code bytes** attributed to each displayed language_           |
| 📦 **Repository Adoption** | _Measures **how frequently a technology is detected** across the analyzed repositories_                     |
|       🖋️ **Curated**       | _Represents **technologies that belong to the stack but cannot be reliably measured** from repository data_ |

The **_metric type is selected in each statistics definition file_** & **_determines how the technology's displayed value_** is produced.

> 🖋️ **_N.B.:_**
>
> _Although the **detection rules may recognize additional technologies**, **only** those **declared in the statistics definitions can appear** in the generated SVGs._

[🔼 Back to Table of Contents](#-table-of-contents)

### 🌐 Language Share

The **_Language Share metric_** measures the **_proportion of relevant source-code bytes attributed to each displayed language_**, based on data returned by **_GitHub Linguist_**.

The **_GitHub Profile currently selects the following 4 languages_** from the measurements returned by GitHub Linguist:

- _TypeScript_,
- _JavaScript_,
- _HTML_,
- _CSS_.

Rather than including every language detected by GitHub, the **_engine uses the statistics definitions_** to determine **_which languages participate in the calculation_**.

```txt
🐱 GitHub Linguist
→ Returns language bytes from analyzed repositories
          │
          ▼
📄 Statistics Definitions
→ Select the languages to measure
          │
          ▼
🌐 Language Share
→ Calculate each selected language's percentage
```

The **_percentage for each language is calculated_** as:

```txt
       bytes for the selected language
──────────────────────────────────────────── × 100
     total bytes of all selected languages
```

Only the **_selected languages contribute to the denominator_**, ensuring the percentages represent the languages displayed in the GitHub Profile rather than every language detected across the repositories.

🗒️ _**Example:** `SCSS` may be detected by GitHub Linguist without being selected for the public Language Share calculation_

```txt
                   🐱
              GitHub Linguist
          Collected language bytes
                    │
                    ▼
       ┌─────────────────────────────┐
       │ TypeScript          50,000  │
       │ JavaScript          30,000  │
       │ HTML                10,000  │
       │ CSS                 10,000  │
       │ SCSS                20,000  │
       └─────────────┬───────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
         📜                    📄
   Private Report     Statistics Definitions
          │                     │
          ▼                     ▼
    All languages       Selected languages
    are retained     `TS`, `JS`, `HTML`, `CSS`
                                │
                                ▼
                               🌐
                         Language Share
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
                 ▼                             ▼
                ✅                            ❌
             Included                       Excluded
       `TS`, `JS`, `HTML`, `CSS`              SCSS
            100,000 bytes                 20,000 bytes
                 │
                 ▼
            Public SVG
            ──────────
            TS      50%
            JS      30%
            HTML    10%
            CSS     10%
```

The **_resulting percentages_** are **_displayed with one decimal place_** & should total approximately `100%`, allowing for rounding differences.

> 🖋️ **_N.B.:_**
>
> _**GitHub Linguist data** may **lag behind recent repository changes**._
>
> _**Language Share** therefore reflects the **latest measurements returned by GitHub**, rather than a perfectly synchronized snapshot of every repository._

[🔼 Back to Table of Contents](#-table-of-contents)

### 📦 Repository Adoption

The **_Repository Adoption metric_** measures the **_percentage of analyzed repositories in which recognized evidence for a technology is found_**.

The **_engine identifies this evidence_** using **_2 complementary detection mechanisms_**:

|    Detection Mechanism    |                   Source File                   | Responsibility                                            | Examples                                                                |
| :-----------------------: | :---------------------------------------------: | :-------------------------------------------------------- | :---------------------------------------------------------------------- |
|    **Detection Rules**    | `config/detection-rules.json` + `src/detect.ts` | Describe & apply **recognizable evidence**                | _Package dependencies, technology-specific configuration files, etc..._ |
| **Specialized Detectors** |       `src/detect.ts` + `detectors/*.ts`        | Interpret **evidence requiring more detailed inspection** | _Configuration-file contents, workflow commands, etc..._                |

**_Together_**, these **_mechanisms_** allow the **_engine to determine which technologies are present in each analyzed repository_**.

The **_percentage for each technology is calculated_** as:

```txt
repositories containing recognized evidence
─────────────────────────────────────────── × 100
         all analyzed repositories
```

**_2 principles govern_** how this evidence is counted & how the resulting percentages are interpreted:

1. Regardless of how many matching packages, workspaces or configuration files it contains, **_a repository counts only once per technology_**:

```txt
Repository A
│
├── Root package.json
│   └── React dependency
│
├── Web application
│   └── React dependency
│
└── UI workspace
    └── React dependency
              │
              ▼
           Result
       React counter: 1
```

2. In addition, the **_Repository Adoption values are independent_**, meaning their **_combined total is not required to equal `100%`_**.

🗒️ **_Example:_**

```txt
Analyzed repositories
→ 10 total repositories

React detected in       7 repositories → 70%
Next.js detected in     4 repositories → 40%
Storybook detected in   3 repositories → 30%
```

_These values mean that **React evidence was found in `70%` of analyzed repositories**, **Next.js evidence in `40%`** & **Storybook evidence in `30%`**._

> 🖋️ **_N.B.:_**
>
> _The **same repository may contribute to several technologies**, which is why Repository Adoption percentages are interpreted separately rather than as parts of a shared total._

[🔼 Back to Table of Contents](#-table-of-contents)

### 🖋️ Curated Technologies

The **_Curated metric_** represents technologies that **_belong to the GitHub Profile's technical stack_** but whose **_usage cannot be meaningfully measured from repository data_**.

Unlike Language Share & Repository Adoption, **_Curated technologies_** do **_not receive calculated percentages_**.

Instead, they are **_assigned the `"curated"` metric in the statistics definitions_** & display a **_predefined label_**:

```txt
  Statistics Definition
  → metric: curated
  → label: "Curated"
            │
            ▼
          Engine
→ No percentage calculation
            │
            ▼
       Public SVG
   → Displays "Curated"
```

The **_current curated technologies_** are:

- _Figma_,
- _Git_,
- _GitHub_,
- _Vercel_.

This **_approach_** allows the **_GitHub Profile to represent technologies whose contribution cannot be reliably quantified_**, without inventing numerical measurements.

> 🖋️ **_N.B.:_**
>
> _The **Curated metric represents an intentional inclusion**, not an estimated percentage or an indication that the technology was detected in every analyzed repository._
>
> _Some Curated technologies **may have recognizable evidence** in repositories. However, detecting their presence does **not necessarily provide a meaningful measurement of their actual usage**._
>
> _The **displayed label is fully configurable** through the `label` field in the statistics definition. It can contain **any non-empty text** rather than being restricted to `"Curated"`._

[🔼 Back to Table of Contents](#-table-of-contents)

### 📭 No Data

**_One particular case_** requires additional handling: **_insufficient data to calculate a numeric metric_**.

The **_Technology Statistics Engine_** displays `No data` when a **_numeric metric cannot be calculated_** because **_no valid denominator is available_**.

This **_fallback_** applies to **_both Language Share & Repository Adoption_**:

|        Metric Type         | When `No data` Is Displayed                                                    |
| :------------------------: | :----------------------------------------------------------------------------- |
|   🌐 **Language Share**    | _When the **total number of bytes across all selected languages** is **zero**_ |
| 📦 **Repository Adoption** | _When **no repositories** were analyzed_                                       |

The **_engine_** distinguishes between **_a genuine `0%` result & an unavailable measurement_**:

```txt
                 Numeric Metric
                       │
                       ▼
               Valid denominator?
                       │
           ┌───────────┴───────────┐
           │                       │
           ▼                       ▼
          ✅                      ❌
           │                       │
           ▼                       ▼
       Calculate                Display
       percentage             `"No data"`
           │
           ▼
    Is the result 0%?
           │
   ┌───────┴────────┐
   │                │
   ▼                ▼
  ✅               ❌
   │                │
   ▼                ▼
Display          Display
`"0%"`      the calculated %
```

This **_distinction prevents the engine from displaying misleading percentages_** when the available data is insufficient to perform a meaningful calculation.

> 🖋️ **_N.B.:_**
>
> _The **Curated metric is not affected** by this fallback._
>
> _It **displays the predefined label** specified in its statistics definition rather than attempting a numerical calculation._

[🔼 Back to Table of Contents](#-table-of-contents)

## 📜 Private Analysis Report

Once the **_repository evidence has been collected, technologies detected & metrics calculated_**, the engine assembles the results into a **_private analysis report_**.

This **_report acts as the main inspection & debugging artifact_**, allowing developers to **_review the repository selection, recognized technology evidence & calculated statistics_** before publishing updated SVGs.

The **_same underlying analysis process supports both engine modes_**, but each handles the resulting report differently:

| Engine Mode  | Report Usage                                                     | Final Output                                       |
| :----------: | :--------------------------------------------------------------- | :------------------------------------------------- |
| **Analyze**  | _Generates & saves a **private JSON report** for inspection_     | _Private report **stored outside the repository**_ |
| **Generate** | _Uses the **analysis results internally to produce statistics**_ | _**Validated public SVG files**_                   |

The **_relationship between both modes can be represented_** as follows:

```txt
                        ⚙️
                  Engine Execution
                         │
                         ▼
                        🔬
                 Repository Analysis
                         │
                         ▼
                        💻
                 Technology Detection
                         │
                         ▼
                        📊
                 Metrics Calculation
                         │
                         ▼
                        📜
                Private Analysis Data
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
             🔬                    📈
       'Analyze' mode       'Generate' mode
              │                     │
              ▼                     ▼
         Build & save       Use analysis data
        private report     to render statistics
              │                     │
              ▼                     ▼
           Private              Validate
          JSON file            public SVGs
              │                     │
              ▼                     ▼
             ✏️                    📈
       Review & debug      Generated statistics
```

This **_separation_** allows **_developers to inspect the underlying analysis independently_** while ensuring that public statistics are generated from the engine's current analysis results.

[🔼 Back to Table of Contents](#-table-of-contents)

### ▶️ Analysis Execution

The **_'Analyze' mode_** provides a **_way to inspect the information collected & calculated_** by the engine **_without regenerating the public statistics_**.

During **_local execution_**, the **_engine uses the developer's existing GitHub CLI authentication_** to access public & authorized private repositories, providing a **_consistent authentication method for both engine modes_**.

From the `scripts/tech-stats/` directory, an **_analysis can be executed_** using:

```bash
pnpm run tech-stats:report
```

By default, the **_engine saves the private report_** in the following location:

```txt
🏚️ User 'Home' directory
└── 📂 tech-stats-reports/
    └── 📄 tech-stats-report.json
```

Alternatively, **_a custom report destination_** can be specified through the `--report-path` argument.

🗒️ _**Example:** Save the report in the Windows temporary directory using PowerShell:_

```powershell
pnpm run tech-stats:report --report-path "$env:TEMP\tech-stats-private-report.json"
```

The **_destination is validated_** before the report is written to ensure that **_private reports remain outside the Git repository_**.

The **_engine handles the report destination_** according to the following scenarios:

|                Situation                | Engine behavior                                      |
| :-------------------------------------: | :--------------------------------------------------- |
|     **No `--report-path` argument**     | _**Saves** the report to its **default location**_   |
|          **Valid custom path**          | _**Saves** the report to the **specified location**_ |
|  **Custom path inside the repository**  | _**Rejects** the destination with an error_          |
| **Invalid or inaccessible destination** | _**Fails** instead of silently saving elsewhere_     |

> 🖋️ **_N.B.:_**
>
> _**Changes** to repository selection, analysis settings or detection rules do **not automatically update the generated statistics**._
>
> _To apply these changes, the **'Generate' mode must be executed locally or through the GitHub Actions workflow**, either manually or at its next scheduled execution._

[🔼 Back to Table of Contents](#-table-of-contents)

### 🧐 Report Inspection

The **_private analysis report contains the information needed_** to understand:

- Which **_repositories participated in the analysis_**,
- What **_evidence was recognized_**,
- & how the **_resulting statistics were calculated_**.

Its **_contents are organized into several categories_**:

|        Report Information         | Contents                                                                                    | Purpose                                                                                       |
| :-------------------------------: | :------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------- |
|        **Report Metadata**        | _Schema version & analysis timestamp_                                                       | _Identifies the **report format** & **when** the analysis was performed_                      |
|     **Repository Selection**      | _Included & excluded repository counts, discovered repositories & exclusion reasons_        | _Explains **which repositories participated** in the analysis & **why others were excluded**_ |
| **Private Repository References** | _Identifiers of discovered private repositories_                                            | _Supports **private inspection & output-privacy validation**_                                 |
|      **Repository Evidence**      | _Per-repository language data, recognized technologies, evidence paths & detection signals_ | _Explains **which information contributed** to the analysis_                                  |
|      **Statistical Summary**      | _Aggregated language bytes, analyzed repository count & calculated metrics_                 | _Provides the **values used to generate** the Technology Statistics_                          |

🗒️ _**Example:** The **report allows a developer to trace a technology's calculated result** back to the repositories & evidence that contributed to it_

```txt
                         📜
                   Private Report
                          │
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
            🗃️                        🔬
    Repository Selection       Analysis Results
             │                         │
             ▼                         ▼
            🎛️                        📊
    Included & excluded       Language statistics
       repositories           & detected evidence
                                       │
                                       ▼
                                      🧮
                             Aggregate measurements
                                       │
                                       ▼
                                      📈
                               Calculated metrics
```

This **_traceability is particularly useful_** when a technology displays an unexpected percentage or a repository appears to be missing from the analysis.

Developers can **_review the repository-selection decisions & recognized evidence_** to determine whether the result reflects the current configuration or whether the detection rules require adjustment.

However, because the **_report may contain private repository identifiers & related evidence_**, it **_must_** be handled as a **_private development artifact_**.

The **_engine enforces a storage boundary_** by **_rejecting report destinations inside the Git repository_**, including destinations that resolve into it through symbolic links.

Additionally, **_the private report must never be_**:

- _Committed to a repository,_
- _Uploaded as a public workflow artifact,_
- _Copied into generated public SVG files,_
- _Exposed through public workflow logs._

> 🖋️ **_N.B.:_**
>
> _The **private report contains evidence references & detection signals**, not copies of every downloaded repository file._
>
> _Whenever **repository selection, analysis settings or technology detection rules are modified**, developers should run a **new analysis** to inspect the updated results._
>
> _The **'Generate' mode performs its own fresh analysis** when regenerating the public SVGs. It does not require an existing JSON report._

[🔼 Back to Table of Contents](#-table-of-contents)

## 🎨 SVG Rendering

Once the **_repository evidence has been analyzed & the resulting statistics calculated_**, the engine proceeds to **_'SVG Rendering' phase_**.

This **_phase transforms the calculated metrics into public technology-statistics SVGs_** displayed in the GitHub profile README.

The **_rendering process is separated from repository analysis_** through **_2 complementary modules_**:

|     Module      | Responsibility                                                                                                 | Main Question                                                |
| :-------------: | :------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| **`render.ts`** | _**Constructs & validates the visual representation** of each statistics section_                              | _What SVG should represent these statistics?_                |
| **`output.ts`** | _Coordinates SVG generation, checks public outputs for protected information & **writes the resulting files**_ | _How should the generated SVGs safely reach the filesystem?_ |

This **_separation_** allows the engine to maintain **_independent responsibilities for analysis, visual presentation & file persistence_**.

The **_'Generate' mode performs a new analysis_** before rendering, ensuring the resulting SVGs reflect the information collected during that execution.

[🔼 Back to Table of Contents](#-table-of-contents)

### 🖼️ Statistics Generation

The **_'Generate' mode_** coordinates the **_complete process of analyzing repositories, calculating statistics & generating public SVG files_**.

From the `scripts/tech-stats/` directory, the **_engine can be executed locally_** using:

```bash
pnpm run tech-stats
```

The **_engine_** uses the **_calculated metrics alongside 3 rendering inputs_**:

|      Rendering Input       |             Location             | Purpose                                                                                |
| :------------------------: | :------------------------------: | :------------------------------------------------------------------------------------- |
| **Statistics Definitions** |       `definitions/*.json`       | _Determine **which technologies appear** in each section & which icons represent them_ |
|   **Rendering Settings**   | `config/rendering-settings.json` | _Define the shared **layout dimensions, spacing, typography & theme colors**_          |
|    **Technology Icons**    |    `assets/tech-stats/icons/`    | _Provide the **local vector artwork** embedded inside the generated SVGs_              |

The **_complete generation process can be represented_** as follows:

```txt
                          📈
                   'Generate' mode
                           │
                           ▼
                          📊
                  Calculated Metrics
                           │
                           ▼
                          🎨
                 Statistics Rendering
                           │
               ┌───────────┼───────────┐
               │           │           │
               ▼           ▼           ▼
              📋          🎛️         🎨
          Statistics   Rendering   Technology
         Definitions   Settings      Icons
               │           │           │
               └───────────┼───────────┘
                           │
                           ▼
                          📄
                      `render.ts`
                           │
                           ▼
                   Construct each SVG
                           │
                           ▼
                      Validate SVGs
                           │
                           ▼
                          📄
                      `output.ts`
                           │
                           ▼
                   Privacy Validation
                           │
                           ▼
                   Write public SVGs
                           │
                           ▼
                          📂
             `assets/tech-stats/statistics/`
                           │
                           ▼
                  GitHub Profile README
```

For each configured statistics section, the **_renderer generates one SVG containing the corresponding technology cards_**.

Each **_card displays 3 visual elements_**:

- The **_technology icon_**,
- The **_technology name_**,
- Its **_calculated percentage or configured display label_**.

The **_generated SVGs also include accessibility information_**, such as:

- _Descriptive titles,_
- _The represented statistics,_
- _& explanations of their measurements._

Before the files are saved, the engine **_validates their structure & checks the public outputs_** for protected repository identifiers or credential material.

The **_validated SVGs are then written to the directory_** configured through `config/paths-settings.json`.

> 🖋️ **_N.B.:_**
>
> _The **'Analyze' mode produces a private report without updating public SVGs**, whereas the **'Generate' mode performs its own analysis & regenerates the statistics**._
>
> _Changes to the rendering configuration or statistics definitions do **not automatically trigger regeneration**. The **'Generate' mode must run again**, either **locally or through the GitHub Actions workflow**._

[🔼 Back to Table of Contents](#-table-of-contents)

### 📐 Layout Model

The **_SVG Layout Model ensures that every statistics section follows the same visual structure_**, regardless of the number of technologies it contains.

The **_shared rendering configuration is centralized_** in:

```txt
scripts/tech-stats/config/rendering-settings.json
```

It defines the following **_layout properties_**:

| Configuration Category |                                        Properties                                        | Purpose                                                                 |
| :--------------------: | :--------------------------------------------------------------------------------------: | :---------------------------------------------------------------------- |
|       **Canvas**       |                                      `canvasWidth`                                       | _Defines the **shared horizontal coordinate space**_                    |
|       **Cards**        |                                  `cardWidth`, `cardGap`                                  | _Controls **card dimensions & horizontal separation**_                  |
|       **Icons**        |                                        `iconSize`                                        | _Defines the **dimensions** of the **embedded technology icons**_       |
|     **Typography**     |                           `nameFontSize`, `statisticFontSize`                            | _Controls the **sizes** of technology **names & displayed statistics**_ |
|       **Pills**        |                      `pillWidth`, `pillHeight`, `pillTextBaseline`                       | _Defines the **dimensions & text positioning** of statistic **labels**_ |
|      **Spacing**       | `outerHorizontalPadding`, `outerVerticalPadding`, `iconNameGap`, `namePillGap`, `rowGap` | _Controls the **spacing between visual elements, cards & rows**_        |
|        **Rows**        |                                     `maxCardsPerRow`                                     | _Controls **how many cards a row may contain**_                         |
|       **Themes**       |                              `colors.light`, `colors.dark`                               | _Defines the **text, pill & statistic colors** for both themes_         |

The **_canvas width is defined by `canvasWidth`_** in the rendering configuration & shared across all statistics sections.

Although **_the number of rows may vary between statistics sections_**, the horizontal canvas dimensions & individual card dimensions remain consistent.

The **_renderer automatically distributes cards into rows_** according to the configured maximum row size, then **_centers each row independently_** within the shared canvas.

🗒️ _**Example:** With the current configuration, a section containing five technology cards is arranged across two rows_

```txt
       SVG Canvas: Configured Width
┌─────────────────────────────────────────┐
│                                         │
│       ┌─────┐ ┌─────┐ ┌─────┐           │
│       │  1  │ │  2  │ │  3  │           │
│       └─────┘ └─────┘ └─────┘           │
│                                         │
│           ┌─────┐ ┌─────┐               │
│           │  4  │ │  5  │               │
│           └─────┘ └─────┘               │
│                                         │
└─────────────────────────────────────────┘
```

_The **first row contains three cards**, while the **second contains two cards**._

_Because **each row is centered independently**, the **second row receives additional horizontal space** rather than stretching its two cards to fill the available width._

The **_canvas height is calculated according to the number of rows_** and their configured vertical spacing.

This **_approach maintains consistent card dimensions & visual proportions_** while accommodating statistics sections containing different numbers of technologies.

[🔼 Back to Table of Contents](#-table-of-contents)

### 🌓 Theme Adaptation

The **_engine renderer supports both light & dark color schemes_** through its **_shared rendering configuration_**.

**_Each generated SVG_** includes **_theme-specific styles_** that respond to the viewer's preferred color scheme.

Technologies may also define **_separate icon variants_** when the same artwork would not remain sufficiently visible against both themes. They can be **_defined through the statistics definitions files_**.

The **_renderer embeds the appropriate local vector artwork_** & adjusts its visibility according to the active theme.

These **_variations_** do **_not change the SVG's layout or dimensions_**.

> 🖋️ **_N.B.:_**
>
> _The SVG **`viewBox` defines the internal coordinate system**, while the README's **`<img width="...">` determines its displayed width**._
>
> _Changing the README image width **scales the entire SVG proportionally** without modifying its internal layout._
>
> _The renderer **rejects configurations whose cards cannot fit within the configured canvas**, rather than silently stretching or distorting them._

[🔼 Back to Table of Contents](#-table-of-contents)

## 🛡️ Security

Although the **_Technology Statistics Engine generates public statistics_**, it handles **_information that is not necessarily intended for publication_**.

During its execution, the **_engine may access private repository information, authentication credentials & source files_** that could **_contain personal or otherwise sensitive data_**.

Consequently, **_security measures are necessary_** to protect this information throughout the process, from **_repository access & evidence collection to the publication of generated statistics_**.

To **_address these requirements_**, the **_engine establishes clear boundaries between private analysis & public publication_**, reducing the risk of inadvertently exposing sensitive repository information or authentication credentials through its generated outputs.

The **_security model establishes 3 distinct responsibilities_**:

|      Responsibility       | Purpose                                                                                                         |
| :-----------------------: | :-------------------------------------------------------------------------------------------------------------- |
|   **Repository Access**   | _**Access only the repositories authorized** by the analysis credentials_                                       |
| **Private Configuration** | _**Control repository selection** without requiring private identifiers to be committed publicly_               |
|  **Public Publication**   | _**Publish validated aggregate statistics** without exposing repository-level evidence or analysis credentials_ |

These **_responsibilities are enforced_** through **_credential separation, private report restrictions & public output validation_**.

[🔼 Back to Table of Contents](#-table-of-contents)

### 🕶️ Privacy & Credential Boundaries

To produce **_representative technology statistics_**, the engine allows **_authorized private repositories to contribute to aggregate measurements_** alongside public repositories.

However, analyzing these repositories requires access to **_information that must remain confidential_**, including repository identities & individual technology evidence.

To preserve this confidentiality, the **_engine establishes a clear boundary between the information required for analysis & the information permitted for publication_**.

During analysis, the **_engine collects repository information, detects supported technologies & calculates aggregate measurements_**. **_Public rendering uses the resulting aggregate measurements & configured public labels_**, while repository-level evidence & analysis credentials remain protected.

This **_separation establishes a boundary between private analysis & public output_**:

```txt
                          🕶️
                    Private Analysis
                           │
                           ▼
                   Repository Access
                           │
                           ▼
                  Repository Selection
                           │
                           ▼
                          🔬
                       Analysis
                           │
                      File paths
                & selected file contents
                           │
                           ▼
                  Technology Detection
                           │
                           ▼
                          🧮
                        Metrics
                           │
                           ▼
                  Aggregate Statistics
                           │
                           ▼
                          🎨
                       Rendering
                           │
                           ▼
                          🖼️
                     Generated SVGs
                           │
                           ▼
                          🛡️
                       Validation
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
             ✅                        ❌
              │                         │
              ▼                         ▼
      Accept public SVGs        Reject generation
              │
              ▼
     ══════════════════════════════════════════════
                  🔐 PRIVACY BOUNDARY
     ══════════════════════════════════════════════
              │
              ▼
             📤
        Public Output
              │
              ▼
  Generated statistics files
              │
              ▼
    GitHub Profile README
```

Since **_repository analysis may involve confidential information_**, the engine processes downloaded repository file contents **_in memory_** rather than saving copies of the inspected source files.

However, **_developers still need a way to inspect the collected evidence & verify the resulting calculations_**. For this purpose, the **_engine can produce a private analysis report_** containing repository identifiers, evidence references & calculated measurements.

Because this report may contain sensitive information, its **_persistent storage is restricted to destinations outside the Git repository_** during local execution.

**_Public SVGs_**, on the other hand, serve a different purpose: displaying **_aggregate statistics without exposing the underlying repository-level information_**.

To maintain this distinction, the **_engine separates information permitted for public presentation from information that must remain protected_**:

| Permitted Public Information                          | Protected Information                            |
| :---------------------------------------------------- | :----------------------------------------------- |
| _Public technology names & definitions_               | _Private repository names & URLs_                |
| _Aggregate language & technology statistics_          | _Individual repository measurements_             |
| _Public technology icons_                             | _Private repository evidence & file paths_       |
| _Public visual settings & accessibility descriptions_ | _Authentication credentials_                     |
| _Public icon attribution information_                 | _Private analysis reports & selection overrides_ |

To **_enforce this separation_**, the engine performs **_structural validation & privacy checks_** before writing the generated SVGs.

These checks examine both **_the generated SVGs & relevant public resources_** for protected repository identifiers or credential material, including:

- _Configuration files,_
- _Statistics definitions & icons._

If such information is detected, the **_engine rejects generation_** rather than accepting an output that could expose confidential data.

Nevertheless, **_privacy validation has its own limitations_**. The engine can check the protected identifiers & credential values known to it, but it cannot establish that arbitrary text contains no confidential information.

Furthermore, **_a detected match does not necessarily indicate an actual privacy leak_**.

🗒️ _**Example:** Consider a private repository whose name matches that of a publicly displayed technology._

```txt
  🔐 Private Repository        🎨 Public Technology
     `username/react`                  React
            │                            │
            ▼                            ▼
      Protected name                Public label
         `react`                      `React`
            │                            │
            └────────────┬───────────────┘
                         ▼
                   ⚠️ Name Match
                         │
                         ▼
               ❌ Generation Rejected
                         │
                         ▼
                   Manual Review
```

_In this situation, the **legitimate public technology label could also match a protected repository identifier**, causing the engine to reject generation even though the label itself is harmless._

Rather than attempting to resolve this ambiguity automatically, the **_engine applies conservative validation_**, requiring manual review before the conflicting information can be safely handled.

> 🖋️ **_N.B.:_**
>
> _**Private repository-selection overrides must never be serialized into public files**._
>
> _The engine **intentionally favors a failed generation over publishing output that matches known protected information**._
>
> _**Persistent private reports** are also **disabled during GitHub Actions execution**, preventing the automated workflow from producing a private report file._

[🔼 Back to Table of Contents](#-table-of-contents)

### 🔑 Authentication & Secrets Setup

The **_Technology Statistics Engine requires authenticated GitHub access_** to retrieve repository information, particularly when private repositories are included in the analysis.

However, **_the authentication mechanism depends on the execution environment_**, allowing the engine to use an **_appropriate credential-management approach in each situation_**.

During **_local execution_**, **_both engine modes reuse the developer's existing GitHub CLI authentication_**, providing access to repositories already authorized through their GitHub account.

In **_GitHub Actions_**, where execution is automated, the **_engine instead requires a dedicated analysis credential_** supplied securely through a repository secret.

To maintain **_a clear separation between repository access & public publication_**, the **_workflow_** uses this **_dedicated credential exclusively for analysis_**, while the **token** automatically provided by GitHub handles **_publication operations_**.

The **_authentication flow can be represented_** as follows:

```txt
                         ⚙️
                   Engine Execution
                          │
                          ▼
                Execution Environment
                          │
             ┌────────────┴─────────────────┐
             │                              │
             ▼                              ▼
            💻                             ☁️
           Local                      GitHub Actions
             │                              │
             ▼                              ▼
         GitHub CLI                  `TECH_STATS_TOKEN`
             │                              │
             ▼                              ▼
          Existing                      Dedicated
        GitHub login                 analysis token
             │                              │
             ▼                              ▼
            🐱                             🐱
         GitHub API                     GitHub API
             │                              │
             ▼                              ▼
            🔬                             🔬
        Repository                     Repository
         Analysis                       Analysis
             │                              │
      ┌──────┴──────┐                       ▼
      │             │                      📈
      ▼             ▼                'Generate' mode
     🔬            📈                      │
   'Analyze'   'Generate'                   ▼
     mode         mode                     🖼️
      │             │                  Public SVGs
      │             │                       │
      ▼             ▼                       │
     📜            🖼️                      ▼
  Private        Public             ──────────────────
JSON report       SVGs                GitHub Workflow
  outside                             `GITHUB_TOKEN`
repository                                  │
                                            ▼
                                      Publish changes
```

For **_automated execution_**, the **_GitHub Actions workflow_** distinguishes **_3 configuration values with different responsibilities_**:

|             Value             | Provision                                      | Responsibility                                                          |
| :---------------------------: | :--------------------------------------------- | :---------------------------------------------------------------------- |
|      **`GITHUB_TOKEN`**       | _**Automatically provided** by GitHub Actions_ | _**Publishes** generated changes **to the current profile repository**_ |
|    **`TECH_STATS_TOKEN`**     | _**Required** GitHub repository secret_        | _Provides **read access to repositories** authorized for analysis_      |
| **`TECH_STATS_REPOSITORIES`** | _**Optional** GitHub repository secret_        | _Provides private repository-selection **overrides**_                   |

Although **_all three values are used within the workflow_**, each serves **_a distinct purpose_**.

To prevent repository-analysis credentials from being unnecessarily exposed during publication, the engine **_separates these responsibilities_** into **_publication, repository access & private selection_**.

1. `GITHUB_TOKEN` — **_Public Publication_**

Once the engine has **_generated & validated the public statistics_**, the workflow **_needs permission to publish the resulting changes_**.

For this purpose, **_GitHub Actions automatically provides_** `GITHUB_TOKEN`, which handles publication operations involving the current profile repository.

These **_operations include_**:

- _Pushing generated statistics updates,_
- _Creating or updating the corresponding pull request,_
- _Squash-merging the accepted changes._

To authorize these operations, the **_workflow explicitly requests the necessary repository permissions_**.

However, **_publication permissions are separate from repository-analysis permissions_**. The engine therefore uses a **_different credential to retrieve the information required_** to calculate its statistics.

> 🖋️ **_N.B.:_**
>
> _`GITHUB_TOKEN` is **not used as the engine's repository-analysis credential**._

2. `TECH_STATS_TOKEN` — **_Repository Analysis_**

Unlike the publication token, `TECH_STATS_TOKEN` is dedicated to **_retrieving repository information for analysis_**.

Because **_this operation may involve private repositories_**, the **_token must provide access to the repositories_** the engine is authorized to inspect, without granting unnecessary modification permissions.

When using a **_fine-grained personal access token_**, its **_repository access & permissions should be configured_** as follows:

|        Setting        |        Configuration        | Why                                                                                   |
| :-------------------: | :-------------------------: | :------------------------------------------------------------------------------------ |
| **Repository Access** | **_Selected repositories_** | _**Restricts access** to the repositories the token is authorized to analyze_         |
|     **Contents**      |       **_Read-only_**       | _Allows the engine to **inspect repository file trees & retrieve evidence files**_    |
|     **Metadata**      |       **_Read-only_**       | _Allows the engine to **discover accessible repositories & retrieve their metadata**_ |

These **_permissions allow the engine to discover repositories & inspect their evidence_** without granting the token permission to modify them.

During **_GitHub Actions execution_**, the engine **_requires this dedicated credential to retrieve repository information through the GitHub API_**, even when only public repositories have been selected for analysis.

This **_requirement preserves the separation between analysis & publication_**, ensuring that neither operation depends on the other's credentials.

> 🖋️ **_N.B.:_**
>
> _The **analysis process does not fall back to the workflow's publication credentials** if `TECH_STATS_TOKEN` is missing._

3. `TECH_STATS_REPOSITORIES` — **_Private Selection_**

Although `TECH_STATS_TOKEN` **_determines which repositories the engine can access_**, access alone does **_not determine which repositories should contribute to the statistics_**.

That decision belongs to **_repository selection_**, which normally relies on the public repository configuration & the engine's built-in eligibility rules.

However, **_developers may want to include or exclude private repositories_** without exposing their names in publicly committed configuration files.

For this purpose, the **_engine supports_** `TECH_STATS_REPOSITORIES`, an **_optional JSON configuration value_** that overrides the public repository include & exclude lists.

Unlike the two preceding values, it is **_not an authentication credential_**. It **_controls repository selection_** rather than granting repository access.

🗒️ **_Example:_**

```json
{
  "include": ["username/public-project", "username/private-project"],
  "exclude": ["username/old-project"]
}
```

_With this configuration, the **engine applies the private selection overrides** to determine which repositories should participate in the analysis._

However, **_declaring a repository does not automatically make it accessible_**. The analysis credential must already possess the necessary permissions.

Furthermore, the **_override does not bypass the engine's built-in eligibility rules_**. Repositories that fail those checks remain excluded, regardless of their presence in the inclusion list.

This establishes **_two independent conditions for repository analysis_**: the engine **_must_** be authorized to access the repository, and the repository **_must_** satisfy the applicable selection rules.

> 🖋️ **_N.B.:_**
>
> _For further details on **how private overrides interact with public configuration & eligibility rules**, refer to ['🔐 Private Selection Overrides' section ](#-private-selection-overrides)._

[🔼 Back to Table of Contents](#-table-of-contents)

### 🧱 Secret Configuration Boundaries

Although **_the workflow uses GitHub secrets to protect its credentials & private configuration_**, storing these values does **_not automatically make them available to the engine_**.

To understand how the engine receives them, it is important to distinguish between **_where sensitive values are stored & how they are supplied during execution_**.

**_GitHub provides several mechanisms_** for managing this process:

|        Mechanism         | Description                                                                         |
| :----------------------: | :---------------------------------------------------------------------------------- |
|  **Repository Secret**   | _A secret stored in the **GitHub repository's Actions settings**_                   |
|  **Environment Secret**  | _A secret associated with a **specifically configured GitHub Actions environment**_ |
| **Environment Variable** | _A named value made available to a **running process**_                             |

For the **_current Technology Statistics workflow_**, **_repository secrets_** are used to **_store the dedicated analysis credential & optional private selection configuration_**.

When the workflow executes the engine, it **_explicitly maps these secrets to environment variables_**, allowing the engine to retrieve their values without embedding them directly in its source code.

The **_configuration flow can be represented_** as follows:

```txt
                          🔐
               GitHub Repository Secrets
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
      `TECH_STATS_TOKEN`    `TECH_STATS_REPOSITORIES`
              │                         │
              ▼                         ▼
          REQUIRED                   Optional
              │                         │
              └────────────┬────────────┘
                           │
                           ▼
                          ⚙️
                   Workflow Execution
                           │
                           ▼
                  Environment Variables
                           │
                           ▼
                          📈
                   Statistics Engine
```

However, **_local development_** does **_not require GitHub Actions to provide these values_**.

Instead, the **_engine reuses the developer's existing GitHub CLI authentication_** to access authorized repositories. When **_private repository-selection overrides are needed_**, they can be supplied through an **_optional Git-ignored `.env` file_**.

This allows **_both execution environments to support private repository selection_** while using their respective authentication & configuration mechanisms.

> 🖋️ **_N.B.:_**
>
> _The **current workflow uses repository secrets**, not GitHub environment secrets. Both are storage mechanisms and **must be explicitly made available** to the appropriate execution environment._
>
> _The `.env` **file is used only for optional local repository-selection overrides**. GitHub Actions does not load it and **local authentication relies on the existing GitHub CLI login**._
>
> _Refer to the **[Engine Setup documentation](../../scripts/tech-stats/engine-setup.md) for practical instructions** on GitHub CLI authentication, secret creation, required permissions & workflow configuration._

[🔼 Back to Table of Contents](#-table-of-contents)

## ✅ Validation & Tests

Although the **_Technology Statistics Engine relies on deterministic rules & controlled processing_**, modifications to its configuration or implementation may still introduce **_incorrect calculations, unexpected detection behavior or unsafe outputs_**.

To **_identify these problems before publishing_** updated statistics, the **_engine combines automated tests with practical validation_**.

While the **_test suite uses controlled fixtures to verify expected behavior & failure scenarios_**, **_practical validation_** examines **_how the engine behaves when analyzing actual GitHub repositories_**.

These **_complementary approaches form a validation process_** involving several methods:

|     Validation Method     | Purpose                                                                                              |
| :-----------------------: | :--------------------------------------------------------------------------------------------------- |
| **TypeScript Validation** | _Checks the engine's **type correctness**_                                                           |
|    **Automated Tests**    | _Verify **expected behavior, calculations & security constraints** using controlled test scenarios_  |
|     **Live Analysis**     | _Collects **actual repository evidence** using the current configuration & authorized GitHub access_ |
|   **Output Inspection**   | _Verifies that the **resulting statistics & generated SVGs** match the intended changes_             |

Together, these methods allow **_developers to verify both the engine's expected behavior & the results produced from real repository evidence_**.

However, because **_successful execution does not necessarily imply correct statistics_**, the underlying evidence & calculated measurements **_must_** also remain understandable through the [Private Analysis Report](#-private-analysis-report).

[🔼 Back to Table of Contents](#-table-of-contents)

### 🧪 Test Coverage

The **_automated test suite provides the first line of validation_** by checking the engine's principal responsibilities independently of live repository data.

To achieve this, it uses **_controlled fixtures that reproduce expected operations, rejected inputs & failure scenarios_**, allowing developers to identify regressions without relying on the current state of their GitHub repositories.

The **_test coverage is organized into the following areas_**:

|          Test Category          | Verified Behavior                                                                                                               |
| :-----------------------------: | :------------------------------------------------------------------------------------------------------------------------------ |
|    **Repository Selection**     | _Inclusion & exclusion rules, authorized public/private repository discovery & repository eligibility_                          |
|     **Evidence Collection**     | _Ignored paths, symbolic links, empty repositories, oversized evidence, unsupported file formats & truncated Git-tree recovery_ |
|    **Technology Detection**     | _Direct dependencies, nested manifests, specialized detection, unsupported evidence & invalid package-manifest rejection_       |
|           **Metrics**           | _Language Share calculations, Repository Adoption denominators, empty datasets & invalid language-byte rejection_               |
|       **Private Reports**       | _Report construction, external storage, repository-internal destination rejection & GitHub Actions persistence restrictions_    |
|        **SVG Rendering**        | _Deterministic output, card distribution, row centering, canvas boundaries, icon handling & SVG validation_                     |
| **Configuration & Definitions** | _JSON input handling, configuration validation, private overrides, definition-schema enforcement & identifier uniqueness_       |
|       **CLI & Utilities**       | _Engine-mode & argument parsing, shared JSON reading & malformed-input rejection_                                               |
|           **Privacy**           | _Protected repository identifiers, credential material & permitted public content_                                              |
|       **GitHub Actions**        | _Scheduling rules, manual triggers, installation, validation order, credential separation & publication workflow configuration_ |

By controlling the test inputs, **_developers can verify situations that may be difficult to reproduce_** through live analysis.

🗒️ _**Example:** Consider a technology whose detection rule is implemented but whose adoption currently displays `0%`._

```txt
                           🧪
                     React Detection
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
       Synthetic Fixture          Live Repositories
              │                           │
              ▼                           ▼
        `package.json`            3 analyzed repos
       declares `react`           No React evidence
              │                           │
              ▼                           ▼
             ✅                          📊
        Detection Test                Adoption
            PASSED                      0 / 3
              │                           │
              └─────────────┬─────────────┘
                            │
                            ▼
                           ✅
                     Valid Results
                   Rule works ≠ Usage
```

A **_synthetic fixture can declare the required dependency or configuration file_**, allowing the test suite to confirm that the engine recognizes the technology **_even when none of the analyzed repositories currently provides matching evidence_**.

The **_same approach supports negative & failure scenarios_**, where fixtures deliberately provide incomplete, unsupported or unsafe information to verify that the engine rejects it appropriately.

Consequently, **_automated tests verify the behavior of individual mechanisms_** without depending on whether the current repository selection happens to exercise every supported scenario.

However, **_controlled scenarios cannot reproduce every condition encountered during an actual execution_**. In particular, the **_GitHub Actions tests verify the workflow's configuration & expected execution logic_**, but they **_cannot independently establish that the configured credentials have the necessary permissions_** or that remote publication will succeed.

This is why **_automated testing must be complemented by practical validation_** using the engine's actual execution environment.

> 🖋️ **_N.B.:_**
>
> _A **technology displaying `0%`** may still have an **implemented & tested detection rule**. Current repository adoption & detection-rule test coverage represent different measurements._
>
> _The **automated tests verify controlled scenarios**, whereas **live analysis verifies behavior against the repositories currently accessible to the engine**._

[🔼 Back to Table of Contents](#-table-of-contents)

### 🔄 Validation Sequence

Because **_automated tests cannot establish the correctness of every real-world result_**, **_developers_** should follow a **_complete validation sequence_** when modifying the engine's implementation or configuration.

This **_process begins_** with **_static validation & automated testing_**, before progressing to **_live repository analysis & inspection of the generated statistics_**.

From the `scripts/tech-stats/` directory, **_developers can execute the first 2 checks_** using the following **_commands in their terminal_**:

```bash
pnpm run typecheck
pnpm run test
```

Once these **_checks succeed_**, **_developers can use the 'Analyze' mode_** to **_verify the engine's behavior_** against their currently authorized repositories without modifying the public statistics.

To **_generate the private report_**, execute:

```bash
pnpm run tech-stats:report
```

The **_resulting report should then be inspected_** to confirm that repository selection, recognized evidence & calculated measurements reflect the intended changes.

If the **_analysis results are consistent with expectations_**, **_developers_** can proceed to **_regenerate the public statistics_** by executing the **_'Generate' mode_**:

```bash
pnpm run tech-stats
```

Since **_this mode performs its own analysis_**, the **_resulting SVGs reflect the repository evidence collected_** during the **_generation execution_** rather than reading the previously saved private report.

Finally, **_the generated SVGs should be inspected_** to ensure that their displayed values, technology cards, layouts & theme variants remain consistent with the expected results.

The **_complete validation sequence can be represented_** as follows:

```txt
                    👤
              Modify the Engine
                     │
                     ▼
                    ✅
           TypeScript Validation
                     │
                     ▼
                    🧪
              Automated Tests
                     │
                     ▼
                    🔬
               Live Analysis
                     │
                     ▼
                    👤
           Review Private Report
                     │
                     ▼
                    📈
          Public SVG Regeneration
                     │
                     ▼
                    👤
            Inspect SVG Outputs
                     │
                     ▼
                    👤
              Accept Changes

* 👤: Developer's actions
```

Each **_stage establishes a validation checkpoint_** before developers proceed to the next one:

|           Stage           | Expected Result                                                                                                     |
| :-----------------------: | :------------------------------------------------------------------------------------------------------------------ |
| **TypeScript Validation** | _The engine **passes its type checks**_                                                                             |
|    **Automated Tests**    | _The **supported behavior & failure scenarios pass** their tests_                                                   |
|     **Live Analysis**     | _The engine **successfully analyzes the currently authorized repositories**_                                        |
| **Private Report Review** | _The repository selection, collected evidence & calculated statistics are **consistent** with the intended changes_ |
|   **SVG Regeneration**    | _The engine **successfully generates & validates the public statistics**_                                           |
|   **Output Inspection**   | _The **generated SVGs display the expected technologies**, values, layout & theme variants_                         |

Although **_this sequence focuses primarily on the engine_**, **_modifications to its GitHub Actions workflow_** may **_require additional verification_**.

When **_workflow behavior changes_**, **_developers_** should **_review the corresponding automated tests_** & perform an **_authorized manual workflow execution_** when appropriate.

Such an execution provides an opportunity to **_verify the actual GitHub environment, configured permissions & publication process_**.

> 🖋️ **_N.B.:_**
>
> _**Successful SVG generation alone** does **not establish the correctness of the underlying evidence or calculated statistics**. **Unexpected results** should **be investigated through the private report** before accepting the generated changes._
>
> _During **automated execution**, the **GitHub Actions workflow** performs **TypeScript validation & automated testing** before live statistics generation. **Publication** proceeds **only** when the **required checks succeed & the generated statistics have changed**._
>
> _Refer to the **[Engine Setup documentation](../../scripts/tech-stats/engine-setup.md)** for instructions on executing the engine, manually triggering the workflow & verifying its results._

[🔼 Back to Table of Contents](#-table-of-contents)

## ⚠️ Engine Limits

Although the **_validation process verifies that the Technology Statistics Engine behaves according to its established rules_**, **_successful validation cannot eliminate every limitation_** associated with the repository data being analyzed.

The **_engine relies on information retrieved_** from GitHub & evidence recognized through its supported detection rules. This **_approach prioritizes deterministic calculations, auditable results & privacy-conscious processing_**, but it also **_establishes boundaries on what the engine can detect & measure_**.

Consequently, the **_resulting statistics represent recognized evidence_** from the selected repositories **_rather than an exhaustive record_** of technology usage **_or a definitive assessment of developer proficiency_**.

To understand how these boundaries affect the resulting statistics, it is **_important to distinguish between limitations_** that influence how results should be interpreted **_& conditions_** that prevent reliable analysis.

The **_engine's known limitations_** fall into several categories:

|          Category          | Limitation                                                                                                         | Possible Consequence                                                       |
| :------------------------: | :----------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- |
|      **GitHub Data**       | _GitHub Linguist measurements may lag recent repository changes_                                                   | _Language statistics may not immediately reflect the latest commits_       |
|    **Data Consistency**    | _Repository discovery, file inspection & language measurements are performed through separate GitHub API requests_ | _The collected information does not represent a perfectly atomic snapshot_ |
|   **Detection Coverage**   | _Technology detection recognizes only supported evidence_                                                          | _Custom integrations or unsupported configurations may remain undetected_  |
| **External Configuration** | _Some technologies may be configured exclusively outside their GitHub repositories_                                | _Actual usage or deployment may remain invisible to the engine_            |
|    **Runtime Evidence**    | _Generated entry points or unsupported execution patterns may not satisfy the detection rules_                     | _Technologies may remain unrecognized despite being used_                  |
|   **Privacy Validation**   | _Legitimate public information may match a protected private repository identifier_                                | _Generation may be rejected until the collision is investigated_           |

These **_limitations arise from both_** the availability of GitHub data & the engine's intentionally conservative, evidence-based design.

In particular, **_technology detection favors recognized evidence over assumptions_**. Consequently, a technology may be used within a project without satisfying its configured detection rule.

> 🖋️ **_N.B.:_**
>
> _The **engine** does **not execute analyzed projects or inspect their actual production environments** to compensate for missing evidence._

[🔼 Back to Table of Contents](#-table-of-contents)

### 🛑 Analysis Failure Boundaries

Beyond the limitations that affect how statistics should be interpreted, **_certain conditions prevent the engine from completing_** a sufficiently reliable analysis or exceed its established evidence limits.

Rather than continuing with potentially incomplete information, the **_engine rejects the execution_**.

The following **_table illustrates situations that can trigger these failures_**:

|         Failure          | Engine Behavior                                                                                                        |
| :----------------------: | :--------------------------------------------------------------------------------------------------------------------- |
|  **GitHub API Failure**  | _**Rejects analysis** when required repository information cannot be retrieved_                                        |
|   **Invalid Manifest**   | _**Rejects analysis** when a required package manifest contains malformed JSON or its root value is not a JSON object_ |
|   **Evidence Limits**    | _**Rejects analysis** when the configured file-count or individual file-size limits are exceeded_                      |
| **Unsupported Evidence** | _**Rejects analysis** when required file contents are returned in an unsupported format_                               |
| **Incomplete Git Tree**  | _**Attempts to recover** truncated repository trees & **rejects analysis** when complete traversal cannot be achieved_ |

The **_engine deliberately distinguishes recognized absence from incomplete analysis_**.

A **_repository containing no recognized technology evidence_** can **_still contribute to the calculated statistics_**. However, a **_repository whose required evidence cannot be collected reliably_** must **_not be silently treated_** as having no recognized technologies.

This **_fail-closed behavior prevents incomplete evidence from producing_** apparently complete statistics.

> 🖋️ **_N.B.:_**
>
> _**Incomplete statistics should fail visibly** rather than appear complete while relying on incomplete evidence._
>
> _A **failed execution** does **not automatically remove previously generated SVGs**. Existing statistics may therefore remain visible until a subsequent generation succeeds._

[🔼 Back to Table of Contents](#-table-of-contents)

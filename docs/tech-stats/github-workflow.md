# 📋 GitHub Workflow

This **_document_** explains in detail **_how the GitHub workflow responsible for Technology Statistics operates_**.

## 📑 Table of Contents

- [🎯 Workflow Purpose](#-workflow-purpose)
- [🧭 Workflow Overview](#-workflow-overview)
- [⏰ Execution Decision](#-execution-decision)
- [📥 Stable Starting State](#-stable-starting-state)
- [✅ System Validation](#-system-validation)
- [⚙️ Statistics Regeneration](#️-statistics-regeneration)
- [📦 Statistics Change Persistence](#-statistics-change-persistence)
- [📬 Pull Request Management](#-pull-request-management)
- [📜 Statistics Refresh Integration](#-statistics-refresh-integration)
- [♻️ Periodic Branch Realignment](#️-periodic-branch-realignment)
- [🛑 Failure & Recovery Behavior](#-failure--recovery-behavior)
- [🧪 Workflow Test Suite](#-workflow-test-suite)

## 🎯 Workflow Purpose

The **_Technology Statistics workflow automates the execution & publication cycle of the [Technology Statistics Engine](./engine-mechanism.md)_**.

While the **_engine determines what statistics should be generated_**, the **_workflow_** is responsible for deciding **_when the engine runs & how changed statistics are integrated into the repository_**.

Its **_responsibilities_** include:

1. Determining **_whether a triggered execution should continue_**,
2. **_Loading the latest accepted base branch state_**,
3. **_Preparing the Technology Statistics runtime & locked dependencies_**,
4. **_Validating the Technology Statistics system through TypeScript typechecking & its automated tests_**,
5. **_Running the engine_** against the current repository evidence,
6. Detecting **_whether generated statistics changed_**,
7. **_Persisting changes_** on the periodic update branch,
8. **_Opening or refreshing the pull request_** carrying those changes,
9. **_Squash-merging_** the accepted refresh into the base branch,
10. **_Realigning the periodic branch_** for the next execution.

[🔼 Back to the Table of Contents](#-table-of-contents)

## 🧭 Workflow Overview

The **_Technology Statistics workflow_** follows a **_controlled sequence from execution authorization to statistics publication & branch cleanup_**.

The following **_schema represents the complete lifecycle of a workflow run_**:

```txt
Workflow triggered
       │
       ▼
Manual run or scheduled run?
       │
       ├── Manual ─────────────────────────┐
       │                                   │
       └── Scheduled                       │
             │                             │
             ▼                             │
       Even ISO week?                      │
        │       │                          │
       ❌      ✅                         │
        │       │                          │
      Finish    └──────────────────────────┘
                    │
                    ▼
           Check out base branch
                    │
                    ▼
              Set up Node.js
                    │
                    ▼
        Install locked dependencies
                    │
                    ▼
         Run TypeScript validation
                    │
                    ▼
        Run Engine & Workflow tests
                    │
                    ▼
      Run Technology Statistics Engine
                    │
                    ▼
           Generated SVGs changed?
                │           │
               ❌          ✅
                │           │
             Finish         ▼
                     Create temporary
                      Update commit
                            │
                            ▼
                   Push periodic branch
                            │
                            ▼
                    Create / Refresh PR
                            │
                            ▼
              Squash-merge PR into base branch
                            │
                            ▼
                    Base branch updated
                            │
                            ▼
                 Realign periodic branch
                     with base branch
                            │
                            ▼
                         Finish
```

The **_workflow structure also uses stable identifiers_**, so each level of the automation has a clear role:

```txt
Workflow name
→ identifies the system

Job ID
→ identifies the major workflow operation

Step ID
→ identifies the responsibility inside that job

Output ID
→ identifies the value produced by that responsibility
```

This **_separation keeps the workflow readable_** while allowing later steps & tests to reference stable responsibilities instead of relying on human-facing step names.

[🔼 Back to the Table of Contents](#-table-of-contents)

## ⏰ Execution Decision

The **_execution decision_** determines **_whether a triggered workflow run_** should **_continue into the Technology Statistics process or stop immediately_**.

The **_workflow_** currently supports **_two execution paths_**:

|  Execution Path   | Behavior                                                          |
| :---------------: | :---------------------------------------------------------------- |
|  **Manual run**   | _**Always** continues **immediately**_                            |
| **Scheduled run** | _Continues **only** when the **current ISO week number is even**_ |

The **_workflow_** is configured with a **_scheduled trigger every Sunday at 22:00 UTC_**:

```yaml
schedule:
  - cron: "0 22 * * 0"
```

This **_weekly schedule only determines when GitHub Actions may start a scheduled workflow run_**. It does **_not mean that every scheduled run is authorized to execute the Technology Statistics process_**.

Once triggered, the **_GitHub Actions workflow_** uses **_Node.js_** to decide **_whether the remaining steps are authorized to run_**:

| Current ISO Week | Execution Check Result | Subsequent Workflow Steps |
| :--------------: | :--------------------: | :-----------------------: |
|     **Odd**      | ❌ _Execution Denied_  |       **_Skipped_**       |
|     **Even**     | ✅ _Execution Allowed_ |  **_Continue normally_**  |

However, **_manual runs bypass this restriction_** & therefore **_always continue the workflow execution_**.

The following **_schema_** separates the **_trigger cadence_** from the **_internal execution authorization_**:

```txt
Workflow Cadence
├── WHEN GitHub Actions may trigger it
│   ├── manual
│   └── Sunday 22:00 UTC
│
└── WHETHER a triggered run proceeds
    ├── manual → always
    └── scheduled → even ISO weeks only
```

The following **_schema represents the resulting execution decision_**:

```txt
Workflow triggered
       │
       ▼
What triggered the workflow?
       │
       ├── Manual run
       │      │
       │      └───────────────► ✅
       │
       └── Scheduled run
                │
                ▼
         Current ISO week
            │       │
           Odd     Even
            │       │
            ▼       ▼
           ❌      ✅
```

This **_separation_** keeps the **_schedule itself simple_** while allowing the workflow **_to control its approximately biweekly execution logic internally_**.

> 🖋️ **_N.B.:_**
>
> _The **scheduled execution** is **approximately biweekly rather than strictly every 14 days** because it relies on even-numbered ISO weeks._
>
> _When **an ISO year contains a week 53**, **both week 53 & week 1** of the following year are **odd**, so the **cadence guard denies two consecutive scheduled runs**:_
>
> ```txt
>      Week 52 ✅
> (e.g., Dec 27, 2026)
>          │
>        7 days
>          ▼
>      Week 53 ❌
>  (e.g., Jan 3, 2027)
>          │
>        7 days
>          ▼
>      Week 1 ❌
> (e.g., Jan 10, 2027)
>          │
>        7 days
>          ▼
>      Week 2 ✅
> (e.g., Jan 17, 2027)
> ```
>
> _The **next authorized scheduled run** therefore occurs in week 2, **21 days after the successful week 52 execution**._
>
> _This **behavior does not prevent a refresh from being executed manually** during that interval._

[🔼 Back to the Table of Contents](#-table-of-contents)

## 📥 Stable Starting State

Once a **_workflow run is authorized to continue_**, the **_next steps_** prepare a **_stable & reproducible starting state_** before executing any validation or live Technology Statistics logic.

This **_preparation ensures_** that the workflow:

1. Starts from the **_latest accepted state of the base branch_**,
2. Uses **_Node.js 22 as the engine runtime baseline_**,
3. Uses **_`pnpm` 12.4.2 as the package-manager baseline_**,
4. Installs the **_engine dependencies exactly from the committed lockfile_**.

The **_workflow first checks out the branch defined by_** `BASE_BRANCH`, which currently points to:

```txt
master
```

Then, the workflow **_configures Node.js 22_**, as the **_runtime baseline used to build & validate the Technology Statistics Engine_**, before preparing the Technology Statistics package environment.

The **_engine-related commands_** run from the **_directory configured through_** `TECH_STATS_DIRECTORY`, currently:

```txt
📂 scripts/tech-stats
```

Inside that directory, the **_workflow enables Corepack_**, activates **_`pnpm` 12.4.2_**, as the **_package-manager baseline used by the project_**, & installs the dependencies through:

```bash
pnpm install --frozen-lockfile
```

**_Using the committed lockfile as a frozen dependency source_** keeps the workflow **_installation aligned with the dependency versions already accepted_** by the repository.

The following **_schema represents this preparation sequence_**:

```txt
        Workflow authorized
                │
                ▼
    Check out latest base branch
                │
                ▼
     Set up Node.js 22 baseline
                │
                ▼
         Enable Corepack
                │
                ▼
    Activate pnpm 12.4.2 baseline
                │
                ▼
       Install dependencies
   from frozen committed lockfile
                │
                ▼
   Environment ready for validation
```

> 🖋️ **_N.B.:_**
>
> _**Node.js 22** & `pnpm` **12.4.2** are the **Technology Statistics development & workflow baselines**. Newer versions may remain compatible, but **compatibility beyond those baselines** is **not currently validated by the project**._
>
> _The **checkout step** uses `persist-credentials: false`, **preventing GitHub credentials from remaining stored in the local Git configuration**._
>
> _**Write credentials are supplied separately only** when the workflow later needs to push generated changes._

[🔼 Back to the Table of Contents](#-table-of-contents)

## ✅ System Validation

**_Before analyzing live repository data_**, the workflow **_validates the Technology Statistics system itself_** through a **_TypeScript typecheck followed by its automated tests_**.

The **_validation_** acts as a **_safety gate_** between the prepared workflow environment & the execution of the Technology Statistics Engine.

The **_workflow first runs_**:

```bash
pnpm run typecheck
```

This verifies that the **_TypeScript implementation remains structurally valid_** before any test or live generation command is allowed to run.

If the **_typecheck succeeds_**, the **_workflow then runs_**:

```bash
pnpm run test
```

This **_command_** launches **_one Vitest execution containing two logical test suites_**:

|     Test Suite     |               Location               | Responsibility                                                                                                                                      |
| :----------------: | :----------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
|  **Engine tests**  |  `scripts/tech-stats/tests/engine/`  | _Validate engine configuration, user-created definitions, statistics calculations, repository detection, data privacy, output rendering & behavior_ |
| **Workflow tests** | `scripts/tech-stats/tests/workflow/` | _Validate scheduling cadence guard, workflow setup, code validation order, output generation boundaries & publication behavior_                     |

Keeping both suites under the same **_Technology Statistics test command_** allows the workflow to **_validate the engine implementation & the automation surrounding it_** before live repository analysis begins.

The resulting **_validation gate_** is:

|              Condition              | Workflow Result | Engine Action                                           |
| :---------------------------------: | :-------------: | :------------------------------------------------------ |
|         **Typecheck fails**         |   **_Stop_**    | _The **tests & engine are not executed**_               |
| **Either logical test suite fails** |   **_Stop_**    | _The **engine is not executed**_                        |
|   **Typecheck & all tests pass**    | **_Continue_**  | _The **workflow proceeds** to live repository analysis_ |

The following **_schema represents this validation gate_**:

```txt
              Environment
          ready for validation
                   │
                   ▼
             Run TypeScript
              typechecking
                   │
           Typecheck passes?
              │        │
             ❌       ✅
              │        │
            Fail       ▼
                      Run
                 Vitest command
                       │
               ┌───────┴────────┐
               │                │
               ▼                ▼
          Engine tests    Workflow tests
               │                │
               └───────┬────────┘
                       │
                All tests pass?
                 │        │
                ❌       ✅
                 │        │
                Fail      ▼
                         Run
             Technology Statistics Engine
```

> 🖋️ _**N.B.:**_
>
> _If **typechecking or either logical test suite fails**, the workflow is marked as **failed** & the live generation step is not executed._
>
> _**This is different from a later successful run where no statistics changed**: in that case, the engine completed successfully & the workflow simply finishes without publishing anything._
>
> _The **workflow-test contracts that protect command order & reject obsolete execution paths are documented later in the [🧪 Workflow Test Suite](#-workflow-test-suite) section** rather than being part of the runtime validation sequence itself._

[🔼 Back to the Table of Contents](#-table-of-contents)

## ⚙️ Statistics Regeneration

Once the **_Technology Statistics system passes validation_**, the **_workflow can safely invoke the [Technology Statistics Engine](./engine-mechanism.md)_** against the current repository evidence.

The **_generation stage_** follows this **_workflow boundary_**:

```txt
🖼️ Generation
├── runs from `TECH_STATS_DIRECTORY`
│   └── currently `scripts/tech-stats`
│
├── invokes the finalized engine generation command
│
├── receives `TECH_STATS_TOKEN`
│
├── optionally receives `TECH_STATS_REPOSITORIES`
│
└── receives NO publication credential
```

The **_workflow_** provides the engine with the **_repository access & selection configuration_** required for the analysis:

|   Environment Variable    | Purpose                                                                     |
| :-----------------------: | :-------------------------------------------------------------------------- |
|    `TECH_STATS_TOKEN`     | _Provides **read access** to the GitHub repositories eligible for analysis_ |
| `TECH_STATS_REPOSITORIES` | _Provides the **optional repository-selection configuration**_              |

The _**generation step runs from the directory configured through** `TECH_STATS_DIRECTORY`_, currently:

```txt
📂 scripts/tech-stats
```

From that directory, the **_workflow starts the engine generation pipeline_** through:

```bash
pnpm run tech-stats
```

This **_package command invokes the Technology Statistics Engine in its `generate` mode_**, connecting the workflow command to the live analysis & public SVG generation performed by the engine.

During this execution, the **_Technology Statistics Engine_**:

1. **_Loads & validates_** the current Technology Statistics **_configuration & user-created definitions_**,
2. **_Analyzes evidence_** from the **_eligible repositories_**,
3. **_Calculates_** the resulting **_statistics_**,
4. **_Renders & validates one public SVG for each current statistics definition_**,
5. **_Validates the public output boundary_** before persistence,
6. **_Writes the complete current generated SVG set_** into the configured statistics output directory,
7. **_Removes obsolete generated SVGs_** that no longer correspond to a current definition.

The **_top-level `id` field of each statistics definition_** determines the **_generated SVG filename_**:

```txt
Statistics definition
"id": "frontend"
        │
        ▼
   frontend.svg
```

The following **_schema represents this workflow-to-engine handoff_**:

```txt
    Technology Statistics System
             validated
                 │
                 ▼
              Provide
   repository access & selection
                 │
                 ▼
             Run engine
       in 📈 'Generate' mode
                 │
                 ▼
               Load
       current configuration
           & definitions
                 │
                 ▼
              Analyze
        repository evidence
                 │
                 ▼
        Calculate statistics
                 │
                 ▼
         Render & validate
           current SVGs
                 │
                 ▼
             Validate
      public output boundary
                 │
                 ▼
    Synchronize generated SVG set
       ├── Write current SVGs
       └── Remove obsolete SVGs
                 │
                 ▼
        Generated statistics
      ready for diff comparison
```

> 🖋️ **_N.B.:_**
>
> _At the end of this stage, the **engine has written, updated or removed the generated SVG files inside the checked-out repository copy**, but those changes have **not yet been staged, committed or pushed by Git**._
>
> _The following **[📦 Statistics Change Persistence](#-statistics-change-persistence) stage** compares those local file changes with the accepted repository state & **decides whether anything needs to be published**._
>
> _The **internal analysis, detection, calculation & rendering rules** remain the **responsibility of the [Technology Statistics Engine](./engine-mechanism.md)** & are therefore **documented separately**._

[🔼 Back to the Table of Contents](#-table-of-contents)

## 📦 Statistics Change Persistence

Once the **_Technology Statistics Engine has synchronized the current generated SVG set_**, the **_workflow_** determines **_whether those generated statistics changes differ from the accepted repository state_**.

This **_stage_** is responsible for **_persisting only meaningful statistics changes onto the periodic update branch_** before any pull request is created.

The **_set of generated SVGs_** is **_not defined by the workflow itself_**, instead:

```txt
Statistics definitions
→ determine the expected SVG set

Technology Statistics Engine
→ synchronizes the generated SVG set

GitHub workflow
→ stages & publishes resulting directory changes
```

The **_workflow uses the configured_** `TECH_STATS_OUTPUT_DIRECTORY` as the **_publication boundary_**, currently:

```txt
📂 assets/tech-stats/statistics
```

Then, the **_workflow stages all additions, modifications & deletions_** through:

```bash
git add -A -- "$TECH_STATS_OUTPUT_DIRECTORY"
```

The **_publication process_** therefore **_adapts automatically to changes in the statistics definitions_**:

| Definition Change | Engine Result                                   | Workflow Persistence                                                       |
| :---------------: | :---------------------------------------------- | :------------------------------------------------------------------------- |
|     **Added**     | _A **new generated SVG** is **created**_        | _The **new SVG** can be **staged & published**_                            |
|   **Modified**    | _The **corresponding SVG** is **regenerated**_  | _The **SVG** is **published only when its generated content has changed**_ |
|    **Removed**    | _The **obsolete generated SVG** is **removed**_ | _The **deletion** can be **staged & published**_                           |

The **_workflow_** then **_compares the staged statistics-directory changes with the currently accepted repository state_**:

- If **_nothing changed_** inside the generated statistics directory:
  - **_No commit_** is created,
  - **_No periodic branch update_** is pushed,
  - All subsequent **_publication steps are skipped_**,
  - The **_workflow finishes successfully_**.
- If **_at least one generated statistics SVG was added, modified or removed_**, the workflow:
  1. Retrieves the **_names of the changed statistics files_** for the later pull request description,
  2. Makes that list **_available to the later pull request stage_**,
  3. **_Validates the staged Git diff_**,
  4. Creates a **_temporary Technology Statistics Update commit_** containing the staged statistics-directory changes,
  5. **_Fetches the current periodic update branch_** when it already exists,
  6. **_Safely replaces its previous generated state_** using `--force-with-lease`,
  7. **_Continues_** to the pull request stage.

The following **_schema represents this persistence process_**:

```txt
         Generated SVG set
    synchronized by the engine
                 │
                 ▼
        Stage output-directory
 additions, modifications & deletions
                 │
                 ▼
        Did anything change?
           │             │
          ❌            ✅
           │             │
           │             ▼
           │    Capture changed filenames
           │             │
           │             ▼
           │    Validate staged Git diff
           │             │
           │             ▼
           │   Create temporary Update commit
           │             │
           │             ▼
           │   Fetch current periodic branch
           │             │
           │             ▼
           │   Push rewritten periodic branch
           │     using `--force-with-lease`
           │             │
           ▼             ▼
        Finish     Continue to PR stage
```

> 🖋️ **_N.B.:_**
>
> _The **workflow** is **intentionally independent from the number & filenames of the generated statistics SVGs**. The **Technology Statistics Engine determines the current SVG set**, while the **workflow publishes whatever changes appear inside** `TECH_STATS_OUTPUT_DIRECTORY`._
>
> _The **periodic branch commit** is intentionally named **`Technology Statistics Update`** because it represents the **temporary generated state** used by the pull request. It is **created locally** by the workflow under the **`Lixi [bot]` author name**, while authentication for the later push remains handled separately through GitHub's workflow token._
>
> _The **final commit** integrated into the **base branch** later uses **`Technology Statistics Refresh`**, distinguishing the **temporary automation state from the accepted repository history**._
>
> _The **periodic update branch** therefore acts as a **temporary carrier for changed generated statistics**, while the **base branch remains untouched** until the following pull request & squash-merge stages are completed._

[🔼 Back to the Table of Contents](#-table-of-contents)

## 📬 Pull Request Management

Once the **_periodic update branch contains changed Technology Statistics_**, the **_workflow_** prepares the **_pull request responsible for carrying those changes into the base branch_**.

The **_workflow_** first **_searches for an existing open pull request_** whose:

1. **_Base branch_** matches the **_configured base branch_**,
2. **_Head branch_** matches the **_periodic update branch_**.

The following **_behavior_** then applies:

|          Pull Request State           | Workflow Behavior                       |
| :-----------------------------------: | :-------------------------------------- |
|   **No matching open pull request**   | _**Creates** a new pull request_        |
| **Matching open pull request exists** | _**Refreshes** its title & description_ |

Whether **_created or refreshed_**, the **_pull request_** uses the following structure:

- The **_same title_**:

```txt
📈 Technology Statistics Update
```

- The **_same body structure_**:

```txt
The Technology Statistics Engine produced changes in the following generated statistics:

<bullet-point list of changed files>

The updated statistics were generated from the current repository evidence.
```

This keeps the **_pull request human-readable_** while preserving the relevant context of each generated update before it is integrated into the accepted repository history.

The following **_schema represents this management process_**:

```txt
 Periodic branch updated
            │
            ▼
 Open matching PR exists?
      │            │
     ❌           ✅
      │            │
      ▼            ▼
 Create PR     Refresh PR
      │            │
      └──────┬─────┘
             │
             ▼
      Expose PR number
  for merge & traceability
             │
             ▼
      Squash-merge stage
```

> 🖋️ _**N.B.:**_
>
> _**Reusing an existing open pull request prevents duplicate pull requests** when a previous execution successfully published the periodic branch but failed before completing the merge._
>
> _On a **later successful execution**, the **same pull request remains attached to the periodic update branch**, whose generated state has already been refreshed by the persistence stage. The workflow therefore **updates the existing pull request title & description instead of creating another one**._
>
> _The resulting **recovery pattern can therefore be summarized** as follows:_
>
> ```txt
> Same periodic branch
> +
> Same open PR
> +
> Refreshed generated branch state
> +
> Refreshed PR description
> ```
>
> _Together, these elements allow the workflow to **reuse the same publication path across repeated executions** while keeping the pull request aligned with the latest generated statistics state._

[🔼 Back to the Table of Contents](#-table-of-contents)

## 📜 Statistics Refresh Integration

Once the **_Technology Statistics pull request has been created or refreshed_** & its number exposed to the merge step, the workflow integrates the **_generated changes into the accepted repository history through a squash merge_**.

The **_temporary commit stored on the periodic update branch_** uses the following identity:

```txt
📈 (tech-stats): Technology Statistics Update
```

This **_commit_** represents the **_generated state proposed for integration through the pull request_**.

When the **_pull request is squash-merged_**, this **_temporary commit_** is **_not added directly to the base branch history_**.

Instead, the **_workflow asks GitHub to create a new final squash-merge commit_**:

```txt
📈 (tech-stats): Technology Statistics Refresh

Refresh the generated technology statistics from current repository evidence

Metadata: gh-pr=<pull-request-number>
```

The **_final commit_** therefore represents the **_accepted Technology Statistics state_**, while its **_`gh-pr` metadata preserves the connection to the pull request_** carrying the detailed generated-update context.

This **_metadata creates a direct traceability path_** from the accepted commit back to the pull request & its recorded changed-file list:

```txt
    `git log` on base branch
               ↓
      `Metadata: gh-pr=42`
               ↓
             PR #42
               ↓
   Changed statistics file list
               +
     Automated update context
```

The following **_schema represents this integration_**:

```txt
  Periodic update branch
Technology Statistics Update
            │
            ▼
       Pull request
            │
            ▼
       Squash-merge
            │
            ▼
Create new accepted commit
            │
            ▼
       Base branch
Technology Statistics Refresh
 `Metadata: gh-pr=<number>`
```

> 🖋️ _**N.B.:**_
>
> _The **`Technology Statistics Update` commit & the final `Technology Statistics Refresh` commit** represent the **same generated file changes** but remain **two distinct Git commits with different commit hashes**._
>
> _The **temporary `Update` commit remains on the periodic update branch & is carried by the pull request**, while the **final `Refresh` commit is created in the accepted base branch history through the squash merge**._

This **_separation_** keeps the **_base branch history clean_** while preserving the **_pull request as the detailed record of the automated statistics update_**.

The resulting **_roles can therefore be summarized_** as follows:

```txt
Update commit
→ proposed generated state

Pull request
→ transport + traceability

Refresh commit
→ accepted repository state
```

[🔼 Back to the Table of Contents](#-table-of-contents)

## ♻️ Periodic Branch Realignment

After the **_Technology Statistics pull request has been squash-merged_**, the **_base branch & periodic update branch no longer point to the same Git commit_**.

The **_base branch_** contains the **_newly created `Technology Statistics Refresh` commit_** whereas the **_periodic branch_** still contains the **_temporary `Technology Statistics Update` commit_** used by the pull request.

The following **_state_** therefore **_exists immediately after the squash merge_**:

```txt
Base branch
A ── B ── Refresh

Periodic branch
A ── B ── Update
```

Because the **_workflow_** reuses the **_same persistent periodic branch for every statistics update_**, it **_must be realigned_** with the latest accepted base branch state before the current execution finishes.

The **_workflow_** therefore:

1. **_Fetches the latest base branch state_** containing the accepted squash-merge commit,
2. **_Fetches the current periodic branch state_** required for the safe branch replacement,
3. **_Resets the local repository state_** to the latest base branch,
4. **_Pushes that state onto the periodic branch_** using `--force-with-lease` to make the **_periodic branch identical to the base branch again_**.

The following **_schema represents this realignment_**:

```txt
After squash merge

Base branch
A ── B ── Refresh

Periodic branch
A ── B ── Update
           │
           ▼
   Fetch latest base
& periodic branch states
           │
           ▼
   Reset local state
 to latest base branch
           │
           ▼
  Push base state onto
    periodic branch
with `--force-with-lease`
           │
           ▼

A ── B ── Refresh
           ↑
           ├── Base branch
           └── Periodic branch
```

> 🖋️ _**N.B.:**_
>
> _Fetching the **current periodic branch state before the replacement** allows `--force-with-lease` to **verify that the remote branch has not changed unexpectedly before overwriting it**._
>
> _The **periodic update branch** is **not deleted after the pull request is merged**._
>
> _Instead, it **remains available for future workflow executions** but is returned to the **same accepted Git state as the base branch** after every successful refresh._

This **_realignment_** ensures that the **_next statistics update starts from a clean accepted history_** rather than inheriting the temporary commit created by the previous workflow run.

This **_can therefore be summarized_** as follows:

```txt
Squash merge
→ branches diverge

Refresh commit
→ accepted history

Update commit
→ temporary history

Realignment
→ remove temporary Update state from periodic branch
→ point periodic branch at accepted history again

Next run
→ starts clean
```

[🔼 Back to the Table of Contents](#-table-of-contents)

## 🛑 Failure & Recovery Behavior

The **_Technology Statistics workflow_** is designed to **_stop when a required operation fails_** while **_preserving as much recoverable state as possible_**.

The **_resulting behavior_** depends on **_which stage fails_**:

| State |                 Situation                  | Workflow Stage                          |               Workflow Result                | Preserved State                                                                                         |
| :---: | :----------------------------------------: | :-------------------------------------- | :------------------------------------------: | :------------------------------------------------------------------------------------------------------ |
|  ❌   |     **Environment Preparation Fails**      | _Checkout, runtime or dependency setup_ |          _Stops with a **failure**_          | _**Base branch** remains unchanged & no publication state is created_                                   |
|  ❌   |            **Typecheck Fails**             | _Validate TypeScript implementation_    |          _Stops with a **failure**_          | _**Tests & engine are not executed**; base branch remains unchanged_                                    |
|  ❌   |     **Engine or Workflow Tests Fail**      | _Run automated test suites_             |          _Stops with a **failure**_          | _**Engine is not executed**; base branch remains unchanged_                                             |
|  ❌   |        **Engine Generation Fails**         | _Regenerate Technology Statistics_      |          _Stops with a **failure**_          | _**Base branch** remains unchanged_                                                                     |
|  ✅   |         **No Statistics Changed**          | _Compare generated statistics_          |         _**Finishes successfully**_          | _No commit, pull request or merge is created_                                                           |
|  ❌   |      **Statistics Persistence Fails**      | _Stage, validate, commit & push update_ |          _Stops with a **failure**_          | _**Base branch** remains unchanged; no accepted Refresh commit exists_                                  |
|  ❌   | **Pull Request Creation or Refresh Fails** | _Synchronize Technology Statistics PR_  |          _Stops with a **failure**_          | _**Periodic update branch** remains available with its generated Update state_                          |
|  ❌   |           **Squash Merge Fails**           | _Integrate the statistics refresh_      |          _Stops with a **failure**_          | _**Base branch remains unchanged**; pull request & periodic update branch remain available_             |
|  ✅   |         **Squash Merge Succeeds**          | _Integrate the statistics refresh_      |        _**Continues to realignment**_        | _**Accepted Refresh commit exists** on the base branch_                                                 |
|  ❌   |   **Periodic Branch Realignment Fails**    | _Realign periodic branch with base_     | _Stops with a **failure after integration**_ | _**Base branch remains successfully updated**, while the periodic branch may still require realignment_ |

This **_behavior_** ensures that **_failures occurring before the squash merge succeeds cannot modify the accepted base branch history_**.

The following **_schema summarizes the main failure & recovery paths_**:

```txt
            Prepare workflow environment
                        │
                        ├── ❌ Fail
                        │      └── Stop with failure
                        │
                        ▼
                  Run typecheck
                        │
                        ├── ❌ Fail
                        │      └── Stop with failure
                        │
                        ▼
           Run Engine & Workflow tests
                        │
                        ├── ❌ Fail
                        │      └── Stop with failure
                        │
                        ▼
          Run Technology Statistics Engine
                        │
                        ├── ❌ Fail
                        │      └── Stop with failure
                        │
                        ▼
               Statistics changed?
                        │
                        ├── ❌ No
                        │      └── Finish successfully
                        │
                        ▼
           Persist periodic branch update
                        │
                        ├── ❌ Fail
                        │      └── Stop with failure
                        │
                        ▼
          Create / refresh pull request
                        │
                        ├── ❌ Fail
                        │      └── Periodic branch remains available
                        │
                        ▼
             Squash-merge pull request
                        │
                        ├── ❌ Fail
                        │      └── PR + periodic branch remain available
                        │
                        ▼
        Accepted Refresh committed to base
                        │
                        ▼
             Realign periodic branch
                        │
                        ├── ❌ Fail
                        │      └── Base remains updated
                        │          Periodic branch may require realignment
                        │
                        ▼
                Finish successfully
```

> 🖋️ _**N.B.:**_
>
> _The **absence of changed statistics is not considered a failure**. It means the **engine completed successfully but produced the same public SVGs** as those already stored in the repository._
>
> _In that situation, **no commit, pull request or merge is required** & the **workflow finishes normally**._
>
> _A **failure before the squash merge succeeds cannot modify the accepted base branch history**. Once the **Refresh commit has been successfully integrated**, however, that accepted state remains valid even if the later periodic-branch realignment fails._

[🔼 Back to the Table of Contents](#-table-of-contents)

## 🧪 Workflow Test Suite

The **_workflow behavior documented throughout this file is protected by its own automated test suite_**.

While the **_Engine tests validate the internal Technology Statistics implementation_**, the **_Workflow tests protect the automation contract surrounding it_**, including its cadence, environment preparation, validation sequence, generation boundaries & publication lifecycle.

The **_Workflow test suite_** is located under:

```txt
📂 scripts/tech-stats/tests/workflow/
```

The **_Engine & Workflow test suites_** are executed together as part of the **_same Vitest run_** through:

```bash
pnpm run test
```

The **_workflow test suite_** is organized as follows:

```txt
📂 tests/workflow/
├── 📂 constants/
│   ├── branches.ts
│   ├── commands.ts
│   ├── commits.ts
│   ├── secret-names.ts
│   └── step-ids.ts
├── 📂 fixtures/
│   ├── cadence-guard.ts
│   └── update-tech-stats-workflow.ts
├── cadence.ts
├── setup.ts
├── validation.ts
├── generation.ts
└── publication.ts
```

Within that structure, the **_executable workflow test files follow the same logical order_** as the workflow responsibilities they protect:

1. `workflow/cadence.ts`
2. `workflow/setup.ts`
3. `workflow/validation.ts`
4. `workflow/generation.ts`
5. `workflow/publication.ts`

In addition, they rely on the following **_shared fixtures_**:

```txt
workflow/fixtures/update-tech-stats-workflow.ts
workflow/fixtures/cadence-guard.ts
```

Each **_test file protects a specific workflow responsibility_**:

|    Test File     | Responsibility                                                                                                                             |
| :--------------: | :----------------------------------------------------------------------------------------------------------------------------------------- |
|   `cadence.ts`   | _Verifies **manual & scheduled triggers**, odd/even ISO-week authorization & the week-53 year-boundary case_                               |
|    `setup.ts`    | _Verifies checkout, runtime & **dependency-setup order**, **runtime baselines** & frozen-lockfile installation_                            |
| `validation.ts`  | _Verifies **typecheck/test ordering**, generation gating & rejection of obsolete execution commands_                                       |
| `generation.ts`  | _Verifies the **engine generation command**, working directory & analysis credential boundary_                                             |
| `publication.ts` | _Verifies **generated-output persistence**, publication credentials, commit identities & pull-request / merge / branch lifecycle behavior_ |

The **_workflow file & cadence logic_** are exposed to the tests **_through dedicated fixtures_**:

```txt
GitHub workflow file
        │
        ▼
📄 `update-tech-stats-workflow.ts`
→ loads & normalizes real workflow source
        │
        ├───────────────────────────────┐
        │                               │
        ▼                               ▼
setup / validation /             📄 `cadence-guard.ts`
generation / publication         → extracts real cadence code
tests                            → executes it deterministically
                                        │
                                        ▼
                                   cadence tests
```

The **_validation tests_** also preserve the **_transition away from obsolete execution paths_**:

```txt
Validation contract
├── Current execution order
│
│   `pnpm run typecheck`
│            ↓
│      `pnpm run test`
│            ↓
│   `pnpm run tech-stats`
│
│
└── Obsolete execution paths must stay gone
    ├── `pnpm run tech-stats -- update`
    ├── `node --test scripts/tech-stats/tests/*.test.mjs`
    └── `node scripts/tech-stats/index.mjs update`
```

The resulting **_workflow-test coverage can therefore be summarized_** as follows:

```txt
🧪 Workflow tests
├── ⏰ Cadence
│   └── WHEN execution may continue
│
├── 🔧 Setup
│   └── HOW the environment is prepared
│
├── ✅ Validation
│   └── WHAT must pass before generation
│
├── 📈 Generation
│   └── HOW the engine may be invoked
│
└── 📮 Publication
    └── HOW generated changes may reach the base branch
```

> 🖋️ _**N.B.:**_
>
> _The **workflow tests primarily protect behavioral contracts rather than human-facing step names**. Stable step IDs, commands, branch identities, credentials & lifecycle rules allow presentation wording to evolve without unnecessarily breaking the suite._
>
> _The **workflow suite does not replace the Engine tests**. Both logical suites run through the same Vitest command, but **they protect different system boundaries**._

[🔼 Back to the Table of Contents](#-table-of-contents)

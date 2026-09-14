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

## 🎯 Workflow Purpose

The **_Technology Statistics workflow automates the execution & publication cycle of the [Technology Statistics Engine](./engine-mechanism.md)_**.

While the **_engine determines what statistics should be generated_**, the **_workflow_** is responsible for deciding **_when the engine runs & how changed statistics are integrated into the repository_**.

Its **_responsibilities_** include:

1. Determining **_whether a scheduled execution should continue_**,
2. **_Loading the latest accepted base branch state_**,
3. **_Running the Technology Statistics test suite_** before live repository analysis,
4. **_Running the engine_**,
5. Detecting **_whether generated statistics changed_**,
6. **_Persisting changes_** on the periodic update branch,
7. **_Opening or refreshing the pull request carrying those changes_**,
8. **_Squash-merging_** the accepted refresh into the base branch,
9. **_Realigning the periodic branch_** for the next execution.

[🔼 Back to the Table of Contents](#-table-of-contents)

## 🧭 Workflow Overview

The **_Technology Statistics workflow_** follows a **_controlled sequence from execution authorization to statistics publication & branch cleanup_**.

The following **_schema_** represents the **_complete lifecycle of a workflow run_**:

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
              Run test suite
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

[🔼 Back to the Table of Contents](#-table-of-contents)

## ⏰ Execution Decision

The **_execution decision_** determines whether a **_triggered workflow run_** should **_continue into the Technology Statistics process or stop immediately_**.

The **_workflow_** currently supports **_two execution paths_**:

|   Execution Path    | Behavior                                                          |
| :-----------------: | :---------------------------------------------------------------- |
|  **_Manual run_**   | _**Always** continues **immediately**_                            |
| **_Scheduled run_** | _Continues **only** when the **current ISO week number is even**_ |

GitHub **_always_** triggers the **_scheduled workflow every Sunday at 22:00 UTC_**:

```yaml
schedule:
  - cron: "0 22 * * 0"
```

Then, the **_GitHub Action workflow_** uses **_Node.js_** to decide **_whether the remaining steps are authorized to run_**:

| Current ISO Week | Execution Check Result | Subsequent Workflow Steps |
| :--------------: | :--------------------: | :-----------------------: |
|     **Odd**      | ❌ _Execution Denied_  |       **_Skipped_**       |
|     **Even**     | ✅ _Execution Allowed_ |  **_Continue normally_**  |

However, **_manual runs bypass this restriction_** & therefore **_always continue the workflow execution_**.

The following **_schema_** represents this decision:

```txt
Workflow triggered
       │
       ▼
What triggered the workflow?
       │
       ├── Manual run
       │      │
       │      └───────────────► Continue
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

> 🖋️ _**N.B.:**_
>
> _The scheduled execution is **approximately biweekly rather than strictly every 14 days** because it relies on even-numbered ISO weeks._
>
> _When **an ISO year contains a week 53**, **both week 53 & week 1** of the following year are **odd**. The **workflow therefore skips two consecutive scheduled Sundays**, producing a **three-week interval** between the week 52 & week 2 executions._
>
> _This **behavior does not prevent a refresh from being executed manually** during that interval._

[🔼 Back to the Table of Contents](#-table-of-contents)

## 📥 Stable Starting State

Once a **_workflow run is authorized to continue_**, the **_first step_** is to **_prepare a stable starting state_** before executing any validation or Technology Statistics logic.

This **_preparation ensures_** that the workflow:

1. Starts from the **_latest accepted state of the base branch_**,
2. Uses the **_Node.js version required by the Technology Statistics system_**.

The **_workflow first checks out the branch_** defined by `BASE_BRANCH`, which currently points to `master` in this case.

Then, it **_configures Node.js 22_** before the test suite & Technology Statistics Engine are executed.

The following **_schema_** represents this preparation sequence:

```txt
     Workflow authorized
               │
               ▼
  Check out latest base branch
               │
               ▼
      Set up Node.js 22
               │
               ▼
Environment ready for validation
```

> 🖋️ **_N.B.:_**
>
> _The **checkout step** uses `persist-credentials: false`, **preventing GitHub credentials from remaining stored in the local Git configuration**._
>
> _**Write credentials are supplied separately only** when the workflow later needs to push generated changes._

[🔼 Back to the Table of Contents](#-table-of-contents)

## ✅ System Validation

**_Before analyzing live repository data_**, the workflow **_validates the Technology Statistics system itself_** by **_running its complete automated test suite_**.

This **_validation_** acts as a **_safety gate_** between the prepared workflow environment & the execution of the Technology Statistics Engine.

The **_test suite currently verifies areas_**, _such as_:

- _Deterministic calculations,_
- _Technology detection rules,_
- _Privacy safeguards,_
- _SVG rendering,_
- _Workflow behavior._

|      Condition       | Workflow Result | Engine Action                                           |
| :------------------: | :-------------: | :------------------------------------------------------ |
| **_Any test fails_** |    **Stop**     | _The **engine is not executed**_                        |
| **_All tests pass_** |  **Continue**   | _The workflow proceeds to **live repository analysis**_ |

The following **_schema represents this validation gate_**:

```txt
            Environment
        ready for validation
                 │
                 ▼
      Run Technology Statistics
             test suite
                 │
            Tests pass?
             │       │
            ❌      ✅
             │       │
           Fail      ▼
                  Run Technology
                 Statistics Engine
```

> 🖋️ _**N.B.:**_
>
> _If the **test suite fails**, the workflow is marked as **failed** & the engine is not executed._
>
> _This is different from a later successful run where **no statistics changed**: in that case, the workflow simply finishes without publishing anything._

[🔼 Back to the Table of Contents](#-table-of-contents)

## ⚙️ Statistics Regeneration

Once the **_Technology Statistics system passes validation_**, the **_workflow can safely invoke the [Technology Statistics Engine](./engine-mechanism.md)_** against the current repository evidence.

The **_workflow_** provides the engine with the **_repository access & selection configuration_** required for the analysis:

|   Environment Variable    | Purpose                                                                     |
| :-----------------------: | :-------------------------------------------------------------------------- |
|    `TECH_STATS_TOKEN`     | _Provides **read access** to the GitHub repositories eligible for analysis_ |
| `TECH_STATS_REPOSITORIES` | _Provides the **optional repository-selection configuration**_              |

It then **_starts the engine update pipeline_** through:

```bash
node scripts/tech-stack/index.mjs update
```

During this execution, the **_Technology Statistics Engine_**:

1. **_Analyzes evidence_** from eligible repositories,
2. **_Calculates the resulting statistics_**,
3. **_Regenerates_** the public SVG files,
4. Validates the **_generated public outputs_**.

The following **_schema represents this workflow-to-engine handoff_**:

```txt
 Technology Statistics system validated
                │
                ▼
 Provide repository access & selection
                │
                ▼
   Run Technology Statistics Engine
                │
                ▼
     Analyze repository evidence
                │
                ▼
       Calculate statistics
                │
                ▼
         Regenerate SVGs
                │
                ▼
     Validate public outputs
                │
                ▼
Generated statistics ready for diff comparison
```

> 🖋️ _**N.B.:**_
>
> _This stage **regenerates & validates the statistics**, but it does **not yet determine whether they changed compared with the previous versions** already stored in the repository._
>
> _That **comparison** belongs to the following **[📦 Statistics Change Persistence](#-statistics-change-persistence)** stage._
>
> _The **internal analysis, detection, calculation & rendering rules** remain the responsibility of the [**Technology Statistics Engine**](./engine-mechanism.md) & are therefore documented separately._

[🔼 Back to the Table of Contents](#-table-of-contents)

## 📦 Statistics Change Persistence

Once the **_Technology Statistics Engine has regenerated & validated the public SVGs_**, the **_workflow_** determines **_whether any of those generated files actually differ from the versions currently stored_** in the repository.

This **_stage_** is responsible for **_persisting only meaningful statistics changes onto the periodic update branch_** before any pull request is created.

The **_workflow limits this operation_** to the **_six generated Technology Statistics SVGs_**:

1. `languages-web-foundations.svg`,
2. `frontend.svg`,
3. `ui-systems-design.svg`,
4. `backend-data.svg`,
5. `testing-tooling.svg`,
6. `architecture-delivery.svg`.

These **_paths act as an allowlist_**: only changes affecting these generated statistics files may be included in the automated update commit.

The **_workflow first stages changes among these six files & compares_** the staged versions with the currently accepted repository state.

If **_none of the SVGs changed_**:

- **_No commit_** is created,
- **_No periodic branch update_** is pushed,
- All subsequent **_publication steps are skipped_**,
- The **_workflow finishes successfully_**.

If **_at least one SVG changed_**, the workflow:

1. Retrieves the **_names of the changed statistics files_** for the later pull request description,
2. Makes that list **_available to the later pull request stage_**,
3. **_Validates the staged Git diff_**,
4. Creates a **_temporary Technology Statistics Update commit_**,
5. **_Fetches the current periodic update branch_** when it already exists,
6. **_Safely replaces its previous generated state_** using `--force-with-lease`,
7. **_Continues to the pull request stage_**.

The following **_schema represents this persistence process_**:

```txt
           Generated SVGs
        ready for comparison
                 │
                 ▼
            Stage changes
     among six allowed SVG paths
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
> _The **periodic branch commit** is intentionally named **`Technology Statistics Update`** because it represents the **temporary generated state** used by the pull request._
>
> _The **final commit** integrated into the **base branch** later uses **`Technology Statistics Refresh`**, distinguishing the **temporary automation state from the accepted repository history**._
>
> _The **periodic update branch** therefore acts as a **temporary carrier for changed generated statistics**, while the **base branch remains untouched** until the following pull request & squash-merge stages are completed._

[🔼 Back to the Table of Contents](#-table-of-contents)

## 📬 Pull Request Management

Once the **_periodic update branch contains changed Technology Statistics_**, the **_workflow_** prepares the **_pull request responsible for carrying those changes toward the base branch_**.

The **_workflow_** first **_searches for an existing open pull request_** whose:

1. **_Base branch_** matches the **_configured base branch_**,
2. **_Head branch_** matches the **_periodic update branch_**.

The following **_behavior_** then applies:

|          Pull Request State           | Workflow Behavior                       |
| :-----------------------------------: | :-------------------------------------- |
|   **No matching open pull request**   | _**Creates** a new pull request_        |
| **Matching open pull request exists** | _**Refreshes** its title & description_ |

The **_pull request description_** includes the list of generated statistics files that changed during the current workflow run.

This allows the **_pull request_** to remain a **_human-readable record of the generated update_** before it is integrated into the accepted repository history.

The following **_schema_** represents this management process:

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
Make PR number available
to the squash-merge stage
```

> 🖋️ _**N.B.:**_
>
> _**Reusing** an existing open pull request **prevents the workflow from creating duplicate pull requests** when a previous execution successfully updated the periodic branch but failed before completing the merge._
>
> _The **existing pull request is refreshed** instead, allowing the **workflow to continue from the already available update state**._

[🔼 Back to the Table of Contents](#-table-of-contents)

## 📜 Statistics Refresh Integration

Once the **_Technology Statistics pull request is ready_**, the **_workflow_** integrates the generated changes into the **_accepted repository history through a squash merge_**.

The **_temporary commit stored on the periodic update branch_** uses the following identity:

```txt
📈 (tech-stack): Technology Statistics Update
```

This **_commit_** represents the **_generated state proposed for integration through the pull request_**.

When the **_pull request is squash-merged_**, this **_temporary commit_** is **_not added directly to the base branch history_**.

Instead, GitHub creates a **_new final commit_**:

```txt
📈 (tech-stack): Technology Statistics Refresh

Refresh the generated technology statistics from current repository evidence

Metadata: gh-pr=<pull-request-number>
```

The **_final commit_** therefore represents the **_accepted Technology Statistics state_**, while its **_`gh-pr` metadata preserves the connection to the pull request_** that carried the update.

```txt
    `git log` on base branch
               ↓
      `Metadata: gh-pr=42`
               ↓
             PR #42
               ↓
original automated update context
```

The following **_schema_** represents this integration:

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
> _The **temporary `Update` commit belongs to the pull request history**, while the **final `Refresh` commit belongs to the accepted base branch history**._

This **_separation_** keeps the **_base branch history clean_** while preserving the **_pull request as the detailed record of the automated statistics update_**.

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

After the **_Technology Statistics pull request has been squash-merged_**, the **_base branch & periodic update branch no longer point to the same Git history_**.

The **_base branch_** contains the **_newly created `Technology Statistics Refresh` commit_** whereas the **_periodic branch_** still contains the **_temporary `Technology Statistics Update` commit_** used by the pull request.

The following **_state_** therefore **_exists immediately after the squash merge_**:

```txt
Base branch
A ── B ── Refresh

Periodic branch
A ── B ── Update
```

Because the **_workflow_** reuses the **_same permanent periodic branch for every statistics update_**, it **_must be realigned_** with the latest accepted base branch state before the current execution finishes.

The **_workflow_** therefore:

1. **_Fetches the latest base branch state_** containing the accepted squash-merge commit,
2. **_Fetches the current periodic branch state_** required for the safe branch replacement,
3. **_Resets the local working state_** to the latest base branch,
4. **_Pushes that state onto the periodic branch_** using `--force-with-lease` to make the **_periodic branch identical to the base branch again_**.

The following **_schema represents this realignment_**:

```txt
After squash merge

Base branch
A ── B ── Refresh

Periodic branch
A ── B ── Update


        Realign
           │
           ▼


A ── B ── Refresh
           ↑
           ├── Base branch
           └── Periodic branch
```

> 🖋️ _**N.B.:**_
>
> _The **periodic update branch** is **not deleted after the pull request is merged**._
>
> _Instead, it **remains available for future workflow executions** but is returned to the **same accepted Git state as the base branch** after every successful refresh._

This **_realignment_** ensures that the **_next statistics update starts from a clean accepted history_** rather than inheriting the temporary commit created by the previous workflow run.

[🔼 Back to the Table of Contents](#-table-of-contents)

## 🛑 Failure & Recovery Behavior

The **_Technology Statistics workflow_** is designed to **_stop immediately when a critical operation fails_** while **_preserving as much recoverable state as possible_**.

The **_resulting behavior_** depends on **_which stage fails_**:

| State |                 Situation                  | Workflow Step                                                     |               Workflow Result                | Preserved State                                                                                         |
| :---: | :----------------------------------------: | :---------------------------------------------------------------- | :------------------------------------------: | :------------------------------------------------------------------------------------------------------ |
|  ❌   |            **Test Suite Fails**            | _Run Technology Statistics **test suite**_                        |          _Stops with a **failure**_          | _**Base branch** remains unchanged_                                                                     |
|  ❌   |         **Engine Execution Fails**         | _**Analyze repository evidence** & regenerate statistics_         |          _Stops with a **failure**_          | _**Base branch** remains unchanged_                                                                     |
|  ✅   |         **No Statistics Changed**          | _**Persist changed** statistics to periodic update branch_        |         _**Finishes successfully**_          | _No publication state is created_                                                                       |
|  ❌   |       **Periodic Branch Push Fails**       | _**Persist changed** statistics to periodic update branch_        |          _Stops with a **failure**_          | _**Base branch** remains unchanged_                                                                     |
|  ❌   | **Pull Request Creation or Refresh Fails** | _**Create or refresh** Technology Statistics **pull request**_    |          _Stops with a **failure**_          | _**Periodic update branch** remains available_                                                          |
|  ❌   |           **Squash Merge Fails**           | _**Squash-merge** Technology Statistics refresh into base branch_ |          _Stops with a **failure**_          | _**Pull request & periodic update branch** remain available_                                            |
|  ✅   |         **Squash Merge Succeeds**          | _**Squash-merge** Technology Statistics refresh into base branch_ |          _**Continues to cleanup**_          | _**Accepted Refresh commit exists** on the base branch_                                                 |
|  ❌   |   **Periodic Branch Realignment Fails**    | _**Realign** update branch with base branch_                      | _Stops with a **failure after integration**_ | _**Base branch remains successfully updated**, while the periodic branch may still require realignment_ |

This **_behavior_** ensures that **_failures occurring before integration cannot modify the accepted base branch history_**.

The following **_schema summarizes the main failure & recovery paths_**:

```txt
                    Run test suite
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
                Push periodic branch
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
                           │      └── Pull request + periodic branch remain available
                           │
                           ▼
       Accepted Refresh committed to base branch
                           │
                           ▼
              Realign periodic branch
                           │
                           ├── ❌ Fail
                           │      └── Base branch remains updated
                           │          Periodic branch may require realignment
                           │
                           ▼
                 Finish successfully
```

> 🖋️ _**N.B.:**_
>
> _The **absence of changed statistics is not considered a failure**._
>
> _It means the **engine completed successfully but produced the same public SVGs** as those already stored in the repository._
>
> _In that situation, **no commit, pull request or merge is required** & the **workflow finishes normally**._

[🔼 Back to the Table of Contents](#-table-of-contents)

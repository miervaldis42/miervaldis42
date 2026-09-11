# 📈 Technology Statistics System

The **Technology Statistics system** analyzes repository evidence, generates the technology statistics displayed on my GitHub profile & automates their periodic refresh.

This **_documentation hub_** provides the **_entry point to its two main components_**:

1. The **_statistics engine_** itself,
2. The **_GitHub workflow_** responsible for running the engine & publishing its generated statistics.

## 📑 Table of Contents

- [🎯 System Purpose](#-system-purpose)
- [⚙️ Engine Mechanism](#️-engine-mechanism)
- [📋 GitHub Workflow](#-github-workflow)

## 🎯 System Purpose

The **Technology Statistics system** exists to provide a **_deterministic, auditable & privacy-conscious representation of my technical stack_** based on evidence found across eligible GitHub repositories.

The **_main output of the system_** is the **_set of technology statistics SVGs displayed on my GitHub profile_**.

> 🖋️ _**N.B.:**_
>
> _The **system** performs this task **without executing analyzed projects, installing their dependencies or relying on recurring AI inference**._

[🔼 Back to the Table of Contents](#-table-of-contents)

## ⚙️ Engine Mechanism

The **_engine_** contains the **_core logic_** for repository analysis, metric calculation, technology detection, privacy validation & SVG rendering required **_to produce the tech stack statistics_**.

Its **_internal architecture & behavior_** can be found in details in [**_"Engine Mechanism" document_**](./engine-mechanism.md).

[🔼 Back to the Table of Contents](#-table-of-contents)

## 📋 GitHub Workflow

The **GitHub workflow** **_automates when & how the Technology Statistics Engine runs_**, including scheduled refreshes, manual execution & publication of changed statistics.

The **_workflow behavior & scheduling rules_** are explained in [**_"GitHub Workflow" document_**](./github-workflow.md).

[🔼 Back to the Table of Contents](#-table-of-contents)

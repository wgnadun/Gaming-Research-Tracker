# Research Implementation Tracker 🎓🔬

A clean, modern, desktop-first responsive web application for tracking the development progress of the university research project:

> **Research Title:**  
> *A Performance-Aware Agentic AI Framework for Adaptive 3D Asset Optimization in Real-Time Game Engines*

---

## ⚡ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (Navy / Blue / White professional palette with subtle neutrals)
- **Icons:** Lucide React
- **Charts:** Recharts (Pie Chart status distribution & Area Chart completion timeline)
- **Data Storage:** Browser `LocalStorage` with schema versioning and repository abstraction (`ITaskRepository`)
- **Testing:** Vitest automated unit test suite

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally in Development Mode
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173/
```

### 3. Run Automated Unit Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 🧩 Key Features

### 1. Dashboard
- **5 Summary Metric Cards:** Total Tasks (65), Completed Tasks, In Progress Tasks, Blocked Tasks, and Overall Completion Percentage.
- **Active Development Phase Banner:** Highlights current active phase, research goal, and completion progress.
- **Progress by Development Phase:** Real-time visual progress bars across all 8 phases (P0 to P7).
- **Task Status Distribution Chart:** Recharts donut chart with interactive tooltip.
- **Completion Timeline Chart:** Cumulative research progress over time based on actual completion dates.
- **Operational Sections:** Next Available Tasks (dependencies met), Upcoming Milestones (M1–M8), Recently Completed Tasks, and Blocked Tasks requiring attention.

### 2. All Tasks Management
- Preloaded with the exact **65 predefined research implementation tasks** from `P0-01` to `P7-09`.
- **Filtering & Search:** Instant search by task ID, title, notes, or dependencies; filter by Phase, Priority, and Status.
- **Sorting:** Sort by Task ID, Priority rank, or Target Date.
- **View Toggle:** Switch between compact Table View and responsive Card Grid View.
- **CRUD Operations:** Create, edit, and delete tasks (with safety confirmation dialog).
- **Status Advancement:** Inline status dropdown with automatic completed date timestamping.

### 3. Development Phases (P0 — P7)
All eight research phases represented as expandable accordions with goals, metrics, and nested task cards:
- **Phase P0 — Project Foundations** (Establish development environment and software architecture)
- **Phase P1 — Asset Analysis and Validation** (Extract geometric, texture, UV, and topology data)
- **Phase P2 — Asset Optimization Modules** (Mesh Decimation, Topology Cleanup, LODs, Texture Resizing & Compression)
- **Phase P3 — Unreal Engine Integration** (Python automation, FBX import, actor replacement, and scene testing)
- **Phase P4 — Automated Evaluation** (Unreal CSV profiling, frametime/FPS analysis, GPU time, SSIM visual fidelity)
- **Phase P5 — Workflow Orchestration and Baselines** (Fixed & rule-based adaptive baseline pipelines)
- **Phase P6 — Agentic AI Integration** (LLM planning agent, tool execution, multi-turn evaluation feedback, memory)
- **Phase P7 — Experiments and Research Validation** (Dataset benchmarking, baseline comparisons, thesis deliverables)

### 4. Kanban Board
- 4 workflow columns: **Not Started**, **In Progress**, **Blocked**, and **Completed**.
- HTML5 Drag-and-drop card interaction + accessible move buttons.
- Dependency warning badges for tasks with unmet prerequisites.
- Direct click to inspect full task details.

### 5. Milestones Tracking (M1 — M8)
- **M1:** Development Environment Ready (Phase P0)
- **M2:** Asset Analyzer Complete (Phase P1)
- **M3:** Optimization Modules Complete (Phase P2)
- **M4:** Unreal Integration Complete (Phase P3)
- **M5:** Automated Evaluation Complete (Phase P4)
- **M6:** Non-Agentic Pipeline Complete (Phase P5)
- **M7:** AI Agent Integrated (Phase P6)
- **M8:** Research Experiments Complete (Phase P7)
- Automatically marked as **Completed** when all tasks in the associated phase reach completion.

### 6. Project Settings & Data Administration
- Configure Research Project Title, Project Start Date, Target Completion Date, and Default Phase.
- **Appearance Theme:** Switch between Navy Light Mode and High-Contrast Dark Mode.
- **Export JSON Snapshot:** Download a complete backup of tasks and settings with one click.
- **Import JSON Backup:** Restore tasks from a JSON file with strict schema validation.
- **Factory Reset:** Revert data back to the clean baseline of 65 predefined tasks with confirmation.

---

## 📁 Architecture & File Layout

```
Gaming-Research-Tracker/
├── index.html                           # Root HTML
├── package.json                         # Dependencies & scripts
├── vite.config.ts                       # Vite configuration with @ path alias
├── tailwind.config.js                   # Tailwind CSS configuration
├── tsconfig.json                        # TypeScript configuration
├── src/
│   ├── types/
│   │   └── index.ts                     # Core TypeScript data models
│   ├── data/
│   │   ├── initialTasks.ts              # 65 predefined implementation tasks (P0-01 to P7-09)
│   │   ├── phases.ts                    # 8 development phases (P0 to P7) metadata
│   │   └── milestones.ts                # 8 milestones (M1 to M8) definitions
│   ├── services/
│   │   ├── taskRepository.ts            # LocalStorage persistence & import/export abstraction
│   │   └── __tests__/
│   │       └── taskRepository.test.ts   # Repository unit tests
│   ├── utils/
│   │   ├── calculations.ts              # Metrics, charts, phase progress & dependency logic
│   │   └── __tests__/
│   │       └── calculations.test.ts     # Calculation unit tests
│   ├── context/
│   │   └── ProjectContext.tsx           # Global React state management
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx              # Collapsible navigation sidebar
│   │   │   └── Header.tsx               # Header with search, theme toggle & new task action
│   │   ├── ui/
│   │   │   ├── Badge.tsx                # Status, Priority, and Phase badges
│   │   │   ├── ProgressBar.tsx          # Smooth progress bar component
│   │   │   ├── Modal.tsx                # Accessible modal dialog wrapper
│   │   │   └── ConfirmDialog.tsx        # Safety confirmation dialog
│   │   ├── dashboard/
│   │   │   └── DashboardView.tsx        # Summary cards, charts, and operational widgets
│   │   ├── tasks/
│   │   │   ├── TasksView.tsx            # All tasks table/grid with filters and search
│   │   │   ├── TaskDetailModal.tsx      # Comprehensive task inspection modal
│   │   │   └── TaskFormModal.tsx        # Create & edit task modal
│   │   ├── phases/
│   │   │   └── PhasesView.tsx           # Expandable P0–P7 phase accordions
│   │   ├── kanban/
│   │   │   └── KanbanView.tsx           # 4-column drag-and-drop Kanban board
│   │   ├── milestones/
│   │   │   └── MilestonesView.tsx       # M1–M8 milestone tracking cards
│   │   └── settings/
│   │       └── SettingsView.tsx         # Project configuration, backup & restore
│   ├── App.tsx                          # Root application component
│   ├── main.tsx                         # Entry point
│   └── index.css                        # Tailwind directives & styles
└── README.md
```

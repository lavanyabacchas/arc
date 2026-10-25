# ARC — AI-Powered Critical Infrastructure Cybersecurity Platform

> **"See Threats. Understand Risk. Act with Confidence."**

ARC is an enterprise-grade Security Operations Center (SOC) monitoring, threat detection, forensic investigation, and incident response platform purpose-built for simulated critical infrastructure environments.

---

## ⚡ Key Highlights & Capabilities

- **Enterprise Command-Center UI**: Dark navy/midnight SOC dashboard (`#06111F`) tailored with electric blue accents, threat radar pulse animations, and responsive panels.
- **Interactive Infrastructure Topology**: Visual interconnect graph across 5 core sectors (Energy, Water & Waste, IT & Cloud, Communications, Transportation) featuring nodes like Power Grid, Water Treatment Plant, Data Center, Communication Tower, and Transport Hub. Click any node to open the real-time Asset Inspector.
- **Explainable Detection Engine**: Hybrid detection combining configurable threshold rules with Scikit-Learn **Isolation Forest** statistical anomaly detection and transparent 0–100 risk scoring.
- **ARC Intelligence AI Engine**: Context-grounded cybersecurity investigation reports mapping observed anomalies to **MITRE ATT&CK for ICS** techniques (e.g., T1048 Exfiltration, T1110 Brute Force, T0814 Control Manipulation), containment options, and explicit confidence/limitation assessments. Operates deterministically offline or integrates with Google Gemini/OpenAI cloud models if configured.
- **Human-in-the-Loop Response Center**: Approval-based containment pipeline (`Proposed` → `Awaiting Approval` → `Approved` → `Simulated Execution` → `Completed`) with operational impact analysis and zero live hardware disruption.
- **Append-Only Forensic Audit Ledger**: Searchable, immutable activity history tracking all alerts, status updates, AI analyses, notes, and containment executions.
- **Dynamic Security Analytics**: Interactive Recharts visualizations displaying traffic telemetry over time, detection categories, severity distributions, and asset risk scores.

---

## 🛡️ Safety & Simulation Statement

> **NOTICE**: ARC runs entirely in a **SIMULATION ENVIRONMENT**. All telemetry, packets, and containment actions are synthetic. ARC never performs commands or modifications against real physical infrastructure or live external networks.

---

## 🚀 Quick Start Instructions

### Prerequisites
- **Node.js** (v18+) and **npm**
- **Python** (v3.9+)

### One-Command Startup
To start both the FastAPI backend and Vite frontend concurrently:

```bash
./run.sh
```

- **Web Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Interactive API Documentation (Swagger)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Manual Startup (Alternative)

#### 1. Backend (FastAPI & Detection Engine)
```bash
cd backend
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend (React + TypeScript + Vite + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```

#### 3. Run Backend Automated Test Suite
```bash
PYTHONPATH=. ./backend/venv/bin/pytest backend/tests
```

---

## 🎯 Live Demonstration Walkthrough (Judge Presentation)

ARC is engineered for a seamless, repeatable hackathon demonstration:

```
[Initial Baseline] ──> [Simulate Threat] ──> [Detect & Alert] ──> [Investigate] ──> [AI Analysis] ──> [Approve & Execute] ──> [Audit & Reset]
```

1. **Step 1: Baseline Telemetry**
   - Open [http://localhost:5173](http://localhost:5173).
   - Observe baseline metrics: 24 Assets Monitored, 95.8% Infrastructure Health, 8 healthy topology nodes.
2. **Step 2: Simulate Suspicious Activity**
   - Click the glowing red **"Simulate Attack"** button in the top navigation bar.
   - A synthetic outbound exfiltration burst (~48.6 MB at 165 req/min) is injected from the **Data Center (AST-003)** to an unauthorized destination (`198.51.100.42:8443`).
3. **Step 3: Automated Detection & Threat Alert**
   - The Detection Engine's Isolation Forest and outbound rate rules flag the anomaly.
   - Active Threats increments, Data Center node shifts to pulsing red, and the **ARC Intelligence** card generates an instant priority alert.
4. **Step 4: Forensic Investigation**
   - Click **"Investigate Threat"** or navigate to **Investigations**.
   - Review observed telemetry features, comparison against historical baseline, and the step-by-step chronological attack timeline.
   - Add an analyst note (e.g., *"Confirmed abnormal egress burst during non-maintenance window"*).
5. **Step 5: ARC Intelligence Assessment**
   - Click **"Run ARC AI Analysis"** (or view the **AI Analysis** tab).
   - Inspect the structured report containing MITRE ATT&CK mapping (`T1048.003 Exfiltration Over Alternative Protocol`), potential consequences, confidence rating, and containment options.
6. **Step 6: Response Center Containment**
   - Navigate to **Response Center**.
   - Review the proposed directive: *"Simulate Network Perimeter Isolation on Data Center (Port 8443)"*.
   - Click **"Approve Response"**, then click **"Execute Simulated Response"** and confirm in the safety modal.
   - The simulated firewall rule drops synthetic egress packets, safely transitioning asset status to `Isolated` and incident status to `Contained`.
7. **Step 7: Verify Audit Trail & Reset**
   - Open **Audit Logs** to verify the complete immutable ledger.
   - Click **"Reset Demo"** in the top bar to return the platform to pristine baseline for the next demonstration.

---

## 🏗️ Project Architecture & Tech Stack

```
arc/
├── run.sh                          # One-command dual service launcher
├── .env.example                    # Environment variable template
├── README.md                       # Comprehensive documentation
├── backend/                        # Python FastAPI service
│   ├── requirements.txt            # FastAPI, Uvicorn, SQLAlchemy, Scikit-Learn
│   ├── arc_cyber.db                # SQLite database (auto-seeded)
│   ├── app/
│   │   ├── main.py                 # FastAPI application & CORS
│   │   ├── database.py             # SQLAlchemy engine & session
│   │   ├── models.py               # ORM Models (Asset, Event, Incident, Response, Audit)
│   │   ├── schemas.py              # Pydantic schemas
│   │   ├── detection.py            # Rule engine & Scikit-Learn IsolationForest
│   │   ├── ai_engine.py            # ARC Intelligence structured generator & LLM fallback
│   │   ├── seed_data.py            # Deterministic critical infrastructure seed data
│   │   └── routers/
│   │       ├── dashboard.py        # KPIs, topology coordinates, and summary feeds
│   │       ├── assets.py           # Asset inventory, search, and detail
│   │       ├── alerts.py           # Security alerts with severity & category filters
│   │       ├── incidents.py        # Incident triage, notes, and timeline
│   │       ├── responses.py        # Containment approval & simulated execution
│   │       ├── analytics.py        # Real-time aggregated trend statistics
│   │       ├── audit.py            # Append-only compliance audit trail
│   │       ├── demo.py             # Live attack simulation & demo reset
│   │       └── settings.py         # Configurable detection thresholds
│   └── tests/
│       └── test_api.py             # Pytest automated test suite
└── frontend/                       # React 18 + TypeScript + Vite + Tailwind CSS
    ├── index.html                  # HTML5 shell with dark mode & Inter font
    ├── vite.config.ts              # Vite config with API proxy
    ├── src/
    │   ├── main.tsx                # React entrypoint
    │   ├── App.tsx                 # Master state & view router
    │   ├── types.ts                # TypeScript interfaces
    │   ├── api.ts                  # REST API client
    │   ├── index.css               # SOC dark palette & radar pulse animations
    │   ├── components/
    │   │   ├── Navbar.tsx          # ARC branding, status, search, and demo triggers
    │   │   ├── Sidebar.tsx         # 9-view persistent navigation
    │   │   ├── TopologyMap.tsx     # Interactive SVG SCADA topology map
    │   │   ├── AssetModal.tsx      # Slide-over asset telemetry inspector
    │   │   └── Toast.tsx           # Toast feedback notifications
    │   └── views/
    │       ├── DashboardView.tsx   # Centerpiece SOC dashboard
    │       ├── InfrastructureView.tsx # Searchable asset inventory
    │       ├── ThreatDetectionView.tsx# Alerts filter & telemetry summary
    │       ├── InvestigationsView.tsx # Deep forensic triage & attack timeline
    │       ├── AIAnalysisView.tsx  # ARC Intelligence structured report
    │       ├── ResponseCenterView.tsx # Approval-based containment workflow
    │       ├── AnalyticsView.tsx   # Interactive Recharts telemetry trends
    │       ├── AuditLogsView.tsx   # Append-only forensic ledger
    │       └── SettingsView.tsx    # Detection thresholds & demo reset
```

---

## 📋 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status & simulation mode |
| `GET` | `/api/dashboard` | Derived KPIs, topology graph, alerts, and AI insights |
| `GET` | `/api/assets` | Query & filter infrastructure asset inventory |
| `GET` | `/api/assets/{id}` | Detailed asset telemetry, connected nodes, & incidents |
| `GET` | `/api/alerts` | Filterable list of security telemetry alerts |
| `GET` | `/api/incidents` | List active & historical security incidents |
| `GET` | `/api/incidents/{id}` | Incident forensics, evidence, and attack timeline |
| `POST` | `/api/incidents/{id}/analyze` | Trigger structured ARC Intelligence assessment |
| `PATCH`| `/api/incidents/{id}/status` | Transition incident triage status |
| `POST` | `/api/incidents/{id}/notes` | Append analyst note to audit trail |
| `GET` | `/api/responses` | List proposed and active containment actions |
| `POST` | `/api/responses/{id}/approve` | Approve containment directive |
| `POST` | `/api/responses/{id}/execute` | Execute simulated containment action |
| `GET` | `/api/analytics` | Real-time aggregated charts data |
| `GET` | `/api/audit-logs` | Immutable audit trail query |
| `POST` | `/api/demo/simulate-event` | Inject synthetic telemetry attack (Demo Step 2) |
| `POST` | `/api/demo/reset` | Restore pristine demonstration dataset (Demo Step 7) |
| `GET` | `/api/settings` | Read detection thresholds & AI configuration |
| `PATCH`| `/api/settings` | Update heuristic detection parameters |

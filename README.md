# Smart Traffic Signal Scheduling Simulator

An interactive full-stack Operating Systems simulator where a smart traffic network behaves like a CPU scheduler:

- Vehicles are processes
- Roads are ready queues
- Green lights are CPU execution windows
- Signal selection policies visualize OS scheduling algorithms in real time

The project includes a React + Tailwind + Framer Motion frontend, a Node.js + Express + WebSocket backend, live analytics dashboards, multi-intersection coordination, algorithm comparison mode, and a lightweight AI traffic prediction module.

## 1. System Architecture

### Core mapping

| Traffic System | Operating System Analogy |
| --- | --- |
| Vehicle | Process |
| Road lane queue | Ready queue |
| Traffic light controller | CPU scheduler |
| Green signal | CPU burst / execution |
| Waiting vehicles | Ready / waiting processes |
| Dynamic density | Runtime workload intensity |

### High-level architecture

```text
Frontend (React/Vite)
  -> WebSocket client for live control/state
  -> Canvas-based simulator
  -> Recharts analytics dashboard
  -> Three.js network preview

Backend (Node/Express/ws)
  -> SimulationManager
  -> TrafficSimulation engine
  -> Scheduling algorithms
  -> Vehicle generation
  -> Metrics analyzer
  -> Heuristic prediction engine
  -> REST + WebSocket APIs
```

### Runtime flow

1. The backend generates vehicles dynamically for each road at every simulation tick.
2. Each intersection evaluates queue pressure and predicted density.
3. The selected scheduler chooses the next road to receive the green light.
4. Vehicles on that road are released through the junction.
5. Metrics are updated and broadcast to all connected clients over WebSockets.
6. The frontend animates queues, departures, signals, comparison panels, and charts.

## 2. Backend Implementation

Backend source lives in [backend/src](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/backend/src).

### Main modules

- [backend/src/server.js](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/backend/src/server.js)
  Exposes REST endpoints and attaches the WebSocket server.
- [backend/src/trafficController/SimulationManager.js](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/backend/src/trafficController/SimulationManager.js)
  Coordinates the live scenario, comparison scenarios, ticking loop, and broadcasts.
- [backend/src/trafficController/TrafficSimulation.js](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/backend/src/trafficController/TrafficSimulation.js)
  Runs the actual intersection network simulation.
- [backend/src/vehicleGenerator/index.js](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/backend/src/vehicleGenerator/index.js)
  Creates deterministic dynamic traffic demand and vehicle batches.
- [backend/src/analytics/metricsAnalyzer.js](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/backend/src/analytics/metricsAnalyzer.js)
  Tracks throughput, delay, waiting time, queue pressure, and efficiency.
- [backend/src/predictionEngine/heuristicModel.js](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/backend/src/predictionEngine/heuristicModel.js)
  Predicts traffic density and recommends scheduling behavior.
- [backend/src/websocket/socketServer.js](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/backend/src/websocket/socketServer.js)
  Handles live client connections and simulator control messages.

### REST endpoints

- `GET /api/health`
- `GET /api/state`
- `POST /api/control`
- `POST /api/config`

### WebSocket message types

- `control`
  Example: `{ "type": "control", "action": "start" }`
- `configure`
  Example: `{ "type": "configure", "payload": { "algorithm": "priority", "quantum": 4 } }`
- `state:init`
- `state:update`
- `system:ack`
- `system:error`

## 3. Scheduling Algorithms Code

Algorithm implementations live in [backend/src/scheduler](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/backend/src/scheduler).

### FCFS

- File: [fcfs.js](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/backend/src/scheduler/fcfs.js)
- Behavior: chooses the road whose head vehicle arrived first
- Scheduling style: non-preemptive
- Use case: light and balanced traffic where fairness by arrival order is desired

### Round Robin

- File: [roundRobin.js](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/backend/src/scheduler/roundRobin.js)
- Behavior: rotates green signal ownership among non-empty queues
- Scheduling style: time-quantum based
- Use case: sustained load where fairness across roads matters

### Priority Scheduling

- File: [priority.js](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/backend/src/scheduler/priority.js)
- Behavior: selects the road with the strongest composite priority score
- Inputs:
  - queue length
  - head-of-line waiting age
  - predicted density
  - emergency vehicle boost
- Use case: uneven surges and high congestion hotspots

## 4. Frontend React Components

Frontend source lives in [frontend/src](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/frontend/src).

### Routing and state

- [frontend/src/App.jsx](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/frontend/src/App.jsx)
  Route-level lazy loading for production-friendly bundles.
- [frontend/src/hooks/SimulationContext.jsx](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/frontend/src/hooks/SimulationContext.jsx)
  Global live state, WebSocket lifecycle, control actions, and HTTP fallback.

### Main pages

- [HomePage.jsx](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/frontend/src/pages/HomePage.jsx)
- [SimulationPage.jsx](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/frontend/src/pages/SimulationPage.jsx)
- [DashboardPage.jsx](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/frontend/src/pages/DashboardPage.jsx)
- [MultiIntersectionPage.jsx](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/frontend/src/pages/MultiIntersectionPage.jsx)

### Key UI components

- [AppShell.jsx](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/frontend/src/components/Layout/AppShell.jsx)
- [AlgorithmSelector.jsx](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/frontend/src/components/AlgorithmSelector/AlgorithmSelector.jsx)
- [SimulationControls.jsx](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/frontend/src/components/Simulation/SimulationControls.jsx)
- [IntersectionPanel.jsx](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/frontend/src/components/Intersection/IntersectionPanel.jsx)
- [ComparisonPanel.jsx](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/frontend/src/components/Simulation/ComparisonPanel.jsx)

## 5. Visualization Engine

### 2D top-down simulation

The main intersection visualization is powered by [IntersectionCanvas.jsx](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/frontend/src/components/Intersection/IntersectionCanvas.jsx).

It renders:

- lane geometry
- signal states
- queue depth
- animated departures
- emergency vehicle highlighting
- scheduler decision text overlays

### Motion layer

- Framer Motion is used for staged card reveals and polished dashboard transitions.
- Tailwind CSS drives the game-like visual styling and glassmorphism panels.
- Canvas handles the actual live simulation rendering for better control over animated traffic.

### Optional 3D preview

[IntersectionThreeView.jsx](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/frontend/src/components/Three/IntersectionThreeView.jsx) uses React Three Fiber + Drei to show a lightweight 3D intersection status preview for the multi-intersection page.

## 6. Dashboard & Charts

Chart components live in [frontend/src/components/Charts/TrafficCharts.jsx](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/frontend/src/components/Charts/TrafficCharts.jsx).

Included analytics views:

- throughput over time
- delay trend over time
- queue distribution by road
- algorithm comparison radar chart

Dashboard metrics include:

- vehicles processed
- average delay
- throughput
- queue pressure
- efficiency score
- waiting time per road
- live predicted density

## 7. WebSocket Integration

### Client

- [frontend/src/websocket/socketClient.js](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/frontend/src/websocket/socketClient.js)
- Automatically infers the WebSocket URL from `VITE_WS_URL` or `VITE_API_URL`
- Falls back to HTTP control endpoints if the socket is unavailable

### Server

- [backend/src/websocket/socketServer.js](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/backend/src/websocket/socketServer.js)
- Broadcasts every updated simulation snapshot to connected clients

### Real-time control supported

- start
- pause
- reset
- step execution
- algorithm changes
- quantum changes
- service rate changes
- density changes
- comparison mode changes

## 8. AI Prediction Module

The heuristic predictor is implemented in [backend/src/predictionEngine/heuristicModel.js](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/backend/src/predictionEngine/heuristicModel.js).

### Inputs

- recent density history
- current queue length
- short-term density trend
- queue pressure

### Outputs

- predicted incoming density per road
- suggested scheduling algorithm
- adaptive time quantum
- confidence score
- natural-language rationale

### Adaptive behavior

When `adaptiveSignals` is enabled, the live simulator automatically updates the active Round Robin quantum based on predicted load.

## 9. Deployment Guide

### Local development

```bash
npm install
npm run dev
```

This runs:

- frontend on `http://localhost:5173`
- backend on `http://localhost:4000`
- WebSocket endpoint on `ws://localhost:4000/ws`

### Environment setup

Frontend example: [frontend/.env.example](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/frontend/.env.example)

```bash
VITE_WS_URL=ws://localhost:4000
VITE_API_URL=http://localhost:4000
```

Backend example: [backend/.env.example](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/backend/.env.example)

```bash
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
TICK_INTERVAL_MS=900
```

### Frontend deployment on Vercel

1. Create a new Vercel project using the `frontend` directory as the root.
2. Set the build command to `npm run build`.
3. Set the output directory to `dist`.
4. Add environment variables:
   - `VITE_API_URL=https://your-render-backend.onrender.com`
   - `VITE_WS_URL=wss://your-render-backend.onrender.com/ws`
5. Use the config template at [deployment/vercel-config/vercel.json](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/deployment/vercel-config/vercel.json) if you want explicit SPA rewrites.

### Backend deployment on Render

1. Create a new Web Service pointing to the `backend` directory.
2. Build command: `npm install`
3. Start command: `npm run start`
4. Add environment variables:
   - `CLIENT_ORIGIN=https://your-vercel-frontend.vercel.app`
   - `PORT=10000`
   - `TICK_INTERVAL_MS=900`
5. Use the blueprint template at [deployment/render-config/render.yaml](/Users/Rishith%20T/OneDrive/Desktop/projects/os_cbp/deployment/render-config/render.yaml) if you prefer Render YAML provisioning.

### Production build

```bash
npm run build
```

## 10. README Documentation Notes

### Folder structure

```text
traffic-signal-simulator
├── backend
│   ├── src
│   │   ├── analytics
│   │   ├── predictionEngine
│   │   ├── scheduler
│   │   ├── trafficController
│   │   ├── vehicleGenerator
│   │   └── websocket
├── deployment
│   ├── render-config
│   └── vercel-config
├── frontend
│   └── src
│       ├── components
│       ├── hooks
│       ├── pages
│       ├── styles
│       ├── utils
│       └── websocket
└── README.md
```

### Available scripts

At the repo root:

```bash
npm run dev
npm run dev:frontend
npm run dev:backend
npm run build
npm run start
```

### Verified status

The current workspace was verified with:

```bash
npm install
npm run build
```

Both backend and frontend build successfully.

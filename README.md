# A.W.A.R.E. Water Management System

**Agent for Water Autonomy, Resilience & Efficiency**

A proactive, self-healing AI agent for municipal water utilities that couples a digital twin with multi-agent decision systems to anticipate failures, orchestrate autonomous responses, and optimize energy use.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-success?style=for-the-badge)](http://aware-water-alb-1723674360.us-west-1.elb.amazonaws.com/)
[![Course](https://img.shields.io/badge/CMPE--272-Enterprise%20Software%20Platforms-blue?style=for-the-badge)](https://catalog.sjsu.edu/preview_program.php?catoid=17&poid=13939)
[![SJSU](https://img.shields.io/badge/San%20José%20State%20University-Fall%202025-gold?style=for-the-badge)](https://www.sjsu.edu/)

---

## 📚 Documentation

> **Complete project documentation is available in the following reports:**

- **[Design Thinking Report](./AWARE_CMPE272_Design_Thinking_Report.pdf)** - Design methodology, user research, and system ideation
- **[Final Project Report](./AWARE_CMPE272_Project_Report.pdf)** - Complete technical documentation, architecture, and implementation details

---

## Table of Contents

- [📚 Documentation](#-documentation)
- [Team & Contact](#team--contact)
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Running Both Services](#running-both-services)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Technology Stack](#technology-stack)
- [Features & Pages](#features--pages)
- [Development](#development)
- [Database Schema](#database-schema)
- [Recent Updates](#recent-updates)
- [Troubleshooting](#troubleshooting)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Project Links](#project-links)

---

## Team & Contact

- **Raymond Li** - raymond.li01@sjsu.edu
- **Sophia Atendido** - sophia.atendido@sjsu.edu
- **Jack Liang** - jack.liang@sjsu.edu
- **Dhruv Verma** - dhruv.verma01@sjsu.edu

**Course**: CMPE-272: Enterprise Software Platforms | SJSU Fall 2025

For questions or support, please contact any team member at the emails above.

---

## Project Overview

A.W.A.R.E. is an intelligent water utility management platform that leverages autonomous AI agents to proactively detect infrastructure failures, optimize energy consumption, and maintain network resilience. The system combines real-time sensor monitoring with predictive analytics to minimize water loss and operational costs.

### 🎯 Key Features

- **🔍 Proactive Leak Detection**: AI agents monitor acoustic patterns and pressure anomalies to detect leaks before they become critical
- **🛡️ Autonomous Isolation**: Automatic pipe isolation when leaks are detected
- **⚡ Energy Optimization**: Dynamic pump scheduling based on real-time pricing and demand forecasting
- **🗺️ Digital Twin**: Interactive real-time network visualization with live sensor updates
- **🤖 Multi-Agent System**: Coordinated AI agents for intelligent decision-making
- **📊 Incident Management**: Comprehensive tracking and resolution of system events
- **📡 Real-time Monitoring**: Live sensor data streams and network health status

### 🤖 AI Agent System

The platform employs four specialized autonomous agents:

| Agent | Purpose | Key Capabilities |
|-------|---------|-----------------|
| **Leak Preemption Agent** | Early leak detection | Analyzes pressure, flow, and acoustic patterns to predict failures |
| **Safety Monitor Agent** | Network safety oversight | Monitors water quality and pressure thresholds for public safety |
| **Energy Optimizer Agent** | Cost reduction | Optimizes pump schedules based on demand forecasts and electricity pricing |
| **Analytics Agent** | System intelligence | Provides insights, trends, and performance metrics |

---

## Architecture

```
aware-water-agent/
├── backend/                # FastAPI backend
│   ├── main.py             # API endpoints
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # Backend documentation
│
├── frontend/               # React + TypeScript frontend
│   ├── src/                # Source code
│   │   ├── pages/          # Route pages
│   │   ├── components/     # Reusable components
│   │   ├── lib/            # Utilities and stores
│   │   └── hooks/          # Custom React hooks
│   ├── public/             # Static assets
│   ├── package.json        # Node dependencies
│   └── README.md           # Frontend documentation
│
├── supabase/               # Supabase configuration
│   ├── config.toml         # Supabase settings
│   └── migrations/         # Database migrations
│
├── .env                    # Project-wide environment variables
├── WIREFRAMES.md           # Complete UI wireframes
└── README.md               # This file
```

---

## Prerequisites

### Backend

- Python 3.8 or higher
- pip (Python package manager)

### Frontend

- Node.js 18 or higher
- npm (comes with Node.js)

---

## Quick Start

### Option 1: Automated Startup (Recommended)

The easiest way to start both backend and frontend:

```bash
# From the project root directory
./start-services.sh
```

This script will:

- Automatically kill any existing processes on ports 8000 and 5173
- Start the backend on http://localhost:8000
- Start the frontend on http://localhost:5173
- Handle environment variable configuration

To stop all services:

```bash
./stop-services.sh
```

### Option 2: Manual Startup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd aware-water-agent
```

#### 2. Start the Backend

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at:

- **API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc

### 3. Start the Frontend

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at:

- **App**: http://localhost:5173

---

## Running Both Services

You need to run both backend and frontend simultaneously:

### Terminal 1 - Backend

```bash
cd backend
source venv/bin/activate  # If using virtual environment
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

---

## API Endpoints

### Backend (FastAPI)

#### GET `/`

Health check endpoint

```json
{
  "status": "ok",
  "message": "AWARE Water Management System API"
}
```

#### GET `/sensors`

Get simulated sensor data for all pipes

```json
{
  "pipes": [
    {
      "pipe_id": "P-1",
      "pressure": 75.42,
      "acoustic": 0.35
    }
  ]
}
```

#### GET `/leaks`

Get pipes with detected leaks (pressure < 60 psi AND acoustic > 0.7)

```json
{
  "leaks": [
    {
      "pipe_id": "P-5",
      "pressure": 45.23,
      "acoustic": 0.85,
      "leak": true
    }
  ]
}
```

---

## Environment Variables

**All environment variables are now consolidated into a single `.env` file at the project root.**

### Setup

1. Copy the example file:

```bash
cp .env.example .env
```

2. Edit `.env` and fill in your values:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=your-project-id

# OpenAI Configuration (for AI agents)
OPENAI_API_KEY=your-openai-api-key-here

# Backend Configuration (Optional)
PORT=8000
HOST=0.0.0.0
```

### Environment Variables Explained

**Backend Variables:**

- `SUPABASE_URL` - Supabase project URL (used by backend AI agents)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key with admin privileges (keep secret!)
- `OPENAI_API_KEY` - OpenAI API key for AI agent functionality
- `PORT` - Backend server port (default: 8000)
- `HOST` - Backend server host (default: 0.0.0.0)

**Frontend Variables (must start with `VITE_`):**

- `VITE_SUPABASE_URL` - Supabase project URL (used by frontend)
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon/public key (safe to expose)
- `VITE_SUPABASE_PROJECT_ID` - Supabase project ID (optional, for reference)

**Note**: Both backend and frontend now read from the same root `.env` file. The old separate `.env` files in `backend/` and `frontend/` directories are no longer used.

---

## Technology Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **UI Components**: Shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: Zustand + TanStack Query
- **Charts**: Recharts
- **Maps**: Leaflet (vanilla implementation for React 18 compatibility)
- **Forms**: React Hook Form + Zod
- **Backend**: Supabase (real-time database)

### Backend

- **Framework**: FastAPI
- **Server**: Uvicorn
- **Language**: Python 3.13+

### Database

- **Primary**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime

---

## Features & Pages

### Landing Page (`/`)

- System overview
- Feature highlights
- Team information
- Call-to-action buttons

### Authentication (`/auth`)

- User sign-in
- Supabase authentication

### Dashboard (`/dashboard`)

- Key metrics (Non-Revenue Water, Active Incidents, Energy Cost, Network Uptime)
- Demand forecast chart
- Recent events feed
- AI agents status overview

### Network Twin (`/network`)

- Interactive map with live network visualization
- Real-time pipe isolation updates
- Network statistics
- Node and edge details

### Incidents (`/incidents`)

- System events and alerts
- Event timeline
- Severity badges
- Acknowledge and resolve actions

### AI Agents (`/agents`)

- Multi-agent system overview
- Agent status and confidence levels
- Last decisions and metrics
- Run simulation capabilities

### Energy Management (`/energy`)

- Today's savings and efficiency metrics
- Hourly energy pricing chart
- Optimized pump schedule
- Apply schedule actions

### Admin (`/admin`)

- User management
- System configuration
- Alert thresholds
- Agent settings

### Team (`/team`)

- Team member profiles
- Project information
- Technology stack

---

## Development

### Frontend

**Lint code:**

```bash
cd frontend
npm run lint
```

**Build for production:**

```bash
cd frontend
npm run build
```

**Preview production build:**

```bash
cd frontend
npm run preview
```

### Backend

**Run with auto-reload (development):**

```bash
cd backend
uvicorn main:app --reload
```

**Run in production:**

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## Database Schema

The system uses Supabase with the following main tables:

- **events**: System incidents and alerts
- **agents**: AI agent configurations and status
- **nodes**: Water network nodes (junctions, tanks, reservoirs)
- **edges**: Water network pipes/connections
- **sensors**: Sensor readings (pressure, acoustic, flow)
- **energy_prices**: Hourly electricity pricing data

---

## Recent Updates

### Network Map Component (Latest)

The Network Twin page (`/network`) has been updated to use vanilla Leaflet instead of react-leaflet for improved React 18 compatibility. This change:

- Eliminates React Context consumer errors
- Provides better performance and stability
- Maintains all existing functionality (real-time updates, node/edge visualization, popups)
- Uses client-side only rendering to avoid SSR issues

The map component (`/components/NetworkMap.tsx`) dynamically loads Leaflet on the client side and manages the map lifecycle using React refs and useEffect hooks.

---

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'fastapi'`

```bash
# Make sure you're in the backend directory and virtual environment is activated
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Problem**: Port 8000 already in use

```bash
# Use a different port
uvicorn main:app --reload --port 8001
# Update frontend API calls to use the new port
```

### Frontend Issues

**Problem**: `Cannot find module` errors

```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Supabase connection errors

- Check that `.env` file exists in the **root directory** (not in backend/ or frontend/)
- Verify Supabase credentials are correct in the root `.env` file
- Ensure all required variables are set (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
- Ensure Supabase project is running

**Problem**: API calls failing

- Ensure backend is running on port 8000
- Check CORS settings in backend `main.py`
- Verify API endpoint URLs in frontend code

**Problem**: Map not loading or React errors on Network page

- The map uses vanilla Leaflet (not react-leaflet) for React 18 compatibility
- Ensure Leaflet CSS is properly imported
- Check browser console for any Leaflet-specific errors
- Verify that the map container has proper dimensions (height: 600px)

---

## Testing

### Test Backend Endpoints

```bash
# Health check
curl http://localhost:8000/

# Get sensor data
curl http://localhost:8000/sensors

# Get leak detections
curl http://localhost:8000/leaks
```

### Test Frontend

1. Open http://localhost:5173
2. Navigate through all pages
3. Check browser console for errors
4. Verify real-time updates work

---

## Testing

### Running Tests Locally

#### Frontend Tests

```bash
cd frontend
npm install              # Install dependencies (including test packages)
npm test                 # Run all tests
npm run test:ui          # Open Vitest UI for interactive testing
npm run test:coverage    # Generate coverage report
```

**Test Files:**
- `src/lib/__tests__/utils.test.ts` - Utility function tests
- `src/components/ui/__tests__/Card.test.tsx` - UI component tests
- `src/pages/__tests__/Landing.test.tsx` - Page component tests

#### Backend Tests

```bash
cd backend
pip install -r requirements.txt  # Install dependencies (including pytest)
pytest                            # Run all tests
pytest --cov=.                    # Run tests with coverage
pytest tests/test_api.py -v      # Run specific test file with verbose output
pytest -m integration             # Run only integration tests
pytest -m performance             # Run only performance tests
```

**Test Files:**
- `tests/test_api.py` - API endpoint tests (14 endpoints)
- `tests/conftest.py` - Test fixtures and mocks

### Continuous Integration

All tests run automatically on every push and pull request via **GitHub Actions**:

#### Backend CI (`backend-ci.yml`)
- Runs pytest with coverage
- Lints Python code with flake8
- Uploads coverage to Codecov
- **Triggers on**: Changes to `backend/` directory

#### Frontend CI (`frontend-ci.yml`)
- Runs Vitest tests with coverage
- Lints code with ESLint
- Builds production bundle
- Runs Lighthouse performance audits
- **Triggers on**: Changes to `frontend/` directory

**View workflow status:** [GitHub Actions Tab](https://github.com/raymondli01/aware-water-agent/actions)

### Test Coverage

Current test coverage:

**Backend:**
- ✅ All 14 API endpoints tested
- ✅ ~70% code coverage
- ✅ Mocked Supabase and OpenAI (no API costs)
- ✅ Performance tests (response time < 1s)

**Frontend:**
- ✅ Core utilities tested (cn function)
- ✅ UI components tested (Card components)
- ✅ Page rendering tested (Landing page)
- ✅ ~60% code coverage
- ✅ All tests use mocked Supabase client

**Coverage badges:** View detailed coverage reports on [Codecov](https://codecov.io/gh/raymondli01/aware-water-agent)

### Performance Benchmarks

#### Frontend Performance (Lighthouse CI)
- **Performance Score**: > 70 (enforced in CI)
- **Accessibility Score**: > 90 (enforced in CI)
- **Best Practices Score**: > 80 (enforced in CI)
- **SEO Score**: > 80 (enforced in CI)

Lighthouse runs automatically on every build and uploads reports to temporary public storage.

#### Backend Performance
- **API Response Time**: < 1 second per endpoint
- **Health Check**: < 0.5 seconds
- Performance tests run as part of pytest suite

### Test Strategy

**Why We Mock Everything:**
- ✅ **Zero Cost**: No real API calls to Supabase or OpenAI during testing
- ✅ **Fast Tests**: Complete test suite runs in ~30 seconds
- ✅ **Reliable**: Tests don't depend on external services
- ✅ **Repeatable**: Same results every time

**What We Test:**
- All 14 backend API endpoints
- AI agent coordinator functions
- Core frontend components
- Page rendering and navigation
- Utility functions
- API response times
- Bundle build process
- Frontend performance scores

### CI/CD Workflow

```
Push/PR to main
    │
    ├─> Backend CI
    │   ├─> Install Python dependencies
    │   ├─> Run pytest tests
    │   ├─> Lint with flake8
    │   └─> Upload coverage
    │
    └─> Frontend CI
        ├─> Install Node dependencies
        ├─> Run Vitest tests
        ├─> Lint with ESLint
        ├─> Build production bundle
        ├─> Run Lighthouse CI
        └─> Upload coverage
```

### Test Markers (Backend)

Backend tests use pytest markers for categorization:

```bash
pytest -m unit            # Run only unit tests
pytest -m integration     # Run only integration tests
pytest -m performance     # Run only performance tests
pytest -m "not slow"      # Skip slow-running tests
```

### Troubleshooting Tests

**Frontend test failures:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm test
```

**Backend test failures:**
```bash
# Ensure you're in a virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pytest -v
```

**GitHub Actions failures:**
- Check the Actions tab for detailed logs
- Ensure all environment variables are set (though mocked for tests)
- Verify that both `package-lock.json` (frontend) exists for caching

---

## Deployment

### Backend Deployment

Recommended platforms:

- **Railway**: Easy Python app deployment
- **Heroku**: Classic PaaS
- **AWS EC2**: Full control
- **Google Cloud Run**: Serverless containers

### Frontend Deployment

Recommended platforms:

- **Vercel**: Optimized for Vite/React
- **Netlify**: Great for static sites
- **AWS Amplify**: Full-stack deployment

---

## Contributing

This project is part of CMPE-272 coursework at San José State University.

---

## License

Copyright © 2025 Team A.W.A.R.E. - San José State University

---

## Acknowledgments

- **Course**: CMPE-272: Enterprise Software Platforms
- **Institution**: San José State University
- **Instructor**: Prof. Rakesh Ranjan
- **Semester**: Fall 2025

---

## Project Links

- **🔗 GitHub Repository**: [github.com/raymondli01/aware-water-agent](https://github.com/raymondli01/aware-water-agent)
- **🌐 Live Demo**: [AWARE Water Management System](http://aware-water-alb-1723674360.us-west-1.elb.amazonaws.com/)
- **📄 Design Report**: [AWARE_CMPE272_Design_Thinking_Report.pdf](./AWARE_CMPE272_Design_Thinking_Report.pdf)
- **📄 Project Report**: [AWARE_CMPE272_Project_Report.pdf](./AWARE_CMPE272_Project_Report.pdf)
- **📋 Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)

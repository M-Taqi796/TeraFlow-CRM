<div align="center">
  <img src="client/public/logo.png" alt="TeraFlow CRM Logo" height="72" />

  # TeraFlow CRM

  **A modern, full-featured Customer Relationship Management platform**  
  built for sales teams who move fast and close deals faster.

  ![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?style=flat-square&logo=typescript)
  ![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?style=flat-square&logo=tailwindcss)
  ![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
  - [Building for Production](#building-for-production)
- [Application Walkthrough](#application-walkthrough)
- [Architecture](#architecture)
- [Design System](#design-system)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

TeraFlow CRM is a sleek, dark-mode-first CRM platform designed to help sales professionals manage their entire pipeline in one place — from leads and calls to meetings, tasks, and email outreach. Built with React 19 and TypeScript, it delivers a snappy, desktop-grade experience right in the browser.

---

## Features

| Feature | Status |
|---|---|
| 🔐 Login / Authentication UI | ✅ Done |
| 📊 Dashboard with Metrics & KPIs | ✅ Done |
| 📋 Task Management with Completion Flow | ✅ Done |
| 📅 Meetings Table with Status Updates | ✅ Done |
| 🍩 Donut Chart for Lead Breakdown | ✅ Done |
| 🌙 Dark / Light Theme Toggle | ✅ Done |
| 👤 Leads Management | 🚧 In Progress |
| 📞 Call Log | 🚧 In Progress |
| ✉️ Email Outreach | 🚧 In Progress |
| 📥 Imports | 🚧 In Progress |
| ⚙️ Settings | 🚧 In Progress |

---

## Tech Stack

### Frontend (`/client`)

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 19 | UI framework |
| [TypeScript](https://www.typescriptlang.org) | ~6.0 | Type safety |
| [Vite](https://vitejs.dev) | 8 | Dev server & bundler |
| [React Router DOM](https://reactrouter.com) | 7 | Client-side routing |
| [Tailwind CSS](https://tailwindcss.com) | 3 | Utility-first styling |
| [Heroicons](https://heroicons.com) | 2 | SVG icon library |
| [clsx](https://github.com/lukeed/clsx) | 2 | Conditional class names |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | 3 | Conflict-free Tailwind classes |
| [OXLint](https://oxc.rs/docs/guide/usage/linter) | 1 | Fast linting |

### Backend (`/server`)

> 🚧 Server is not yet implemented. Backend architecture and API documentation will be added here as the server is built out.

---

## Project Structure

```
TeraFlow CRM/
├── client/                        # Frontend application (React + Vite)
│   ├── public/                    # Static assets (logo, icons, illustrations)
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/         # Dashboard-specific components
│   │   │   │   ├── DonutChart/    # Lead breakdown donut chart
│   │   │   │   ├── MeetingsTable/ # Meetings list with filters & status
│   │   │   │   └── MetricCard/    # KPI summary cards
│   │   │   ├── layout/            # App-level layout components
│   │   │   │   ├── AppShell/      # Main layout wrapper (sidebar + header + content)
│   │   │   │   ├── Header/        # Top navigation bar
│   │   │   │   ├── Sidebar/       # Left navigation sidebar
│   │   │   │   └── Taskbar/       # Slide-out task panel
│   │   │   ├── navigation/
│   │   │   │   └── NavItem/       # Sidebar navigation item
│   │   │   ├── tasks/
│   │   │   │   ├── TaskCard/      # Individual task display card
│   │   │   │   ├── TaskCompleteModal/ # Modal for completing a task with a comment
│   │   │   │   └── TaskList/      # Scrollable task list
│   │   │   └── ui/
│   │   │       ├── Backdrop/      # Modal backdrop overlay
│   │   │       ├── Modal/         # Reusable modal primitive
│   │   │       └── ThemeToggle/   # Dark / Light mode toggle button
│   │   ├── context/
│   │   │   └── ThemeContext.tsx   # Global theme context (dark/light)
│   │   ├── data/                  # Seed/mock data for development
│   │   │   ├── meetings.data.ts
│   │   │   ├── metrics.data.ts
│   │   │   ├── navigation.data.ts
│   │   │   └── tasks.data.ts
│   │   ├── hooks/
│   │   │   └── useTheme.ts        # Custom hook to consume ThemeContext
│   │   ├── routes/
│   │   │   ├── DashboardRoute.tsx # Main dashboard page
│   │   │   ├── LoginRoute.tsx     # Login/authentication page
│   │   │   └── PlaceholderRoutes.tsx # Stub routes for upcoming sections
│   │   ├── types/                 # Shared TypeScript type definitions
│   │   │   ├── meeting.types.ts
│   │   │   ├── metrics.types.ts
│   │   │   └── task.types.ts
│   │   ├── App.tsx                # Root component & route configuration
│   │   ├── main.tsx               # Application entry point
│   │   └── index.css              # Global styles & Tailwind directives
│   ├── tailwind.config.js         # Tailwind design tokens & theme
│   ├── vite.config.ts             # Vite build configuration
│   └── package.json
├── server/                        # Backend application (coming soon)
├── TeraFlow CRM SRS - 1.docx      # Software Requirements Specification
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- **Node.js** ≥ 18.x — [Download](https://nodejs.org)
- **npm** ≥ 9.x (bundled with Node.js)
- **Git** — [Download](https://git-scm.com)

Verify your setup:
```bash
node -v
npm -v
git --version
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd "TeraFlow CRM"
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

### Running Locally

Start the Vite development server with hot-module replacement:

```bash
cd client
npm run dev
```

The app will be available at **[http://localhost:5173](http://localhost:5173)**.

> **Default credentials (dev mode):** Any email/password combination will log you in while the backend is not connected.

### Building for Production

Generate an optimised static build:

```bash
cd client
npm run build
```

Output is placed in `client/dist/`. Preview the production build locally:

```bash
npm run preview
```

---

## Application Walkthrough

### Login Page (`/login`)
The branded login page with the TeraFlow logo and an illustration. Enter any credentials to proceed to the dashboard.

### Dashboard (`/dashboard`)
The main command centre of the application:

- **Metric Cards** — At-a-glance KPIs for Leads, Revenue, Meetings, and Tasks.
- **Donut Chart** — Visual breakdown of leads by stage/status.
- **Meetings Table** — View scheduled and completed meetings; update statuses inline.
- **Taskbar** — A slide-out panel accessible from the header showing active and completed tasks, with a completion flow that opens a comment modal.

### Navigation
Use the **left sidebar** to switch between modules:

> Dashboard · Leads · Call Log · Tasks · Meetings · Email Outreach · Imports · Settings

Badge counters on navigation items reflect live data (e.g., active task count, scheduled meeting count).

### Theme Toggle
Click the **moon/sun icon** in the header to switch between Dark and Light modes. The preference is applied instantly via a CSS class on the `<html>` element.

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│                    Browser                       │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │              ThemeProvider                  │ │
│  │  ┌─────────────────────────────────────┐   │ │
│  │  │          BrowserRouter              │   │ │
│  │  │  /login  →  LoginRoute             │   │ │
│  │  │  /dashboard → DashboardApp         │   │ │
│  │  │    ┌────────────────────────────┐  │   │ │
│  │  │    │         AppShell           │  │   │ │
│  │  │    │  Sidebar | Header | Main   │  │   │ │
│  │  │    │         Taskbar            │  │   │ │
│  │  │    └────────────────────────────┘  │   │ │
│  │  └─────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**State Management:** Application state (meetings, tasks) is lifted to the `DashboardApp` component and passed down via props. No external state library is used — React's built-in `useState` is sufficient for the current scope. When the backend is integrated, this layer will migrate to a server-state solution (e.g., React Query / TanStack Query).

**Routing:** React Router v7 handles client-side routing. The root `/` redirects to `/login`. The `/dashboard` route renders the full `AppShell` with internal navigation handled via `selectedNav` state (not URL-based sub-routes).

---

## Design System

TeraFlow uses a custom Tailwind theme with semantic design tokens defined in `tailwind.config.js` and `client/src/index.css`.

### Color Palette

| Token | Light | Dark | Usage |
|---|---|---|---|
| `primary` | `#007DDC` | `#007DDC` | Buttons, highlights, links |
| `surface` | `#FFFFFF` | `#2C2C2C` | Card & panel backgrounds |
| `surface-alt` | `#F9FAFB` | `#1f1f1f` | Page & sidebar backgrounds |
| `border` | `#E5E7EB` | `#3f3f3f` | Dividers, card outlines |

### Typography

| Font | Role |
|---|---|
| **Fira Sans** | Primary UI font (all weights) |

### Dark Mode

Dark mode is toggled via the `dark` class on `<html>` (Tailwind `darkMode: 'class'`). CSS custom properties (`--color-*`) switch accordingly, ensuring all components adapt automatically.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** and ensure the linter passes:
   ```bash
   cd client && npm run lint
   ```
3. **Commit** your changes with a clear message following the convention below.
4. **Push** to your fork and open a **Pull Request**.

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | When to use |
|---|---|
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `style:` | CSS/UI-only changes |
| `refactor:` | Code refactoring (no feature or fix) |
| `chore:` | Build, config, or tooling updates |
| `docs:` | Documentation changes |

---

## License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ by the TeraFlow team
</div>

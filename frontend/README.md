# BantayKalusugan Frontend

The frontend for BantayKalusugan is a modern React application built with [Vite](https://vite.dev/), [React Router](https://reactrouter.com/), and [Recharts](https://recharts.org/).

## Prerequisites

- Node.js 20+
- npm 10+
- A running BantayKalusugan backend server (default: `http://localhost:8000`)

## Installation

From the `frontend` folder:

```powershell
npm install
```

## Environment Configuration

Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

Ensure `frontend/.env` points to your backend instance:

```env
# Local development:
VITE_API_BASE_URL=http://localhost:8000

# Production (e.g. Render):
# VITE_API_BASE_URL=https://your-backend.onrender.com
```

## Running Locally

Start the Vite development server:

```powershell
npm run dev
```

The application will be served at `http://localhost:5173`.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite dev server with hot module replacement (HMR) |
| `npm run build` | Compiles the production build into `dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs ESLint across the codebase |
| `npm run test` | Runs the Vitest test suite once (`vitest run`) |
| `npm run test:watch` | Runs the Vitest test suite in interactive watch mode |

## Testing

Run tests and ensure components pass:

```powershell
npm run test
```

## Features & Modules

- **Authentication**: Patient & Admin login, Registration, Protected routes
- **Patient Portal**: Vitals tracking, Analytics, Chat, Appointment Schedules, User Profile
- **Admin Dashboard**: Patient directory, Health reports, OCR paper trail management, Audit logs, and Admin settings

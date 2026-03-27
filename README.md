# Cyber Security Training Web App

A full-stack web application for delivering cybersecurity awareness training to employees. The platform supports role-based access for employees, managers, and admins, offering interactive lessons, quizzes, progress tracking, leaderboards, and badge achievements.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Database Setup](#2-database-setup)
  - [3. Backend Setup](#3-backend-setup)
  - [4. Frontend Setup](#4-frontend-setup)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Deployment](#deployment)
- [User Roles](#user-roles)
- [API Overview](#api-overview)

---

## Overview

The Cyber Security Training Web App helps organizations train their workforce on essential cybersecurity topics. Employees complete lessons organized into tracks (e.g. phishing, password security), take quizzes, write summaries, and earn badges as they progress. Managers and admins can assign lessons, monitor team progress, and generate reports — all from a centralized dashboard.

---

## Features

### Employee
- Browse and complete cybersecurity lessons grouped into four training tracks:
  - **Phishing Awareness**
  - **Password Security**
  - **Data Protection**
  - **Social Engineering**
- Take interactive quizzes with a configurable passing score (default: 80%)
- Write lesson summaries for manager review
- View personal progress and completion history
- Earn badges for completing lessons, full tracks, and mastering all content
- Compete on the team leaderboard

### Manager / Admin
- Create and manage user accounts
- Assign lessons to individual employees or entire departments, with optional deadlines
- View team progress reports with completion rates and quiz scores
- Review employee-submitted lesson summaries
- Monitor badge and achievement status across the team

### Security
- JWT-based authentication with access and refresh tokens
- Passwords hashed with bcryptjs
- Role-based access control (employee / manager / admin)
- HTTP security headers via Helmet.js
- Rate limiting: 20 requests / 15 min on auth routes, 300 requests / 15 min on general API
- Configurable CORS allowed origins

---

## Tech Stack

| Layer      | Technology |
|------------|-----------|
| Frontend   | React 18, Vite 5, React Router v6, Material UI (MUI), Axios |
| Backend    | Node.js, Express.js |
| Database   | PostgreSQL |
| Auth       | JSON Web Tokens (JWT), bcryptjs |
| Security   | Helmet.js, express-rate-limit |
| Deployment | Vercel (frontend) |

---

## Project Structure

```
Cyber-Security-Web-App/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin/        # Admin dashboard, user management, reports
│   │   │   ├── Auth/         # Login and protected route components
│   │   │   └── Employee/     # Lesson viewer, quiz, leaderboard, badges
│   │   ├── context/          # Auth context (global auth state)
│   │   ├── pages/            # Top-level page components
│   │   └── services/         # Axios API service layer
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                   # Express backend
│   ├── config/               # Database connection
│   ├── db/
│   │   ├── schema.sql        # Database schema
│   │   └── seeds.sql         # Seed data
│   ├── middleware/           # Auth and role-check middleware
│   ├── routes/               # API route handlers
│   ├── utils/                # Token utilities
│   ├── .env.example
│   ├── package.json
│   └── server.js             # Express app entry point
└── vercel.json               # Vercel deployment config
```

---

## Prerequisites

Make sure you have the following installed before setting up the project:

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/) v9 or later
- [PostgreSQL](https://www.postgresql.org/) v14 or later

---

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/omgitzturner/Cyber-Security-Web-App.git
cd Cyber-Security-Web-App
```

### 2. Database Setup

Create a new PostgreSQL database and then apply the schema and (optionally) the seed data:

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE cybertraining;"

# Apply the schema
psql -U postgres -d cybertraining -f server/db/schema.sql

# (Optional) Load seed data
psql -U postgres -d cybertraining -f server/db/seeds.sql
```

### 3. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create environment file from the example and fill in your values
cp .env.example .env
```

Edit `server/.env` with your configuration (see [Environment Variables](#environment-variables)).

### 4. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Create environment file from the example and fill in your values
cp .env.example .env
```

Edit `client/.env` with your configuration (see [Environment Variables](#environment-variables)).

---

## Environment Variables

### Backend (`server/.env`)

| Variable              | Description                                                | Example |
|-----------------------|------------------------------------------------------------|---------|
| `DATABASE_URL`        | PostgreSQL connection string                               | `postgresql://user:pass@localhost:5432/cybertraining` |
| `JWT_SECRET`          | Secret key for signing access tokens (min. 32 characters)  | `your-super-secret-jwt-key-min-32-chars` |
| `JWT_REFRESH_SECRET`  | Secret key for signing refresh tokens (min. 32 characters) | `your-super-secret-refresh-key-min-32-chars` |
| `PORT`                | Port the Express server listens on                         | `5000` |
| `NODE_ENV`            | Environment mode (`development` or `production`)           | `development` |
| `ALLOWED_ORIGINS`     | *(Optional, production)* Comma-separated list of allowed CORS origins | `https://your-app.vercel.app` |

### Frontend (`client/.env`)

| Variable       | Description                          | Example |
|----------------|--------------------------------------|---------|
| `VITE_API_URL` | Base URL of the backend API          | `http://localhost:5000` |

---

## Running the App

Open **two terminal windows** — one for the backend and one for the frontend.

**Terminal 1 — Backend (from the `server/` directory):**

```bash
# Development (auto-reloads on file changes)
npm run dev

# Production
npm start
```

The server will start on `http://localhost:5000` (or the port set in `PORT`).

**Terminal 2 — Frontend (from the `client/` directory):**

```bash
# Development server with hot reload
npm run dev
```

The frontend will be available at `http://localhost:5173`. During development, Vite proxies all `/api` requests to the backend automatically.

**Build for production:**

```bash
npm run build       # Outputs to client/dist/
npm run preview     # Preview the production build locally
```

---

## Deployment

The frontend is configured for deployment to [Vercel](https://vercel.com/) via `vercel.json`.

Set the following environment variable in your Vercel project settings:

| Variable       | Value |
|----------------|-------|
| `VITE_API_URL` | URL of your deployed backend API |

The backend can be deployed to any Node.js-compatible host (e.g. Railway, Render, Fly.io). Make sure to set all backend environment variables in your hosting provider's settings and set `ALLOWED_ORIGINS` to the URL of your deployed frontend.

---

## User Roles

| Role       | Permissions |
|------------|-------------|
| `employee` | View and complete lessons, take quizzes, write summaries, view leaderboard and badges |
| `manager`  | All employee permissions + assign lessons, view team reports and summaries |
| `admin`    | All manager permissions + manage user accounts |

---

## API Overview

All API routes are prefixed with `/api`.

| Route prefix         | Description |
|----------------------|-------------|
| `/api/auth`          | Login, logout, token refresh |
| `/api/users`         | User management (admin/manager) |
| `/api/lessons`       | Lesson listing and content |
| `/api/progress`      | User progress tracking |
| `/api/assignments`   | Lesson assignment management |
| `/api/leaderboard`   | Team leaderboard scores |

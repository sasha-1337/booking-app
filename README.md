# 🏢 Conference Room Booking System

<p align="center">
  🌐 <strong>Language / Мова:</strong> 
  <b>English</b> | 
  <a href="README.uk.md">Українська</a>
</p>

> A modern full-stack solution for conference room discovery, dynamic time-tiered pricing calculations, collision-free slot reservations, and administrative management.

[![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-EF%20Core%209-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest%20Passed-449C44?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Security](https://img.shields.io/badge/Security-Strict%20Env%20Isolation-green)](#-data-security--configuration)

---

## 📌 Table of Contents
- [Project Overview](#-project-overview)
- [Architecture & Key Features](#-architecture--key-features)
  - [Dynamic Pricing Engine](#-dynamic-pricing-engine)
  - [Double-Booking Prevention & Concurrency](#-double-booking-prevention)
  - [Background Cleanup Service](#-background-cleanup-service)
- [Technology Stack](#-technology-stack)
- [Data Security & Configuration](#-data-security--configuration)
- [Repository Structure](#-repository-structure)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup (.NET 10 + PostgreSQL)](#1-backend-setup)
  - [2. Frontend Setup (React 18 + Vite)](#2-frontend-setup)
- [REST API Specification](#-rest-api-specification)
- [Testing Suite](#-testing-suite)
- [Author](#-author)

---

## 🌟 Project Overview

**Conference Room Booking System** addresses modern workspace booking challenges by eliminating scheduling conflicts ("double bookings") and providing instant, transparent cost estimation that accounts for multi-tier hourly rates, peak/off-peak adjustments, and additional equipment/services (such as Wi-Fi, projectors, sound systems).

### Key Highlights:
- 🔍 **Interactive Room Discovery & Filtering**: Search by reservation date, start/end time slots, minimum capacity, and sorting (by price, capacity, or name).
- ⚡ **Real-Time Billing Engine**: Instant recalculation of total cost upon toggling add-on services or adjusting duration without round-trip UI lag.
- 🛡️ **Guaranteed Concurrency Safety**: Serializable database transactions prevent race conditions; holds selected slots for 15 minutes in `Pending` state.
- ⏳ **Automated Hold Expiration**: A dedicated background worker periodically expires unconfirmed holds and releases reserved slots.
- 🛠️ **Administrative Workspace**: Full CRUD capabilities for rooms, custom service mappings, and non-destructive soft-delete workflow.
- 🌓 **Refined UI/UX**: Responsive slide-over booking drawer (Sheet), persistent Dark/Light mode theming, and full ARIA accessibility (Radix UI).
- 🔄 **Dual Mode Support**: Works standalone with Mock Service Worker (MSW) for immediate client evaluation, or connected directly to the ASP.NET Core API + PostgreSQL backend.

---

## 🏗️ Architecture & Key Features

```text
               ┌────────────────────────────────────────────────────────┐
               │              Frontend (React 18 + Vite)                │
               │  • TanStack Query     • Radix UI / Tailwind CSS        │
               │  • Zod Validation     • Real-time Pricing Engine       │
               └─────────────────┬──────────────────────┬───────────────┘
                                 │                      │
           VITE_USE_MOCKS=false  │                      │ VITE_USE_MOCKS=true
                                 ▼                      ▼
               ┌──────────────────────────────┐   ┌───────────────────────┐
               │    ASP.NET Core REST API     │   │ Mock Service Worker   │
               │  • PricingCalculator         │   │ (In-Browser Emulation)│
               │  • BookingService            │   └───────────────────────┘
               │  • RoomManagementService     │
               │  • ExpiredBookingCleanup     │
               └──────────────┬───────────────┘
                              ▼
               ┌──────────────────────────────┐
               │     PostgreSQL Database      │
               │  (Entity Framework Core 9)   │
               └──────────────────────────────┘
```

### 💰 Dynamic Pricing Engine
The pricing algorithm is mirrored identically in both backend (`PricingCalculator.cs`) and frontend (`pricing.ts`), ensuring zero-latency client feedback and backend validation:

$$\text{Total Cost} = \sum (\text{Segment Hours} \times \text{Base Hourly Rate} \times \text{Multiplier}) + \sum (\text{Selected Service Prices})$$

Hourly Multiplier Schedule:
- **06:00 – 09:00**: Morning Discount of 10% (multiplier `0.90`)
- **09:00 – 12:00**: Standard Rate (multiplier `1.00`)
- **12:00 – 14:00**: Peak Hour Surcharge of 15% (multiplier `1.15`)
- **14:00 – 18:00**: Standard Rate (multiplier `1.00`)
- **18:00 – 23:00**: Evening Discount of 20% (multiplier `0.80`)

### 🔒 Double-Booking Prevention
- New bookings are evaluated and inserted within an explicit database transaction set to `IsolationLevel.Serializable`.
- Initial reservation status is set to `Pending` with a 15-minute expiration deadline (`HoldExpiresAtUtc = Now + 15 min`).
- Overlapping booking attempts during an active hold or confirmed state result in an immediate `409 Conflict` response complying with RFC 7807 ProblemDetails.

### ⏱️ Background Cleanup Service
The hosted `ExpiredBookingCleanupService` runs as a .NET `BackgroundService` checking on a 1-minute cadence:
- Scans for reservations remaining in `Pending` status whose `HoldExpiresAtUtc` has passed.
- Automatically transitions them to `Expired` status in batch using EF Core `ExecuteUpdateAsync`, freeing the time slot for other users without manual intervention.

---

## 💻 Technology Stack

### Backend
- **Platform**: .NET 10.0 (C# 13)
- **Framework**: ASP.NET Core Web API
- **ORM**: Entity Framework Core 9.0 (Code-First)
- **Database**: PostgreSQL (via `Npgsql.EntityFrameworkCore.PostgreSQL`)
- **API Spec**: Microsoft.AspNetCore.OpenApi / Swagger

### Frontend
- **Framework**: React 18.3, TypeScript 5.7
- **Bundler**: Vite 5
- **Styling**: Tailwind CSS, CSS Custom Properties (Theme Switcher)
- **UI Components**: Radix UI Primitives, Lucide Icons, Sonner (Toasts)
- **Data Fetching & Cache**: TanStack Query (React Query v5)
- **Forms & Validation**: React Hook Form + Zod
- **Mocking**: Mock Service Worker (MSW v2)
- **Testing**: Vitest, React Testing Library, JSDOM

---

## 🔐 Data Security & Configuration

This project adheres strictly to **Zero Secrets in Source Control** principles:

1. **Environment Isolation**:
   - Local environment files (`.env`, `.env.local`, `.env.production`) and sensitive local database configurations are ignored via [.gitignore](file:///c:/Users/Admin/Desktop/BookingApp/.gitignore) and will **never** be committed to public repositories.
   - Clean, safe configuration templates are provided: [`frontend/.env.example`](file:///c:/Users/Admin/Desktop/BookingApp/frontend/.env.example) and [`appsettings.example.json`](file:///c:/Users/Admin/Desktop/BookingApp/appsettings.example.json).

2. **Connection Strings & Secrets**:
   - Production connection strings should always be injected via environment variables or secret managers:
     ```bash
     export ConnectionStrings__DefaultConnection="Host=db.host;Port=5432;Database=BookingDb;Username=user;Password=STRONG_PASSWORD"
     ```
   - For local development, use .NET User Secrets:
     ```bash
     dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=...;Database=...;Username=...;Password=..."
     ```

3. **Input Validation**:
   - Endpoints validate all timestamps to prevent negative durations, inverted intervals, or scheduling in the past.

---

## 📁 Repository Structure

```text
BookingApp/
├── Controllers/                 # REST API controllers
│   ├── BookingsController.cs    # Quote, creation, confirmation endpoints
│   └── RoomsController.cs       # Room catalog, availability filter & CRUD
├── Data/                        # EF Core DbContext & model configurations
│   └── AppDbContext.cs          # Database context, seed data & entity mappings
├── DTOs/                        # Request and response transfer models
├── Models/                      # Core domain entities
│   ├── Booking.cs
│   ├── ConferenceRoom.cs
│   ├── Service.cs
│   └── BookingStatus.cs
├── Services/                    # Application business logic
│   ├── BookingService.cs        # Reservation workflow & concurrency handling
│   ├── PricingCalculator.cs     # Tiered hourly rate & services cost calculator
│   ├── RoomManagementService.cs # Room discovery & administrative actions
│   └── ExpiredBookingCleanupService.cs # Periodic hold cleanup worker
├── appsettings.json             # Base configuration
├── appsettings.example.json     # Sanitized template configuration
├── BookingApp.csproj            # .NET 10 project definition
├── frontend/                    # Single Page Application
│   ├── src/
│   │   ├── api/                 # Typed API clients & query keys
│   │   ├── components/          # Reusable UI & layout elements
│   │   ├── features/            # Feature modules (rooms, bookings, admin)
│   │   ├── lib/                 # Utilities and client pricing logic
│   │   ├── mocks/               # MSW mock handlers & seed data
│   │   └── pages/               # Application view routes
│   ├── .env.example             # Client environment template
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── .gitignore                   # Excludes binaries, secrets, and caches
├── README.md                    # Primary English documentation
└── README.uk.md                 # Ukrainian documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **.NET SDK**: `10.0+`
- **Node.js**: `18.0+` (LTS recommended)
- **PostgreSQL**: `15+` (or Docker)

---

### 1. Backend Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sasha-1337/booking-app.git
   cd booking-app
   ```

2. **Start PostgreSQL (optional via Docker)**:
   ```bash
   docker run --name booking-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=BookingDb -p 5432:5432 -d postgres:16-alpine
   ```

3. **Verify Connection Settings**:
   Ensure your local connection string matches in `appsettings.Development.json` (or copy from `appsettings.example.json`). Default development string connects to `localhost:5432`.

4. **Launch Backend**:
   ```bash
   dotnet run
   ```
   API is accessible at `http://localhost:5046` (Swagger/OpenAPI UI available in development).

---

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   ```bash
   cp .env.example .env.development
   ```
   *Options:*
   - `VITE_USE_MOCKS=true` — Runs with standalone in-browser MSW mock data (no database required).
   - `VITE_USE_MOCKS=false` — Connects directly to live ASP.NET Core backend.

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 📡 REST API Specification

| Method | Endpoint | Description | Parameters / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/rooms` | Retrieve all active conference rooms | — |
| `GET` | `/api/rooms/available` | Filter available rooms by slot & capacity | `startTime`, `endTime`, `minCapacity` |
| `GET` | `/api/rooms/{id}` | Get room details by GUID | `id` (GUID) |
| `POST` | `/api/rooms` | Create a conference room (Admin) | `{ name, capacity, baseHourlyRate, serviceIds }` |
| `PUT` | `/api/rooms/{id}` | Update existing conference room | `{ name, capacity, baseHourlyRate, serviceIds }` |
| `DELETE` | `/api/rooms/{id}` | Soft-delete a room | `id` (GUID) |
| `POST` | `/api/bookings/calculate-quote` | Compute booking quote with tiered rates | `{ roomId, startTimeUtc, endTimeUtc, serviceIds }` |
| `POST` | `/api/bookings` | Create pending booking (15-min hold) | `{ roomId, startTimeUtc, endTimeUtc, serviceIds }` |
| `POST` | `/api/bookings/{id}/confirm` | Confirm an existing pending booking | `id` (GUID) |
| `GET` | `/api/bookings/{id}` | Retrieve booking status & details | `id` (GUID) |

*Error Responses*: Follow **RFC 7807 (ProblemDetails)** with structured `title`, `detail`, `status`, and validation dictionaries.

---

## 🧪 Testing Suite

### Execute Frontend Tests (Vitest)
```bash
cd frontend
npm test
```
The test suite validates:
- Pure pricing engine calculations including edge-case tiered rate transitions.
- Form controls and time interval sequence validation (`startTime < endTime`).
- Room card accessibility landmarks and rendering.
- Right-hand slide-in reservation sheet real-time calculation and submission.
- My Bookings list rendering and Admin room management table workflows.

---

## 👤 Author

Developed by **[sasha-1337](https://github.com/sasha-1337)**.

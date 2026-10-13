# Conference Room Booking App — Frontend

Modern Single Page Application (SPA) for exploring, filtering, and booking conference rooms with instant live price calculation and full administration capabilities.

Built with **React 18**, **TypeScript** (strict mode), **Vite**, **Tailwind CSS**, **shadcn/ui** (Radix primitives), **TanStack Query**, and **MSW** (Mock Service Worker).

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18.0.0` or higher (tested on `v24.x`)
- npm `v9.x` or higher (tested on `v11.x`)

### Installation & Run

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:5173/`.

4. Run unit and integration tests (Vitest):
   ```bash
   npm test
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## ⚙️ Environment Variables

Configure environment options via `.env.development` or `.env.local`:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `/api` | Base URL for REST API calls (ASP.NET backend or MSW interceptor) |
| `VITE_USE_MOCKS` | `true` | When `true`, MSW intercepts requests with realistic seed data and simulates 409 conflicts |

---

## 🏗️ Architecture & Features

### 1. Pure Pricing Engine (`src/lib/pricing.ts`)
- Pure function `calculateTotal(room, durationHours, selectedServiceIds)`:
  $$\text{Total} = \text{basePricePerHour} \times \text{durationHours} + \sum(\text{selected service prices})$$
- *Example:* $2000 \times 4\text{h} + 500 + 300 = 8800\text{ UAH}$.
- Verified with unit tests in `src/lib/pricing.test.ts`.

### 2. Available Rooms Page (`/`)
- **Filters Bar**:
  - Date picker, Start Time, End Time, and Minimum Capacity inputs.
  - Client-side validation ensuring `endTime > startTime`.
  - Sort selection: Price (Asc/Desc), Capacity (Asc/Desc), Name (A-Z).
- **Rooms Grid**:
  - Responsive cards with photo, capacity, hourly rate, and add-on chips.
  - Click opens the right slide-in sheet.
- **Right Slide-in Booking Panel (Sheet)**:
  - Responsive: slides in from right on desktop; full drawer / bottom sheet on mobile.
  - Equipment & services checklist with real-time price updates.
  - Live cost breakdown.
  - Inline error display for **409 Conflict** (room already booked).
  - On booking confirmation: displays success toast with official backend price and automatically refreshes queries.

### 3. My Bookings Page (`/bookings`)
- List of confirmed bookings with room name, reservation ID, date, time slot, duration, included services, and total price.
- Empty state with direct navigation back to room exploration.

### 4. Admin Room Management (`/admin/rooms`)
- Room management table listing name, capacity, base hourly rate, and configured add-ons.
- **Add Room** & **Edit Room** modal forms built with `react-hook-form` + `zod` schema validation.
- **Delete Room** with Radix UI `AlertDialog` confirmation.

### 5. Layout, Accessibility & Theming
- **Collapsible Sidebar**:
  - Expanded: icons + labels.
  - Collapsed: icons with tooltips.
  - Mobile: Slide-over drawer with hamburger trigger.
  - Full keyboard navigation, `aria-expanded`, and ARIA landmark roles.
- **Light & Dark Mode**:
  - Theme toggler with persistent state stored in `localStorage`.
  - Styled with CSS variables and Tailwind dark classes.
- **Reset Demo Data**:
  - Convenient button in top bar to restore initial seed data anytime.

---

## 📡 API Contract (`src/api`)

The frontend conforms to the assumed backend REST contract:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/rooms/available?date=...&from=...&to=...&capacity=...` | Returns available `Room[]` |
| `GET` | `/api/rooms` | Returns all rooms for administration |
| `POST` | `/api/rooms` | Creates a room, returns `{ id: string }` |
| `PUT` | `/api/rooms/:id` | Updates an existing room |
| `DELETE` | `/api/rooms/:id` | Deletes a room |
| `POST` | `/api/bookings` | Creates a reservation; returns `{ bookingId, totalPrice }` or 409 Conflict |
| `GET` | `/api/bookings` | Returns all `Booking[]` |

Errors follow **RFC 7807** `ProblemDetails` (`title`, `detail`, `status`, `errors`) and are displayed in toasts or inline alerts.

---

## 🧪 Testing

Run all 20 unit and component tests:
```bash
npm test
```
Test suite includes:
- Pricing engine calculation and edge cases
- Time duration computation
- `FiltersBar` form interactions and time-range validation
- `RoomCard` rendering and accessibility actions
- `RoomBookingSheet` live recalculation and submission
- `BookingsPage` reservation rendering and empty state
- `AdminRoomsPage` table structure and actions

# CampusChronicle - Project Analysis and Context

This file contains a comprehensive technical overview of the CampusChronicle Annual Report Portal. It is designed to be used as a primary context file for future AI-assisted development and debugging.

## Application Overview
CampusChronicle is a full-stack web application for an annual report management system in Tamil Nadu. It facilitates multiple user roles to create, review, and finalize annual reports, track KPIs, and manage institutional data.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19.2
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion 12
- **State Management**: Zustand 5
- **UI Components**: Shadcn UI (Radix UI primitives)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Language**: TypeScript

## Project Structure
- `app/`: Next.js App Router root.
  - `app/dashboard/`: Contains all main application views (`analytics`, `departments`, `draft`, `entries`, `report-builder`, `reports`, `review`, `settings`, `templates`, `upload`). Role-specific views are managed here.
  - `app/globals.css`: Global styles including Tailwind configurations and CSS variables for the theme.
- `components/`:
  - `components/dashboards/`: Role-specific dashboard layouts (Admin, Faculty, Dept Head, Reviewer).
  - `components/ui/`: Reusable Shadcn UI components.
  - `components/`: Core functional components (`data-table.tsx`, `file-uploader.tsx`, `quiz-modal.tsx`, `report-preview.tsx`, `app-sidebar.tsx`, `app-topbar.tsx`, etc.).
- `lib/`:
  - `store.ts`: Zustand store for global application state (Auth, Metrics, Drafts, Comments, Logs, Toasts, Notifications, Tutorial).
  - `types.ts`: Core TypeScript definitions.
  - `mock-data.ts`: Extensive mock data acting as the current "database".

## Core Global State (Zustand - `lib/store.ts`)
The application relies heavily on `useAppStore` for state management, which includes:
1. **User Auth**: `currentUser`, `login`, `logout`.
2. **Settings**: Theme (`light`/`dark`), Notifications.
3. **Data Entities**: 
   - `metricEntries` (Department Metric Entries)
   - `reportDrafts` (Drafts created by faculty)
   - `comments` & `approvalLogs` (Review workflows)
   - `templateSections` (For the report builder)
   - `versions` (Report versioning)
   - `notifications`
4. **UI State**: Toasts (`showToast`), Tutorial flow (`tutorialActive`, etc.).

## Key Workflows & Roles
- **Admin** (`admin@example.com`): Full system control, report publishing, KPI analytics.
- **Department Head** (`depthead@example.com`): Manages department, reviews faculty drafts, submits to reviewer.
- **Faculty** (`faculty@example.com`): Submits metric data, creates drafts, manages entries.
- **Reviewer** (`reviewer@example.com`): Reviews submitted reports, provides feedback, and approves.

## UI / UX Architecture
- **Theming**: The primary brand color is Indigo (`#5B4FCF`). Uses standard info/success/warning/error colors. Full Dark Mode support is available and easily toggled.
- **Responsiveness**: Mobile-first design. Mobile utilizes a bottom navigation bar (`bottom-nav.tsx`), while Desktop/Tablet uses a flexible side navigation (`app-sidebar.tsx` & `app-topbar.tsx`).
- **Animations**: Heavy use of Framer Motion for page transitions, staggers, and component interactions.

## Data Fetching & Storage
Currently, the application is driven entirely by mock data located in `lib/mock-data.ts`. Edits are volatile unless handled via `localStorage` (only `currentUser` is stored in localStorage by default). Future integrations with a backend should replace mock data fetches with API calls (e.g., using `useEffect` + fetch or SWR/React Query).

## Future Development Guidelines
1. **Component Creation**: Use `components/ui` for basic elements and place complex components directly in `components/`.
2. **State Updates**: Always use `useAppStore` from `lib/store.ts` for cross-component state updates to maintain reactivity.
3. **Styling**: Rely exclusively on Tailwind classes. For complex layouts, leverage CSS Grid and Flexbox within Tailwind.
4. **Icons**: Use `lucide-react` for any new icons.

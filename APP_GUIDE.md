# CampusChronicle - Annual Report Portal

A comprehensive, fully-interactive annual report management system for , Tamil Nadu.

## Overview

CampusChronicle is a modern web application built with Next.js 16, React 19, Tailwind CSS v4, and Framer Motion. It enables multiple user roles (Admin, Department Head, Faculty, Reviewer) to collaborate on creating, reviewing, and finalizing annual reports with KPI tracking, data visualization, and document generation.

## Key Features

### 1. **Role-Based Access Control**
- **Admin**: Full system control, report publishing, analytics
- **Department Head**: Department data management, draft review, submission
- **Faculty**: Data entry, metrics submission, draft creation
- **Reviewer**: Report review, approval workflow, feedback

### 2. **Data Management**
- Metric entry submission with categorization
- Bulk file uploads (PDF, DOC, XLSX)
- Data validation and error handling
- Draft versioning and revision tracking

### 3. **Report Generation & Building**
- Drag-and-drop section builder
- Multiple template types (Academic, Research, Financial, Infrastructure, etc.)
- Section customization and preview
- Export to PDF functionality

### 4. **Collaboration Features**
- Comment system on reports
- Version control with change tracking
- Approval workflow with notes
- Real-time notifications

### 5. **Analytics Dashboard**
- KPI tracking and visualization
- Department performance metrics
- Student placement data
- Research output analysis
- Interactive charts (Line, Bar, Radar)

### 6. **Mobile-First Design**
- Responsive layout for all device sizes
- Bottom navigation bar for mobile
- Material Design-inspired mobile interface
- Touch-optimized interactions

## Project Structure

```
/app
  /dashboard
    /upload          - Data/metric submission
    /entries         - View & manage entries
    /draft           - Create and preview drafts
    /review          - Review submitted reports
    /report-builder  - Build custom report templates
    /reports         - View all generated reports
    /analytics       - View KPI analytics
    /departments     - Department management
    /templates       - Template management
    /settings        - User settings

/components
  /dashboards        - Role-specific dashboards
  /ui                - Shadcn UI components
  - app-sidebar      - Navigation sidebar
  - app-topbar       - Header with notifications
  - bottom-nav       - Mobile bottom navigation
  - toast-container  - Toast notification system
  - quiz-modal       - Interactive quizzes
  - file-uploader    - Drag-drop file upload
  - data-table       - Animated data tables
  - progress-tracker - Progress visualization
  - timeline         - Event timeline
  - analytics-chart  - Data visualization

/lib
  - types.ts         - TypeScript interfaces
  - mock-data.ts     - Demo data
  - store.ts         - Zustand state management
  - utils.ts         - Helper functions
```

## Demo Accounts

Pre-configured demo accounts with mock data:

1. **Admin**: admin@example.com
   - Full system access
   - Dashboard analytics
   - System settings

2. **Department Head**: depthead@example.com
   - CSE Department management
   - Report approval
   - Faculty data review

3. **Faculty**: faculty@example.com
   - Data submission
   - Entry management
   - Draft creation

4. **Reviewer**: reviewer@example.com
   - Report review
   - Approval workflow
   - Feedback provision

## Design System

### Colors
- **Primary**: #5B4FCF (Indigo)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)
- **Backgrounds**: Off-white (#F9FAFB) | Dark (#0F172A)

### Typography
- **Font Family**: Inter (default system font)
- **Headings**: Bold, 1.2-1.3 line height
- **Body**: Regular, 1.5-1.6 line height

### Components
- **Buttons**: Primary, outline, and ghost variants
- **Cards**: Elevated with subtle shadows
- **Modals**: Smooth animations with backdrop
- **Tables**: Striped, animated rows
- **Charts**: Recharts with custom styling

## Interactive Features

### Animations
- Framer Motion transitions on all components
- Stagger animations for lists
- Smooth page transitions
- Loading spinners and progress bars
- Toast notifications with auto-dismiss

### Interactions
- Drag-and-drop for report sections
- Multi-select in data tables
- Form validation with error messages
- Real-time search and filtering
- Modal dialogs for confirmations

### Responsive Behavior
- **Mobile**: Bottom navigation, stacked layouts, single column
- **Tablet**: Side-by-side panels, optimized spacing
- **Desktop**: Full sidebar, multi-column grids, expanded features

## Toast Notification System

The app includes a modern toast notification system with auto-dismissal:
- **Success**: Green background, check icon
- **Error**: Red background, error icon
- **Info**: Blue background, info icon
- **Warning**: Yellow background, warning icon

Toasts appear in the bottom-right corner and auto-dismiss after 3 seconds.

## State Management

Using Zustand for lightweight state management:
- `useAppStore()` hook for accessing global state
- `showToast()` method for notifications
- Real-time data synchronization across components
- Persistent mock data for demo purposes

## Performance Optimizations

- Server-side rendering where possible
- Code splitting for dashboard pages
- Optimized images and assets
- Efficient re-renders with React hooks
- CSS-in-JS with Tailwind for minimal bundle size

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Demo Data Included

- 6 departments (CSE, ECE, Mechanical, Civil, IT, Biotechnology)
- 20+ faculty members across departments
- 100+ metric entries in various categories
- 10+ sample reports with different statuses
- KPI data with trends and analytics
- Mock approval logs and comments

## Getting Started

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Run Development Server**
   ```bash
   pnpm dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:3000`

4. **Login with Demo Account**
   Use any of the pre-configured accounts above

5. **Explore Features**
   - Submit data entries
   - Create and preview reports
   - Review and approve reports
   - View analytics dashboard

## Customization

### Adding New Departments
Edit `lib/mock-data.ts` and add to `MOCK_DEPARTMENTS` array.

### Modifying Color Scheme
Update CSS variables in `app/globals.css` under the `@theme` directive.

### Adding New Report Sections
Define new `ReportSectionType` in `lib/types.ts`.

### Custom Dashboards
Create new dashboard component in `components/dashboards/` and add to role selector in `app/dashboard/page.tsx`.

## Notes for Tomorrow's Demonstration

- All features are fully functional with mock data
- No external API calls required
- Responsive design tested on all screen sizes
- All animations are smooth and performant
- Notifications and toasts provide real-time feedback
- Data persists during the session (Zustand store)
- Mobile navigation optimized for demo presentation

## Technical Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19.2
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion 12
- **State Management**: Zustand 5
- **Components**: Shadcn/UI
- **Charts**: Recharts
- **Icons**: Lucide React
- **TypeScript**: Full type safety

---

Built for demonstration on 2026-02-27. Ready for production deployment with backend integration.

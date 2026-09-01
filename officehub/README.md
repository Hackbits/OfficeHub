# OfficeHub

A modern employee attendance and workforce management system built with Next.js, Supabase, and Tailwind CSS.

## Features

### Core Functionality

- **Attendance Tracking** — GPS-verified check-in/check-out with geofence validation
- **Work From Home (WFH)** — Request and manage remote work approvals
- **Leave Management** — Apply for leaves with multi-level approval workflow
- **Employee Management** — Add, edit, and manage employee profiles
- **Notifications** — Real-time alerts for approvals, attendance, and system updates

### Dashboards

- **Admin Dashboard** — Team-wide attendance overview, pending approvals, and employee status
- **Employee Dashboard** — Personal attendance summary and quick actions

### Reporting

- **Attendance Reports** — Daily, weekly, and monthly attendance analytics
- **Leave Reports** — Leave usage trends and balance tracking
- **WFH Reports** — Remote work pattern analysis
- **Export** — Download reports as PDF, Excel, or CSV

### Additional Features

- **Role-Based Access** — Admin, Manager, and Employee roles with granular permissions
- **Holiday Management** — Configure company and national holidays
- **Department Management** — Organize employees by departments
- **Responsive Design** — Optimized for desktop, tablet, and mobile devices

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| State Management | TanStack React Query |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20)
- npm, yarn, or pnpm
- Supabase account (free tier works)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd officehub
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**

   Run the Supabase migrations to create the required tables:

   ```bash
   npx supabase db push
   ```

   Required tables:
   - `profiles` — Employee profiles
   - `attendance` — Daily attendance records
   - `wfh_requests` — Work from home requests
   - `leave_requests` — Leave applications
   - `holidays` — Company holidays
   - `notifications` — User notifications
   - `departments` — Department listings
   - `office_settings` — Office configuration

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
officehub/
├── app/
│   ├── (auth)/              # Public routes (login, register)
│   ├── (protected)/         # Authenticated routes
│   │   ├── dashboard/       # Admin & employee dashboards
│   │   ├── attendance/      # Attendance tracking & history
│   │   ├── wfh/             # Work from home management
│   │   ├── leave/           # Leave management
│   │   ├── approvals/       # Manager approval queue
│   │   ├── employees/       # Employee management
│   │   ├── reports/         # Analytics & reports
│   │   ├── notifications/   # Notification center
│   │   ├── profile/         # User profile
│   │   └── settings/        # System settings (admin)
│   └── api/                 # API route handlers
├── components/
│   ├── attendance/          # Attendance-related components
│   ├── approvals/           # Approval table & actions
│   ├── employees/           # Employee forms & tables
│   ├── leave/               # Leave forms & history
│   ├── reports/             # Report views & filters
│   ├── settings/            # Settings forms
│   ├── shared/              # Reusable components
│   ├── ui/                  # shadcn/ui primitives
│   └── wfh/                 # WFH forms & tables
├── hooks/                   # Custom React hooks
├── lib/
│   ├── export/              # PDF, Excel, CSV export utils
│   ├── supabase/            # Supabase client & queries
│   ├── validations/         # Zod schemas
│   └── utils.ts             # Utility functions
├── types/                   # TypeScript type definitions
└── middleware.ts             # Auth & route protection
```

## Role Permissions

| Feature | Employee | Manager | Admin |
|---------|----------|---------|-------|
| Check In/Out | ✅ | ✅ | ✅ |
| View Own Attendance | ✅ | ✅ | ✅ |
| View Team Attendance | ❌ | ✅ | ✅ |
| Submit Leave Request | ✅ | ✅ | ✅ |
| Approve Leave | ❌ | ✅ | ✅ |
| Submit WFH Request | ✅ | ✅ | ✅ |
| Approve WFH | ❌ | ✅ | ✅ |
| View Reports | ❌ | ✅ | ✅ |
| Manage Employees | ❌ | ❌ | ✅ |
| System Settings | ❌ | ❌ | ✅ |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

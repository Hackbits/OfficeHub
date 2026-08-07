import {
  LayoutDashboard,
  Clock,
  Home,
  CalendarOff,
  Users,
  Settings,
  Bell,
  User,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["employee", "manager", "admin"],
  },
  {
    label: "Attendance",
    href: "/attendance",
    icon: Clock,
    roles: ["employee", "manager", "admin"],
  },
  {
    label: "Work From Home",
    href: "/wfh",
    icon: Home,
    roles: ["employee", "manager", "admin"],
  },
  {
    label: "Leave",
    href: "/leave",
    icon: CalendarOff,
    roles: ["employee", "manager", "admin"],
  },
  {
    label: "Approvals",
    href: "/approvals",
    icon: ClipboardCheck,
    roles: ["manager", "admin"],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["manager", "admin"],
  },
  {
    label: "Employees",
    href: "/employees",
    icon: Users,
    roles: ["manager", "admin"],
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    roles: ["employee", "manager", "admin"],
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
    roles: ["employee", "manager", "admin"],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["admin"],
  },
];

export type UserRole = "employee" | "manager" | "admin";

export type EmployeeStatus = "active" | "inactive" | "terminated";

export type AttendanceStatus =
  | "present"
  | "absent"
  | "wfh"
  | "leave"
  | "holiday"
  | "weekend"
  | "half_day"
  | "late"
  | "overtime";

export type RequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export type LeaveType = "casual" | "sick" | "paid" | "unpaid" | "optional";

export type NotificationType = "wfh" | "leave" | "attendance" | "system";

export type HolidayType = "national" | "company";

export interface Profile {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  department_id: string | null;
  manager_id: string | null;
  designation: string | null;
  joining_date: string | null;
  status: EmployeeStatus;
  office_location: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  working_hours: number | null;
  status: AttendanceStatus;
  latitude: number | null;
  longitude: number | null;
  ip_address: string | null;
  device_info: string | null;
  created_at: string;
}

export interface WfhRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  notes: string | null;
  status: RequestStatus;
  approved_by: string | null;
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  status: RequestStatus;
  approved_by: string | null;
  created_at: string;
}

export interface Holiday {
  id: string;
  title: string;
  date: string;
  type: HolidayType;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  type: NotificationType;
  link: string | null;
  created_at: string;
}
export const APP_NAME = "OfficeHub";

export const ROLES = {
  EMPLOYEE: "employee",
  MANAGER: "manager",
  ADMIN: "admin",
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  WFH: "wfh",
  LEAVE: "leave",
  HOLIDAY: "holiday",
  WEEKEND: "weekend",
  HALF_DAY: "half_day",
  LATE: "late",
  OVERTIME: "overtime",
} as const;

export const LEAVE_TYPES = {
  CASUAL: "casual",
  SICK: "sick",
  PAID: "paid",
  UNPAID: "unpaid",
  OPTIONAL: "optional",
} as const;

export const LEAVE_BALANCES: Record<string, number> = {
  casual: 10,
  sick: 10,
  paid: 10,
  unpaid: Infinity,
  optional: 2,
};

export const WORKING_HOURS = {
  STANDARD: 8,
  LATE_THRESHOLD_MINUTES: 15,
  OVERTIME_THRESHOLD: 8,
  HALF_DAY_MAX: 4,
} as const;

export const DEFAULT_OFFICE_START = "09:30";
export const DEFAULT_OFFICE_END = "18:30";
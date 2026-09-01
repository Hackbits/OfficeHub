"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Attendance } from "@/types";

interface EmployeeRecord {
  id: string;
  full_name: string;
  employee_id: string;
  department_id: string | null;
}

interface TeamMemberAttendance {
  user_id: string;
  full_name: string;
  employee_id: string;
  department_id: string | null;
  status: string;
  check_in: string | null;
  check_out: string | null;
  working_hours: number | null;
}

export function useTeamTodayAttendance() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["attendance", "team-today"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "employee") {
        throw new Error("Not authorized");
      }

      let employeeQuery = supabase
        .from("profiles")
        .select("id, full_name, employee_id, department_id")
        .eq("status", "active");

      if (profile?.role === "manager") {
        employeeQuery = employeeQuery.eq("manager_id", user.id);
      }

      const { data: employees, error: empError } = await employeeQuery;
      if (empError) throw empError;

      if (!employees || employees.length === 0) {
        return { employees: [], summary: { total: 0, present: 0, absent: 0, wfh: 0, late: 0, noRecord: 0 } };
      }

      const today = new Date().toISOString().split("T")[0];
      const employeeIds = employees.map((e: EmployeeRecord) => e.id);

      const { data: attendanceRecords } = await supabase
        .from("attendance")
        .select("user_id, status, check_in, check_out, working_hours")
        .in("user_id", employeeIds)
        .eq("date", today);

      const attendanceMap = new Map<string, Attendance>();
      attendanceRecords?.forEach((r: { user_id: string; status: string; check_in: string | null; check_out: string | null; working_hours: number | null }) =>
        attendanceMap.set(r.user_id, r as Attendance)
      );

      const teamMembers: TeamMemberAttendance[] = employees.map((emp: EmployeeRecord) => {
        const record = attendanceMap.get(emp.id);
        return {
          user_id: emp.id,
          full_name: emp.full_name,
          employee_id: emp.employee_id,
          department_id: emp.department_id,
          status: record?.status || "no_record",
          check_in: record?.check_in || null,
          check_out: record?.check_out || null,
          working_hours: record?.working_hours || null,
        };
      });

      const summary = {
        total: teamMembers.length,
        present: teamMembers.filter((m) => m.status === "present").length,
        absent: teamMembers.filter((m) => m.status === "absent" || m.status === "no_record").length,
        wfh: teamMembers.filter((m) => m.status === "wfh").length,
        late: teamMembers.filter((m) => m.status === "late").length,
        noRecord: teamMembers.filter((m) => m.status === "no_record").length,
      };

      return { employees: teamMembers, summary };
    },
  });
}

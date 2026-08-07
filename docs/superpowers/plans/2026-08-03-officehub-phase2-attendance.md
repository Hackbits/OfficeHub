# OfficeHub Phase 2: Core Attendance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the core attendance module with check-in/out, GPS geofence validation, working hours calculation, and attendance history.

**Architecture:** Client-side GPS capture → API route for validation against office geofence → Supabase attendance records. TanStack Query for server state. Reusable attendance components.

**Tech Stack:** Next.js 15, React 19, TypeScript, Supabase, TanStack Query, React Hook Form, Zod, Recharts, date-fns, Lucide React

---

## File Structure

```
officehub/
├── app/
│   ├── (protected)/
│   │   ├── attendance/
│   │   │   ├── page.tsx              (main attendance page)
│   │   │   └── history/page.tsx      (attendance history)
│   │   └── api/
│   │       └── attendance/
│   │           ├── check-in/route.ts
│   │           └── check-out/route.ts
├── components/
│   ├── attendance/
│   │   ├── check-in-button.tsx
│   │   ├── today-status.tsx
│   │   ├── attendance-clock.tsx
│   │   ├── attendance-history-table.tsx
│   │   └── monthly-attendance-chart.tsx
│   └── ui/
│       └── (existing shadcn components)
├── hooks/
│   ├── use-attendance.ts
│   └── use-gps.ts
├── lib/
│   ├── supabase/
│   │   └── queries.ts               (shared DB queries)
│   ├── geo.ts                        (GPS distance calculation)
│   └── validations/
│       └── attendance.ts
└── types/
    └── index.ts                      (extend with new types)
```

---

## Task 1: Create GPS Utility

**Files:**
- Create: `lib/geo.ts`

- [ ] **Step 1: Create GPS distance calculation**

Create `lib/geo.ts`:
```typescript
const EARTH_RADIUS_KM = 6371;

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c * 1000; // Convert to meters
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Check if user is within office geofence
 */
export function isWithinGeofence(
  userLat: number,
  userLng: number,
  officeLat: number,
  officeLng: number,
  radiusMeters: number
): boolean {
  const distance = calculateDistance(userLat, userLng, officeLat, officeLng);
  return distance <= radiusMeters;
}

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Get current GPS coordinates from browser
 */
export function getCurrentPosition(): Promise<GpsCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Location access denied. Please enable location services."));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location information unavailable."));
            break;
          case error.TIMEOUT:
            reject(new Error("Location request timed out."));
            break;
          default:
            reject(new Error("An unknown error occurred."));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}
```

- [ ] **Step 2: Commit**

```powershell
git add lib/geo.ts
git commit -m "feat: add GPS distance calculation utility"
```

---

## Task 2: Create Attendance Validation Schema

**Files:**
- Create: `lib/validations/attendance.ts`

- [ ] **Step 1: Create validation schema**

Create `lib/validations/attendance.ts`:
```typescript
import { z } from "zod";

export const checkInSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  device_info: z.string().optional(),
  ip_address: z.string().optional(),
});

export type CheckInInput = z.infer<typeof checkInSchema>;

export const attendanceFilterSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.string().optional(),
});

export type AttendanceFilterInput = z.infer<typeof attendanceFilterSchema>;
```

- [ ] **Step 2: Commit**

```powershell
git add lib/validations/attendance.ts
git commit -m "feat: add attendance validation schemas"
```

---

## Task 3: Create Supabase Query Helpers

**Files:**
- Create: `lib/supabase/queries.ts`

- [ ] **Step 1: Create query helpers**

Create `lib/supabase/queries.ts`:
```typescript
import { createClient } from "@/lib/supabase/server";
import type { Attendance, Profile } from "@/types";

/**
 * Get today's attendance for a user
 */
export async function getTodayAttendance(userId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data as Attendance | null;
}

/**
 * Get attendance history for a user
 */
export async function getAttendanceHistory(
  userId: string,
  startDate?: string,
  endDate?: string
) {
  const supabase = await createClient();

  let query = supabase
    .from("attendance")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (startDate) {
    query = query.gte("date", startDate);
  }
  if (endDate) {
    query = query.lte("date", endDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Attendance[];
}

/**
 * Get team attendance for managers/admins
 */
export async function getTeamAttendance(date: string) {
  const supabase = await createClient();

  const { data: currentUser } = await supabase.auth.getUser();
  if (!currentUser.user) throw new Error("Not authenticated");

  // Get team members
  const { data: team } = await supabase
    .from("profiles")
    .select("id")
    .eq("manager_id", currentUser.user.id);

  if (!team || team.length === 0) return [];

  const teamIds = team.map((m) => m.id);

  const { data, error } = await supabase
    .from("attendance")
    .select("*, profiles(full_name, employee_id, avatar_url)")
    .in("user_id", teamIds)
    .eq("date", date);

  if (error) throw error;
  return data;
}

/**
 * Get monthly attendance summary
 */
export async function getMonthlyAttendance(userId: string, year: number, month: number) {
  const supabase = await createClient();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) throw error;
  return data as Attendance[];
}

/**
 * Get office settings (geofence, working hours)
 */
export async function getOfficeSettings() {
  // For now, return defaults. Will be configurable in Phase 6.
  return {
    office_latitude: 28.6139,
    office_longitude: 77.2090,
    geofence_radius: 500,
    office_start: "09:30",
    office_end: "18:30",
    standard_hours: 8,
    late_threshold_minutes: 15,
    overtime_threshold: 8,
    half_day_max: 4,
  };
}
```

- [ ] **Step 2: Commit**

```powershell
git add lib/supabase/queries.ts
git commit -m "feat: add Supabase query helpers for attendance"
```

---

## Task 4: Create Check-In API Route

**Files:**
- Create: `app/api/attendance/check-in/route.ts`

- [ ] **Step 1: Create check-in API**

Create `app/api/attendance/check-in/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isWithinGeofence, getCurrentPosition } from "@/lib/geo";
import { getOfficeSettings, getTodayAttendance } from "@/lib/supabase/queries";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if already checked in today
    const existing = await getTodayAttendance(user.id);
    if (existing) {
      return NextResponse.json(
        { error: "Already checked in today" },
        { status: 400 }
      );
    }

    // Get request body
    const body = await request.json();
    const { latitude, longitude, device_info, ip_address } = body;

    // Get office settings
    const settings = await getOfficeSettings();

    // Check if today is a holiday
    const today = new Date().toISOString().split("T")[0];
    const { data: holiday } = await supabase
      .from("holidays")
      .select("id")
      .eq("date", today)
      .single();

    if (holiday) {
      return NextResponse.json(
        { error: "Today is a holiday. No check-in required." },
        { status: 400 }
      );
    }

    // Check if today is a weekend
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return NextResponse.json(
        { error: "Today is a weekend. No check-in required." },
        { status: 400 }
      );
    }

    // Check if WFH is approved for today
    const { data: wfhRequest } = await supabase
      .from("wfh_requests")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .lte("start_date", today)
      .gte("end_date", today)
      .single();

    const isWFH = !!wfhRequest;

    // GPS validation (skip if WFH)
    if (!isWFH) {
      if (latitude === undefined || longitude === undefined) {
        return NextResponse.json(
          { error: "GPS coordinates required for office check-in" },
          { status: 400 }
        );
      }

      const withinGeofence = isWithinGeofence(
        latitude,
        longitude,
        settings.office_latitude,
        settings.office_longitude,
        settings.geofence_radius
      );

      if (!withinGeofence) {
        return NextResponse.json(
          { error: "Outside office geofence. You must be within the office to check in." },
          { status: 400 }
        );
      }
    }

    // Determine status
    const checkInTime = new Date();
    const [startHour, startMin] = settings.office_start.split(":").map(Number);
    const officeStart = new Date();
    officeStart.setHours(startHour, startMin, 0, 0);

    const lateThreshold = settings.late_threshold_minutes * 60 * 1000;
    const isLate = checkInTime.getTime() > officeStart.getTime() + lateThreshold;

    let status = isWFH ? "wfh" : "present";
    if (isLate) status = "late";

    // Insert attendance record
    const { data, error } = await supabase
      .from("attendance")
      .insert({
        user_id: user.id,
        date: today,
        check_in: checkInTime.toISOString(),
        status,
        latitude: isWFH ? null : latitude,
        longitude: isWFH ? null : longitude,
        device_info,
        ip_address,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      attendance: data,
      message: isLate
        ? "Checked in successfully (late arrival)"
        : "Checked in successfully",
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "Failed to check in" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```powershell
git add app/api/attendance/check-in/
git commit -m "feat: add check-in API route with GPS validation"
```

---

## Task 5: Create Check-Out API Route

**Files:**
- Create: `app/api/attendance/check-out/route.ts`

- [ ] **Step 1: Create check-out API**

Create `app/api/attendance/check-out/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTodayAttendance, getOfficeSettings } from "@/lib/supabase/queries";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get today's attendance
    const attendance = await getTodayAttendance(user.id);
    if (!attendance) {
      return NextResponse.json(
        { error: "No check-in found for today" },
        { status: 400 }
      );
    }

    if (attendance.check_out) {
      return NextResponse.json(
        { error: "Already checked out today" },
        { status: 400 }
      );
    }

    // Get office settings
    const settings = await getOfficeSettings();

    // Calculate working hours
    const checkIn = new Date(attendance.check_in);
    const checkOut = new Date();
    const workingHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

    // Determine status based on working hours
    let status = attendance.status;
    if (workingHours < settings.half_day_max) {
      status = "half_day";
    } else if (workingHours >= settings.overtime_threshold) {
      status = "overtime";
    }

    // Update attendance record
    const { data, error } = await supabase
      .from("attendance")
      .update({
        check_out: checkOut.toISOString(),
        working_hours: Math.round(workingHours * 100) / 100,
        status,
      })
      .eq("id", attendance.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      attendance: data,
      working_hours: Math.round(workingHours * 100) / 100,
      message: "Checked out successfully",
    });
  } catch (error) {
    console.error("Check-out error:", error);
    return NextResponse.json(
      { error: "Failed to check out" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```powershell
git add app/api/attendance/check-out/
git commit -m "feat: add check-out API route with working hours calculation"
```

---

## Task 6: Create Attendance Hooks

**Files:**
- Create: `hooks/use-attendance.ts`
- Create: `hooks/use-gps.ts`

- [ ] **Step 1: Create GPS hook**

Create `hooks/use-gps.ts`:
```typescript
"use client";

import { useState, useCallback } from "react";
import { getCurrentPosition, type GpsCoordinates } from "@/lib/geo";

export function useGps() {
  const [coordinates, setCoordinates] = useState<GpsCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoordinates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const pos = await getCurrentPosition();
      setCoordinates(pos);
      return pos;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get location";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { coordinates, loading, error, fetchCoordinates };
}
```

- [ ] **Step 2: Create attendance hook**

Create `hooks/use-attendance.ts`:
```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Attendance } from "@/types";

export function useTodayAttendance() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["attendance", "today"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data as Attendance | null;
    },
  });
}

export function useAttendanceHistory(startDate?: string, endDate?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["attendance", "history", startDate, endDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("attendance")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (startDate) query = query.gte("date", startDate);
      if (endDate) query = query.lte("date", endDate);

      const { data, error } = await query;
      if (error) throw error;
      return data as Attendance[];
    },
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      latitude: number;
      longitude: number;
      device_info?: string;
      ip_address?: string;
    }) => {
      const res = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/attendance/check-out", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}
```

- [ ] **Step 3: Commit**

```powershell
git add hooks/use-attendance.ts hooks/use-gps.ts
git commit -m "feat: add attendance and GPS hooks"
```

---

## Task 7: Create Attendance Components

**Files:**
- Create: `components/attendance/attendance-clock.tsx`
- Create: `components/attendance/check-in-button.tsx`
- Create: `components/attendance/today-status.tsx`

- [ ] **Step 1: Create attendance clock**

Create `components/attendance/attendance-clock.tsx`:
```typescript
"use client";

import { useState, useEffect } from "react";

export function AttendanceClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return <div className="h-8" />;

  return (
    <div className="text-3xl font-mono font-bold tabular-nums">
      {time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create check-in button**

Create `components/attendance/check-in-button.tsx`:
```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCheckIn, useCheckOut, useTodayAttendance } from "@/hooks/use-attendance";
import { useGps } from "@/hooks/use-gps";
import { useAuth } from "@/hooks/use-auth";
import { LogIn, LogOut, Loader2, MapPin } from "lucide-react";

export function CheckInButton() {
  const { profile } = useAuth();
  const { data: attendance, isLoading: attendanceLoading } = useTodayAttendance();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();
  const { loading: gpsLoading, error: gpsError, fetchCoordinates } = useGps();
  const [actionError, setActionError] = useState<string | null>(null);

  const isCheckedIn = !!attendance?.check_in;
  const isCheckedOut = !!attendance?.check_out;
  const isLoading = attendanceLoading || checkInMutation.isPending || checkOutMutation.isPending || gpsLoading;

  const handleCheckIn = async () => {
    setActionError(null);

    const coords = await fetchCoordinates();
    if (!coords) {
      setActionError(gpsError || "Failed to get location");
      return;
    }

    checkInMutation.mutate(
      {
        latitude: coords.latitude,
        longitude: coords.longitude,
        device_info: navigator.userAgent,
      },
      {
        onError: (err) => setActionError(err.message),
      }
    );
  };

  const handleCheckOut = async () => {
    setActionError(null);
    checkOutMutation.mutate(undefined, {
      onError: (err) => setActionError(err.message),
    });
  };

  if (attendanceLoading) {
    return (
      <Button disabled className="h-12 px-8">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (isCheckedOut) {
    return (
      <Button disabled className="h-12 px-8 bg-green-600 hover:bg-green-600">
        <LogOut className="mr-2 h-4 w-4" />
        Checked Out
      </Button>
    );
  }

  if (isCheckedIn) {
    return (
      <div className="space-y-2">
        <Button
          onClick={handleCheckOut}
          disabled={isLoading}
          variant="outline"
          className="h-12 px-8"
        >
          {checkOutMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Check Out
        </Button>
        {actionError && (
          <p className="text-sm text-destructive">{actionError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleCheckIn}
        disabled={isLoading}
        className="h-12 px-8"
      >
        {checkInMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="mr-2 h-4 w-4" />
        )}
        Check In
      </Button>
      {(actionError || gpsError) && (
        <p className="text-sm text-destructive">{actionError || gpsError}</p>
      )}
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <MapPin className="h-3 w-3" />
        GPS location required for check-in
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create today status component**

Create `components/attendance/today-status.tsx`:
```typescript
"use client";

import { useTodayAttendance } from "@/hooks/use-attendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Home } from "lucide-react";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  present: { label: "Present", variant: "default", icon: <CheckCircle className="h-4 w-4" /> },
  absent: { label: "Absent", variant: "destructive", icon: <XCircle className="h-4 w-4" /> },
  wfh: { label: "Work From Home", variant: "secondary", icon: <Home className="h-4 w-4" /> },
  late: { label: "Late", variant: "outline", icon: <Clock className="h-4 w-4" /> },
  half_day: { label: "Half Day", variant: "outline", icon: <Clock className="h-4 w-4" /> },
  overtime: { label: "Overtime", variant: "default", icon: <Clock className="h-4 w-4" /> },
};

export function TodayStatus() {
  const { data: attendance, isLoading } = useTodayAttendance();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-8 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const status = attendance?.status || "absent";
  const config = statusConfig[status] || statusConfig.absent;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Today&apos;s Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {config.icon}
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
        {attendance?.check_in && (
          <p className="text-sm text-muted-foreground mt-2">
            Check in: {new Date(attendance.check_in).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
        {attendance?.check_out && (
          <p className="text-sm text-muted-foreground">
            Check out: {new Date(attendance.check_out).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
        {attendance?.working_hours != null && (
          <p className="text-sm font-medium mt-1">
            Working hours: {attendance.working_hours.toFixed(1)}h
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Commit**

```powershell
git add components/attendance/
git commit -m "feat: add attendance components (clock, check-in button, today status)"
```

---

## Task 8: Create Attendance History Table

**Files:**
- Create: `components/attendance/attendance-history-table.tsx`

- [ ] **Step 1: Create history table**

Create `components/attendance/attendance-history-table.tsx`:
```typescript
"use client";

import { useAttendanceHistory } from "@/hooks/use-attendance";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  present: "default",
  absent: "destructive",
  wfh: "secondary",
  leave: "secondary",
  late: "outline",
  half_day: "outline",
  overtime: "default",
  holiday: "secondary",
  weekend: "secondary",
};

export function AttendanceHistoryTable({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) {
  const { data: attendance, isLoading } = useAttendanceHistory(startDate, endDate);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse bg-muted rounded" />
        ))}
      </div>
    );
  }

  if (!attendance || attendance.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No attendance records found.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Check In</TableHead>
          <TableHead>Check Out</TableHead>
          <TableHead>Hours</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attendance.map((record) => (
          <TableRow key={record.id}>
            <TableCell>{format(new Date(record.date), "MMM dd, yyyy")}</TableCell>
            <TableCell>
              <Badge variant={statusColors[record.status] || "default"}>
                {record.status.replace("_", " ")}
              </Badge>
            </TableCell>
            <TableCell>
              {record.check_in
                ? format(new Date(record.check_in), "hh:mm a")
                : "—"}
            </TableCell>
            <TableCell>
              {record.check_out
                ? format(new Date(record.check_out), "hh:mm a")
                : "—"}
            </TableCell>
            <TableCell>
              {record.working_hours != null
                ? `${record.working_hours.toFixed(1)}h`
                : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

- [ ] **Step 2: Commit**

```powershell
git add components/attendance/attendance-history-table.tsx
git commit -m "feat: add attendance history table component"
```

---

## Task 9: Create Monthly Attendance Chart

**Files:**
- Create: `components/attendance/monthly-attendance-chart.tsx`

- [ ] **Step 1: Create chart component**

Create `components/attendance/monthly-attendance-chart.tsx`:
```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export function MonthlyAttendanceChart() {
  const supabase = createClient();

  const { data: chartData, isLoading } = useQuery({
    queryKey: ["attendance", "monthly-chart"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfMonth(now);

      const { data } = await supabase
        .from("attendance")
        .select("date, status")
        .eq("user_id", user.id)
        .gte("date", start.toISOString().split("T")[0])
        .lte("date", end.toISOString().split("T")[0]);

      // Build daily status map
      const days = eachDayOfInterval({ start, end });
      return days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const record = data?.find((d) => d.date === dateStr);
        return {
          day: format(day, "dd"),
          status: record?.status || "absent",
        };
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-64 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  // Count statuses
  const summary = {
    present: chartData?.filter((d) => d.status === "present").length || 0,
    wfh: chartData?.filter((d) => d.status === "wfh").length || 0,
    absent: chartData?.filter((d) => d.status === "absent").length || 0,
    leave: chartData?.filter((d) => d.status === "leave").length || 0,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#22c55e" name="Present" />
              <Bar dataKey="wfh" fill="#3b82f6" name="WFH" />
              <Bar dataKey="leave" fill="#f59e0b" name="Leave" />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{summary.present}</p>
            <p className="text-xs text-muted-foreground">Present</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{summary.wfh}</p>
            <p className="text-xs text-muted-foreground">WFH</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{summary.leave}</p>
            <p className="text-xs text-muted-foreground">Leave</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
            <p className="text-xs text-muted-foreground">Absent</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```powershell
git add components/attendance/monthly-attendance-chart.tsx
git commit -m "feat: add monthly attendance chart with Recharts"
```

---

## Task 10: Create Attendance Page

**Files:**
- Modify: `app/(protected)/attendance/page.tsx`

- [ ] **Step 1: Replace attendance page**

Replace `app/(protected)/attendance/page.tsx`:
```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceClock } from "@/components/attendance/attendance-clock";
import { CheckInButton } from "@/components/attendance/check-in-button";
import { TodayStatus } from "@/components/attendance/today-status";
import { MonthlyAttendanceChart } from "@/components/attendance/monthly-attendance-chart";
import { AttendanceHistoryTable } from "@/components/attendance/attendance-history-table";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <Button variant="outline" asChild>
          <Link href="/attendance/history">
            <History className="mr-2 h-4 w-4" />
            View History
          </Link>
        </Button>
      </div>

      {/* Clock and Check-in */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Time
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <AttendanceClock />
            <CheckInButton />
          </CardContent>
        </Card>

        <TodayStatus />
      </div>

      {/* Monthly Chart */}
      <MonthlyAttendanceChart />

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceHistoryTable />
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```powershell
git add app/\(protected\)/attendance/page.tsx
git commit -m "feat: build attendance page with clock, check-in, chart, and history"
```

---

## Task 11: Create Attendance History Page

**Files:**
- Create: `app/(protected)/attendance/history/page.tsx`

- [ ] **Step 1: Create history page**

Create `app/(protected)/attendance/history/page.tsx`:
```typescript
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceHistoryTable } from "@/components/attendance/attendance-history-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AttendanceHistoryPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterKey, setFilterKey] = useState(0);

  const handleFilter = () => {
    setFilterKey((k) => k + 1);
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    setFilterKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/attendance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Attendance History</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Filter by Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="start">Start Date</Label>
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End Date</Label>
              <Input
                id="end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={handleFilter}>Apply Filter</Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardContent className="p-0">
          <AttendanceHistoryTable
            key={filterKey}
            startDate={startDate || undefined}
            endDate={endDate || undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```powershell
git add app/\(protected\)/attendance/history/
git commit -m "feat: add attendance history page with date filters"
```

---

## Task 12: Update Dashboard with Attendance Widget

**Files:**
- Modify: `app/(protected)/dashboard/page.tsx`

- [ ] **Step 1: Update dashboard**

Replace `app/(protected)/dashboard/page.tsx`:
```typescript
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useTodayAttendance } from "@/hooks/use-attendance";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, LogIn, LogOut } from "lucide-react";

export default function DashboardPage() {
  const { profile, loading: authLoading } = useAuth();
  const { data: attendance, isLoading: attendanceLoading } = useTodayAttendance();

  if (authLoading || attendanceLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {profile?.full_name?.split(" ")[0] || "User"}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={attendance?.status === "present" ? "default" : "secondary"}>
              {attendance?.status?.replace("_", " ") || "Not checked in"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Check In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {attendance?.check_in
                ? new Date(attendance.check_in).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Working Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {attendance?.working_hours != null
                ? `${attendance.working_hours.toFixed(1)}h`
                : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize">{profile?.role}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```powershell
git add app/\(protected\)/dashboard/page.tsx
git commit -m "feat: update dashboard with attendance widget"
```

---

## Task 13: Final Verification

**Files:** None

- [ ] **Step 1: Build verification**

Run:
```powershell
cd "C:\Users\91810\OneDrive - RCM Group of Institution\Desktop\OfficeAttend\officehub"
npm run build
```

Expected: Build succeeds

- [ ] **Step 2: Lint check**

```powershell
npm run lint
```

Expected: No errors

- [ ] **Step 3: Final commit**

```powershell
git add .
git commit -m "chore: Phase 2 core attendance complete"
```

---

## Phase 2 Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | GPS utility | lib/geo.ts |
| 2 | Validation schemas | lib/validations/attendance.ts |
| 3 | Query helpers | lib/supabase/queries.ts |
| 4 | Check-in API | app/api/attendance/check-in/route.ts |
| 5 | Check-out API | app/api/attendance/check-out/route.ts |
| 6 | Attendance hooks | hooks/use-attendance.ts, hooks/use-gps.ts |
| 7 | Attendance components | components/attendance/* |
| 8 | History table | components/attendance/attendance-history-table.tsx |
| 9 | Monthly chart | components/attendance/monthly-attendance-chart.tsx |
| 10 | Attendance page | app/(protected)/attendance/page.tsx |
| 11 | History page | app/(protected)/attendance/history/page.tsx |
| 12 | Dashboard update | app/(protected)/dashboard/page.tsx |
| 13 | Verification | build + lint |

**After Phase 2, you have:**
- Working check-in/out with GPS geofence validation
- Working hours calculation
- Late arrival detection
- Today's status display
- Monthly attendance chart
- Attendance history with date filters
- Updated dashboard with attendance widget

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCheckIn, useCheckOut, useTodayAttendance } from "@/hooks/use-attendance";
import { useGps } from "@/hooks/use-gps";
import { LogIn, LogOut, Loader2, MapPin } from "lucide-react";

export function CheckInButton() {
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
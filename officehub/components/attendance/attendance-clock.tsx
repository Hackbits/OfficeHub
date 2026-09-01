"use client";

import { useState, useEffect } from "react";

export function AttendanceClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-3xl font-mono font-bold tabular-nums">
      {time
        ? time.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })
        : "--:--:-- --"}
    </div>
  );
}
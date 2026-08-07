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

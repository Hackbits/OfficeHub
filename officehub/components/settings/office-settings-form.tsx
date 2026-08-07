"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOfficeSettings, useUpdateSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { Save } from "lucide-react";

function getInitialForm(settings: Record<string, string> | undefined) {
  return {
    office_latitude: settings?.office_latitude || "",
    office_longitude: settings?.office_longitude || "",
    geofence_radius: settings?.geofence_radius || "",
    office_start: settings?.office_start || "",
    office_end: settings?.office_end || "",
    standard_hours: settings?.standard_hours || "",
    late_threshold_minutes: settings?.late_threshold_minutes || "",
    overtime_threshold: settings?.overtime_threshold || "",
    half_day_max: settings?.half_day_max || "",
  };
}

export function OfficeSettingsForm() {
  const { data: settings, isLoading } = useOfficeSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState(() => getInitialForm(undefined));
  const [loaded, setLoaded] = useState(false);

  // Initialize form once when settings load
  if (settings && !loaded) {
    setForm(getInitialForm(settings));
    setLoaded(true);
  }

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        office_latitude: parseFloat(form.office_latitude),
        office_longitude: parseFloat(form.office_longitude),
        geofence_radius: parseInt(form.geofence_radius),
        office_start: form.office_start,
        office_end: form.office_end,
        standard_hours: parseInt(form.standard_hours),
        late_threshold_minutes: parseInt(form.late_threshold_minutes),
        overtime_threshold: parseInt(form.overtime_threshold),
        half_day_max: parseInt(form.half_day_max),
      });
      toast.success("Settings updated successfully");
    } catch {
      toast.error("Failed to update settings");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 animate-pulse bg-muted rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Office Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={form.office_latitude}
                onChange={(e) => setForm({ ...form, office_latitude: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={form.office_longitude}
                onChange={(e) => setForm({ ...form, office_longitude: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="geofence">Geofence Radius (meters)</Label>
            <Input
              id="geofence"
              type="number"
              value={form.geofence_radius}
              onChange={(e) => setForm({ ...form, geofence_radius: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Working Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start">Office Start</Label>
              <Input
                id="start"
                type="time"
                value={form.office_start}
                onChange={(e) => setForm({ ...form, office_start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Office End</Label>
              <Input
                id="end"
                type="time"
                value={form.office_end}
                onChange={(e) => setForm({ ...form, office_end: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="standard">Standard Hours</Label>
              <Input
                id="standard"
                type="number"
                value={form.standard_hours}
                onChange={(e) => setForm({ ...form, standard_hours: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="late">Late Threshold (minutes)</Label>
              <Input
                id="late"
                type="number"
                value={form.late_threshold_minutes}
                onChange={(e) => setForm({ ...form, late_threshold_minutes: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="overtime">Overtime Threshold (hours)</Label>
              <Input
                id="overtime"
                type="number"
                value={form.overtime_threshold}
                onChange={(e) => setForm({ ...form, overtime_threshold: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="halfday">Half Day Max (hours)</Label>
              <Input
                id="halfday"
                type="number"
                value={form.half_day_max}
                onChange={(e) => setForm({ ...form, half_day_max: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={updateSettings.isPending}>
        <Save className="mr-2 h-4 w-4" />
        {updateSettings.isPending ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}

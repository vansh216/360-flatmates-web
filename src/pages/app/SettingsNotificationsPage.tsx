import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { useUpdateProfile, useMyProfile } from "@/hooks/queries";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";

interface NotificationToggle {
  key: string;
  label: string;
  defaultOn: boolean;
}

const NOTIFICATION_TOGGLES: NotificationToggle[] = [
  { key: "push_notifications", label: "Push notifications", defaultOn: true },
  { key: "new_matches", label: "New matches", defaultOn: true },
  { key: "messages", label: "Messages", defaultOn: true },
  { key: "visit_reminders", label: "Visit reminders", defaultOn: true },
  { key: "listing_updates", label: "Listing updates", defaultOn: true },
  { key: "promotional", label: "Promotional", defaultOn: false },
  { key: "quiet_hours", label: "Quiet hours 10 PM to 8 AM", defaultOn: false }
];

function buildInitialToggles(savedPrefs: Record<string, boolean>): Record<string, boolean> {
  const initial: Record<string, boolean> = {};
  for (const t of NOTIFICATION_TOGGLES) {
    initial[t.key] = savedPrefs[t.key] ?? t.defaultOn;
  }
  return initial;
}

export function SettingsNotificationsPage() {
  const navigate = useNavigate();
  const { data: profile } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPrefs = useRef<Record<string, boolean> | null>(null);

  const savedPrefs = useMemo(
    () => (profile?.preferences as Record<string, boolean> | undefined) ?? {},
    [profile?.preferences]
  );

  const [userEdits, setUserEdits] = useState<Record<string, boolean> | null>(null);
  const baseToggles = useMemo(() => buildInitialToggles(savedPrefs), [savedPrefs]);
  const toggles = userEdits ?? baseToggles;

  const flushPrefs = useCallback(() => {
    if (pendingPrefs.current) {
      updateProfile.mutate({ preferences: pendingPrefs.current });
      pendingPrefs.current = null;
    }
  }, [updateProfile]);

  const handleToggle = useCallback(
    (key: string) => {
      const next = { ...toggles, [key]: !toggles[key] };
      setUserEdits(next);
      pendingPrefs.current = next;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(flushPrefs, 500);
    },
    [toggles, flushPrefs]
  );

  return (
    <div className="flex flex-col gap-5 page-fade">
      <div className="flex items-center gap-3">
        <Button variant="icon" size="icon" onClick={() => navigate("/profile")}>
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </Button>
        <h1 className="text-h1">Notification Settings</h1>
      </div>

      <Card className="divide-y divide-line p-0">
        {NOTIFICATION_TOGGLES.map((item) => (
          <div
            key={item.key}
            className="flex min-h-14 items-center justify-between px-4 py-3"
          >
            <span className="text-body-md font-medium text-ink">{item.label}</span>
            <Toggle
              checked={toggles[item.key]}
              onCheckedChange={() => handleToggle(item.key)}
              label={item.label}
            />
          </div>
        ))}
      </Card>
    </div>
  );
}

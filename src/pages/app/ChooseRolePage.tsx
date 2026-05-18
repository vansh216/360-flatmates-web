import { useState } from "react";
import { useNavigate } from "react-router";
import { Home, Search, Shuffle } from "lucide-react";
import { useMyProfile, useUpdateProfile } from "@/hooks/queries";
import type { UserMode } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { uiStore } from "@/lib/stores/ui-store";

const MODE_OPTIONS: Array<{
  value: UserMode;
  label: string;
  description: string;
  icon: typeof Home;
}> = [
  {
    value: "room_poster",
    label: "Room Poster",
    description: "You have a room or property to list. Find compatible flatmates to fill it.",
    icon: Home,
  },
  {
    value: "co_hunter",
    label: "Co-Hunter",
    description: "You are looking for a room or flatmate. Browse listings and find your match.",
    icon: Search,
  },
  {
    value: "open_to_both",
    label: "Open to Both",
    description: "You might list a room or look for one. Get the full experience.",
    icon: Shuffle,
  },
];

export function ChooseRolePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const [selected, setSelected] = useState<UserMode | null>(profile?.mode ?? null);
  const [submitting, setSubmitting] = useState(false);

  async function handleContinue() {
    if (!selected) return;
    setSubmitting(true);
    try {
      await updateProfile.mutateAsync({ mode: selected });
      navigate("/home");
    } catch {
      uiStore.getState().pushToast({
        type: "error",
        title: "Could not save preference",
        description: "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <Skeleton variant="listItem" count={3} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 page-fade mx-auto max-w-lg">
      <div>
        <h1 className="text-h1">How do you want to use 360 Flatmates?</h1>
        <p className="mt-2 text-body-md text-ink-2">
          You can change this anytime from your profile settings.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {MODE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selected === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelected(option.value)}
              aria-pressed={isSelected}
              className="flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors"
              style={{
                borderColor: isSelected ? "var(--color-accent)" : undefined,
                borderWidth: isSelected ? "1.5px" : undefined,
                backgroundColor: isSelected ? "var(--color-accent-soft)" : undefined,
              }}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  isSelected ? "bg-accent text-surface" : "bg-paper-3 text-ink-2"
                }`}
              >
                <Icon aria-hidden="true" className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-body-md font-semibold text-ink">{option.label}</p>
                <p className="text-caption text-ink-3">{option.description}</p>
              </div>
              {isSelected && (
                <div className="h-3 w-3 shrink-0 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>

      <Button
        fullWidth
        disabled={!selected}
        loading={submitting}
        onClick={handleContinue}
      >
        Continue
      </Button>
    </div>
  );
}

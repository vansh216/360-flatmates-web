import { useStore } from "zustand";
import { useNavigate } from "react-router";
import { ArrowLeft, Sun, Moon, Monitor } from "lucide-react";
import { uiStore, type ThemePreference } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/component-utils";

const THEME_OPTIONS: Array<{
  value: ThemePreference;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  {
    value: "light",
    label: "Light",
    description: "Warm off-white paper background with dark text",
    icon: Sun
  },
  {
    value: "dark",
    label: "Dark",
    description: "Warm charcoal background with light text",
    icon: Moon
  },
  {
    value: "system",
    label: "System",
    description: "Follows your device appearance setting",
    icon: Monitor
  }
];

const LIGHT_SWATCHES = [
  { token: "Paper", className: "bg-paper" },
  { token: "Surface", className: "bg-surface" },
  { token: "Accent", className: "bg-accent" },
  { token: "Ink", className: "bg-ink" }
];

const DARK_SWATCHES = [
  { token: "Paper (dark)", className: "bg-[#1a1612]" },
  { token: "Surface (dark)", className: "bg-[#2a2520]" },
  { token: "Accent", className: "bg-accent" },
  { token: "Ink (dark)", className: "bg-[#f4f3ee]" }
];

export function AppearancePage() {
  const navigate = useNavigate();
  const theme = useStore(uiStore, (s) => s.theme);
  const setTheme = useStore(uiStore, (s) => s.setTheme);

  return (
    <div className="flex flex-col gap-5 page-fade">
      <div className="flex items-center gap-3">
        <Button variant="icon" size="icon" onClick={() => navigate("/profile")}>
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </Button>
        <h1 className="text-h1">Appearance</h1>
      </div>

      <div className="flex flex-col gap-3">
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = theme === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              aria-pressed={selected}
              className={cn(
                "flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors",
                selected
                  ? "border-[1.5px] border-accent bg-accent-soft"
                  : "border-line bg-surface hover:border-accent/40 hover:shadow-hover"
              )}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  selected ? "bg-accent text-surface" : "bg-paper-3 text-ink-2"
                }`}
              >
                <Icon aria-hidden="true" className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-body-md font-semibold text-ink">{option.label}</p>
                <p className="text-caption text-ink-3">{option.description}</p>
              </div>
              {selected && (
                <div className="h-3 w-3 shrink-0 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>

      <h2 className="text-label-md text-ink-3 mt-2 px-1">Theme Preview</h2>
      <Card className="p-4">
        <p className="text-label-md text-ink-3 mb-3">Light mode tokens</p>
        <div className="flex flex-wrap gap-3">
          {LIGHT_SWATCHES.map((swatch) => (
            <div key={swatch.token} className="flex flex-col items-center gap-1.5">
              <div
                className={`h-12 w-12 rounded-xl border border-line ${swatch.className}`}
              />
              <span className="text-caption text-ink-3">{swatch.token}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-label-md text-ink-3 mb-3">Dark mode tokens</p>
        <div className="flex flex-wrap gap-3">
          {DARK_SWATCHES.map((swatch) => (
            <div key={swatch.token} className="flex flex-col items-center gap-1.5">
              <div
                className={`h-12 w-12 rounded-xl border border-line ${swatch.className}`}
                data-theme-swatch="dark"
              />
              <span className="text-caption text-ink-3">{swatch.token}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

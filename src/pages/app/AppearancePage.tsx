import { useStore } from "zustand";
import { useNavigate } from "react-router";
import { ArrowLeft, Sun, Moon, Monitor, Palette } from "lucide-react";
import {
  uiStore,
  type ThemePreference,
  type PalettePreference,
  THEME_OPTIONS,
} from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SelectableCardGrid } from "@/components/molecules/SelectableCardGrid";

const THEME_ICONS: Record<ThemePreference, React.ReactNode> = {
  light: <Sun aria-hidden="true" className="h-6 w-6" />,
  dark: <Moon aria-hidden="true" className="h-6 w-6" />,
  system: <Monitor aria-hidden="true" className="h-6 w-6" />,
};
const THEME_DESCRIPTIONS: Record<ThemePreference, string> = {
  light: "Warm off-white paper background with dark text",
  dark: "Warm charcoal background with light text",
  system: "Follows your device appearance setting",
};

const PALETTE_OPTIONS: Array<{ value: PalettePreference; label: string; description: string }> = [
  { value: "terracotta", label: "Terracotta", description: "Warm, earthy orange accent" },
  { value: "ember", label: "Ember", description: "Golden, sunset-toned accent" },
  { value: "monsoon_teal", label: "Monsoon Teal", description: "Cool, refreshing teal accent" },
];

const PALETTE_ICONS: Record<PalettePreference, React.ReactNode> = {
  terracotta: (
    <div className="flex h-6 w-6 items-center justify-center">
      <span className="h-5 w-5 rounded-full bg-[#C96442]" aria-hidden="true" />
    </div>
  ),
  ember: (
    <div className="flex h-6 w-6 items-center justify-center">
      <span className="h-5 w-5 rounded-full bg-[#D17847]" aria-hidden="true" />
    </div>
  ),
  monsoon_teal: (
    <div className="flex h-6 w-6 items-center justify-center">
      <span className="h-5 w-5 rounded-full bg-[#5A9DA8]" aria-hidden="true" />
    </div>
  ),
};

const LIGHT_SWATCHES = [
  { token: "Paper", className: "bg-paper" },
  { token: "Surface", className: "bg-surface" },
  { token: "Accent", className: "bg-accent" },
  { token: "Ink", className: "bg-ink" },
];

const DARK_SWATCHES = [
  { token: "Paper", className: "bg-paper" },
  { token: "Surface", className: "bg-surface" },
  { token: "Accent", className: "bg-accent" },
  { token: "Ink", className: "bg-ink" },
];

export function AppearancePage() {
  const navigate = useNavigate();
  const theme = useStore(uiStore, (s) => s.theme);
  const setTheme = useStore(uiStore, (s) => s.setTheme);
  const palette = useStore(uiStore, (s) => s.palette);
  const setPalette = useStore(uiStore, (s) => s.setPalette);

  return (
    <div className="flex flex-col gap-5 page-fade">
      <div className="flex items-center gap-3">
        <Button variant="icon" size="icon" onClick={() => navigate("/profile")}>
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </Button>
        <h1 className="text-h1">Appearance</h1>
      </div>

      <h2 className="text-label-md text-ink-3 px-1">Theme</h2>
      <SelectableCardGrid<ThemePreference>
        options={THEME_OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
          description: THEME_DESCRIPTIONS[o.value],
        }))}
        iconMap={THEME_ICONS}
        selected={theme}
        onSelect={setTheme}
      />

      <h2 className="text-label-md text-ink-3 px-1">Accent Color</h2>
      <SelectableCardGrid<PalettePreference>
        options={PALETTE_OPTIONS}
        iconMap={PALETTE_ICONS}
        selected={palette}
        onSelect={setPalette}
      />

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

      <div data-theme="dark">
        <Card className="p-4">
          <p className="text-label-md mb-3" style={{ color: "var(--color-ink-3)" }}>
            Dark mode tokens
          </p>
          <div className="flex flex-wrap gap-3">
            {DARK_SWATCHES.map((swatch) => (
              <div key={swatch.token} className="flex flex-col items-center gap-1.5">
                <div
                  className={`h-12 w-12 rounded-xl ${swatch.className}`}
                  style={{ border: "1px solid var(--color-line)" }}
                />
                <span className="text-caption" style={{ color: "var(--color-ink-3)" }}>{swatch.token}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-2 px-1 pb-4">
        <Palette aria-hidden="true" className="h-4 w-4 text-ink-3" />
        <p className="text-caption text-ink-3">
          Current accent: {PALETTE_OPTIONS.find((o) => o.value === palette)?.label}
        </p>
      </div>
    </div>
  );
}

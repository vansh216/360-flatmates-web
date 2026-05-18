import { Card } from "@/components/ui/Card";
import {
  formatLocation,
  formatBudgetRange,
  formatMoveInTimeline,
  formatLifestyleLabel
} from "@/lib/utils";
import { LIFESTYLE_DIMENSIONS } from "@/lib/data/domain";
import type { LifestyleDimensionKey } from "@/lib/data/domain";

export interface ProfileDetailsData {
  bio?: string;
  age?: number;
  locality?: string;
  city?: string;
  budget_min?: number;
  budget_max?: number;
  move_in_timeline?: string;
  sleep_schedule?: string;
  cleanliness?: string;
  food_habits?: string;
  smoking_drinking?: string;
  guests_policy?: string;
  work_style?: string;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-body-md text-ink-2">{label}</span>
      <span className="text-body-md text-ink">{value}</span>
    </div>
  );
}

export function ProfileDetailsTab({ profile }: { profile: ProfileDetailsData }) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      {profile.bio && (
        <p className="text-body-md text-ink-2">{profile.bio}</p>
      )}

      {profile.age && <DetailRow label="Age" value={profile.age} />}

      {profile.city && (
        <DetailRow
          label="City"
          value={formatLocation(profile.locality, profile.city)}
        />
      )}

      {profile.budget_min !== undefined && profile.budget_max !== undefined && (
        <DetailRow
          label="Budget"
          value={formatBudgetRange(profile.budget_min, profile.budget_max)}
        />
      )}

      {profile.move_in_timeline && (
        <DetailRow
          label="Move-in"
          value={formatMoveInTimeline(profile.move_in_timeline)}
        />
      )}
    </Card>
  );
}

export function ProfileLifestyleTab({ profile }: { profile: ProfileDetailsData }) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      {LIFESTYLE_DIMENSIONS.map((dim) => {
        const value = profile[dim.key as LifestyleDimensionKey];
        if (!value) return null;
        return (
          <DetailRow
            key={dim.key}
            label={dim.label}
            value={formatLifestyleLabel(dim.key, value)}
          />
        );
      })}
    </Card>
  );
}

/** @deprecated Use ProfileDetailsTab and ProfileLifestyleTab instead */
export function ProfileDetailsCard({ profile }: { profile: ProfileDetailsData }) {
  return (
    <>
      <ProfileDetailsTab profile={profile} />
      <ProfileLifestyleTab profile={profile} />
    </>
  );
}

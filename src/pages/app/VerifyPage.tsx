import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, CheckCircle2, Shield, Smartphone, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StepProgress } from "@/components/ui/StepProgress";

type VerifyStep = "phone" | "id" | "profile";

const STEPS = [
  { key: "phone" as const, label: "Phone Verified", icon: Smartphone },
  { key: "id" as const, label: "ID Verification", icon: Shield },
  { key: "profile" as const, label: "Profile Complete", icon: UserCheck },
];

export function VerifyPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<VerifyStep>("phone");

  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <div className="flex flex-col gap-5 page-fade mx-auto max-w-lg">
      <div className="flex items-center gap-3">
        <Button variant="icon" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </Button>
        <h1 className="text-h1">Verification</h1>
      </div>

      <Card className="flex flex-col items-center gap-4 p-6 text-center">
        <ProgressRing value={progress} size="xl" />
        <p className="text-body-md text-ink-2">
          Complete all steps to earn your verified badge and build trust with the community.
        </p>
      </Card>

      <StepProgress
        totalSteps={STEPS.length}
        currentStep={stepIndex}
        variant="linear"
        labels={STEPS.map((s) => s.label)}
      />

      <Card className="divide-y divide-line p-0">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isComplete = i < stepIndex;
          const isCurrent = i === stepIndex;

          return (
            <div
              key={step.key}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isComplete
                    ? "bg-success-soft text-success"
                    : isCurrent
                    ? "bg-accent-soft text-accent"
                    : "bg-paper-3 text-ink-4"
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
                ) : (
                  <Icon aria-hidden="true" className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-body-md font-semibold text-ink">{step.label}</p>
                <p className="text-caption text-ink-3">
                  {isComplete ? "Completed" : isCurrent ? "In progress" : "Pending"}
                </p>
              </div>
              {isCurrent && (
                <Button size="compact" onClick={() => {
                  // Advance to next step for demo
                  const nextIndex = i + 1;
                  if (nextIndex < STEPS.length) {
                    setCurrentStep(STEPS[nextIndex].key);
                  }
                }}>
                  Verify
                </Button>
              )}
            </div>
          );
        })}
      </Card>
    </div>
  );
}

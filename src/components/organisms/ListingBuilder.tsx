import type { HTMLAttributes, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { BottomActionBar } from "../ui/Layout";
import { Button } from "../ui/Button";
import { Logo } from "../ui/Logo";
import { StepProgress } from "../ui/StepProgress";
import { cn } from "../ui/component-utils";

export interface ListingBuilderStep {
  id: string;
  label: string;
}

export interface ListingBuilderProps extends HTMLAttributes<HTMLElement> {
  steps: ListingBuilderStep[];
  currentStep: number;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  onSaveDraft?: () => void;
  nextLabel?: string;
  submitting?: boolean;
  nextDisabled?: boolean;
}

export function ListingBuilder({
  steps,
  currentStep,
  children,
  onBack,
  onNext,
  onSaveDraft,
  nextLabel,
  submitting = false,
  nextDisabled = false,
  className,
  ...props
}: ListingBuilderProps) {
  const finalStep = currentStep >= steps.length - 1;

  return (
    <section className={cn("mx-auto flex min-h-screen w-full max-w-[640px] flex-col bg-paper", className)} {...props}>
      <header className="flex h-14 items-center justify-between border-b border-line px-4">
        <Button aria-label="Back" size="icon" variant="icon" onClick={onBack}>
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </Button>
        <Logo compact />
        <span className="h-10 w-10" />
      </header>
      <div className="px-5 py-4">
        <StepProgress currentStep={currentStep} labels={steps.map((step) => step.label)} totalSteps={steps.length} />
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-2">{children}</div>
      <BottomActionBar className="mx-0 md:mx-0">
        {onSaveDraft && finalStep ? (
          <Button variant="tertiary" onClick={onSaveDraft}>
            Save as Draft
          </Button>
        ) : null}
        <Button variant="tertiary" onClick={onBack}>
          Back
        </Button>
        <Button loading={submitting} disabled={nextDisabled} onClick={onNext}>
          {nextLabel ?? (finalStep ? "Publish Listing" : "Next")}
        </Button>
      </BottomActionBar>
    </section>
  );
}


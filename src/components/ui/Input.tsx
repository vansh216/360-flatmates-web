import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";
import { useId } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { cn, focusRing, interactiveMotion } from "./component-utils";

export interface FieldChromeProps {
  label?: string;
  helperText?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
}

export interface InputProps
  extends FieldChromeProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {}

export interface TextAreaProps
  extends FieldChromeProps,
    TextareaHTMLAttributes<HTMLTextAreaElement> {}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps
  extends FieldChromeProps,
    SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
}

function FieldLabel({ id, label }: { id: string; label?: string }) {
  if (!label) {
    return null;
  }

  return (
    <label className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink-3" htmlFor={id}>
      {label}
    </label>
  );
}

function FieldHelp({
  helperId,
  errorId,
  helperText,
  error
}: {
  helperId: string;
  errorId: string;
  helperText?: string;
  error?: string;
}) {
  if (error) {
    return (
      <p className="flex items-center gap-1.5 text-caption text-error" id={errorId}>
        <AlertCircle aria-hidden="true" className="h-4 w-4" />
        {error}
      </p>
    );
  }

  if (helperText) {
    return (
      <p className="text-caption text-ink-3" id={helperId}>
        {helperText}
      </p>
    );
  }

  return null;
}

const controlClasses =
  "w-full border border-line bg-surface text-body-md text-ink placeholder:text-ink-3 disabled:cursor-not-allowed disabled:bg-paper-4 disabled:text-ink-4";

export function Input({
  label,
  helperText,
  error,
  leadingIcon,
  trailingIcon,
  fullWidth = true,
  className,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  return (
    <div className={cn("flex flex-col gap-2", fullWidth && "w-full")}>
      <FieldLabel id={inputId} label={label} />
      <div
        className={cn(
          "group flex min-h-12 items-center gap-2 rounded-[9px] border border-line bg-surface px-3 focus-within:scale-[1.01] focus-within:border-accent/50 focus-within:shadow-focus",
          interactiveMotion,
          error && "border-error",
          props.disabled && "bg-paper-4"
        )}
      >
        {leadingIcon ? (
          <span className="text-ink-3 group-focus-within:text-accent">{leadingIcon}</span>
        ) : null}
        <input
          id={inputId}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          aria-invalid={error ? true : undefined}
          className={cn("min-w-0 flex-1 bg-transparent py-3 outline-none", controlClasses, "border-0 p-0", className)}
          {...props}
        />
        {trailingIcon ? <span className="text-ink-3">{trailingIcon}</span> : null}
      </div>
      <FieldHelp error={error} errorId={errorId} helperId={helperId} helperText={helperText} />
    </div>
  );
}

export function TextArea({
  label,
  helperText,
  error,
  fullWidth = true,
  className,
  id,
  ...props
}: TextAreaProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  return (
    <div className={cn("flex flex-col gap-2", fullWidth && "w-full")}>
      <FieldLabel id={inputId} label={label} />
      <textarea
        id={inputId}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(
          controlClasses,
          focusRing,
          "min-h-[120px] max-h-[240px] resize-y rounded-[9px] px-3 py-3 outline-none focus:scale-[1.01] focus:border-accent/50 focus:shadow-focus",
          interactiveMotion,
          error && "border-error",
          className
        )}
        {...props}
      />
      <FieldHelp error={error} errorId={errorId} helperId={helperId} helperText={helperText} />
    </div>
  );
}

export function SelectField({
  label,
  helperText,
  error,
  leadingIcon,
  fullWidth = true,
  className,
  id,
  options,
  placeholder,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;

  return (
    <div className={cn("flex flex-col gap-2", fullWidth && "w-full")}>
      <FieldLabel id={selectId} label={label} />
      <div
        className={cn(
          "group flex min-h-12 items-center gap-2 rounded-[9px] border border-line bg-surface px-3 focus-within:scale-[1.01] focus-within:border-accent/50 focus-within:shadow-focus",
          interactiveMotion,
          error && "border-error",
          props.disabled && "bg-paper-4"
        )}
      >
        {leadingIcon ? (
          <span className="text-ink-3 group-focus-within:text-accent">{leadingIcon}</span>
        ) : null}
        <select
          id={selectId}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          aria-invalid={error ? true : undefined}
          className={cn(
            "min-w-0 flex-1 appearance-none bg-transparent py-3 text-body-md text-ink outline-none disabled:cursor-not-allowed disabled:text-ink-4",
            className
          )}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option disabled={option.disabled} key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden="true" className="h-4 w-4 text-ink-3" />
      </div>
      <FieldHelp error={error} errorId={errorId} helperId={helperId} helperText={helperText} />
    </div>
  );
}


import { useState, useCallback } from "react";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PhoneInput, formatFullPhone } from "@/components/ui/PhoneInput";
import { StepProgress } from "@/components/ui/StepProgress";
import { focusRing } from "@/components/ui/component-utils";

type SignupStep = "phone" | "verify";

const STEP_LABELS = ["Enter phone", "Verify OTP"];

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const { signInWithPhone, verifyOtp, signUp, signInWithGoogle } = useAuth();

  const [step, setStep] = useState<SignupStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const currentStepIndex = step === "phone" ? 0 : 1;

  const handleGoogleSignUp = useCallback(async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setGoogleLoading(false);
      setError(err instanceof Error ? err.message : "Google sign-up failed. Please try again.");
    }
  }, [signInWithGoogle]);

  const handleSendOtp = useCallback(async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithPhone(formatFullPhone(phone));
      setStep("verify");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [signInWithPhone, phone]);

  const handleVerifyAndSignUp = useCallback(async () => {
    setError(null);

    if (!password) {
      setError("Password is required.");
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      setError("Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const fullPhone = formatFullPhone(phone);
      await verifyOtp(fullPhone, otp);
      await signUp(fullPhone, password);
      navigate("/home");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to verify. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [verifyOtp, signUp, phone, otp, password, confirmPassword, navigate]);

  return (
    <>
      <StepProgress
        totalSteps={2}
        currentStep={currentStepIndex}
        variant="linear"
        labels={STEP_LABELS}
        className="mb-6"
      />

      <h1 className="text-h1">Create account</h1>
      <p className="mt-2 text-body-md text-ink-2">
        Enter your phone number, verify with OTP, and set a password.
      </p>

      {error && (
        <div className="mt-4 rounded-xl bg-error-soft p-3 text-caption text-error" role="alert">
          {error}
        </div>
      )}

      <Button
        fullWidth
        variant="secondary"
        className="mt-5"
        loading={googleLoading}
        onClick={handleGoogleSignUp}
      >
        <span className="flex items-center justify-center gap-2">
          <GoogleIcon className="h-4 w-4" />
          Sign up with Google
        </span>
      </Button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-caption text-ink-3">or</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      {step === "phone" && (
        <>
          <PhoneInput
            label="Phone number"
            value={phone}
            onChange={setPhone}
            className="mt-5"
            autoFocus
          />
          <Button
            fullWidth
            className="mt-5"
            loading={submitting}
            disabled={phone.length < 10}
            onClick={handleSendOtp}
          >
            Send OTP
          </Button>
        </>
      )}

      {step === "verify" && (
        <>
          <PhoneInput
            label="Phone number"
            value={phone}
            onChange={setPhone}
            className="mt-5"
            disabled
          />
          <Input
            label="OTP"
            placeholder="6-digit code"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="mt-4"
            autoFocus
          />
          <div className="relative mt-4">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className={`absolute right-3 top-[38px] text-ink-3 hover:text-ink ${focusRing}`}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
            </button>
          </div>
          <div className="relative mt-4">
            <Input
              label="Confirm password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              className={`absolute right-3 top-[38px] text-ink-3 hover:text-ink ${focusRing}`}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-3 rounded-xl bg-paper-2 p-3 text-caption text-ink-2">
            Min 8 chars, 1 uppercase, 1 number, 1 special character.
          </div>
          <div className="mt-5 flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError(null);
              }}
            >
              Back
            </Button>
            <Button
              fullWidth
              loading={submitting}
              disabled={!otp || otp.length < 6 || !password || !confirmPassword}
              onClick={handleVerifyAndSignUp}
            >
              Verify & Sign up
            </Button>
          </div>
        </>
      )}

      <p className="mt-6 text-center text-body-md text-ink-2">
        Already have an account?{" "}
        <Link to="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}

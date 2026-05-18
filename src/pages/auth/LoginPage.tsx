import { useState, useCallback } from "react";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { PhoneInput, formatFullPhone } from "@/components/ui/PhoneInput";
import { Input } from "@/components/ui/Input";
import { focusRing } from "@/components/ui/component-utils";

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

export function LoginPage() {
  const navigate = useNavigate();
  const { signInWithPassword, signInWithGoogle } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = useCallback(async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setGoogleLoading(false);
      setError(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
    }
  }, [signInWithGoogle]);

  const handlePasswordLogin = useCallback(async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithPassword(formatFullPhone(phone), password);
      navigate("/home");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [signInWithPassword, phone, password, navigate]);

  return (
    <>
      <h1 className="text-h1">Sign in</h1>
      <p className="mt-2 text-body-md text-ink-2">
        Enter your phone number and password to continue.
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
        aria-label="Continue with Google"
        loading={googleLoading}
        onClick={handleGoogleLogin}
      >
        <span className="flex items-center justify-center gap-2">
          <GoogleIcon className="h-4 w-4" />
          Continue with Google
        </span>
      </Button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-caption text-ink-3">or</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <PhoneInput
        label="Phone number"
        value={phone}
        onChange={setPhone}
        autoFocus
      />
      <div className="relative mt-4">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
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
      <div className="mt-2 flex justify-end">
        <Link
          to="/forgot-password"
          className="text-label-md text-accent hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      <Button
        fullWidth
        className="mt-4"
        loading={submitting}
        disabled={phone.length < 10 || !password}
        onClick={handlePasswordLogin}
      >
        Sign in
      </Button>

      <p className="mt-6 text-center text-body-md text-ink-2">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </>
  );
}

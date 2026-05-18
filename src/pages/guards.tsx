import { type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";

const AUTH_ROUTES = new Set(["/login", "/signup", "/forgot-password"]);

export function AuthGuard() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    const redirectTo = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;
    return <Navigate to={redirectTo} replace />;
  }

  if (user && AUTH_ROUTES.has(location.pathname)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

export function AdminGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.app_metadata?.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

export function AuthRedirectGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (user && AUTH_ROUTES.has(location.pathname)) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

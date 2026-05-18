import { Outlet } from "react-router";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5 py-10">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-md">
        <Outlet />
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { useNavigate } from "react-router";

export function SettingsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/profile", { replace: true });
  }, [navigate]);

  return null;
}

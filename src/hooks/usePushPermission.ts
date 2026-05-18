import { useCallback, useState } from "react";
import {
  requestNotificationPermission,
  getFcmToken,
  requestAndRegisterPush
} from "@/lib/push/fcm";

function getInitialPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export interface PushPermissionState {
  permission: NotificationPermission | "unsupported";
  registered: boolean;
  token: string | null;
  loading: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  getToken: () => Promise<string | null>;
  register: () => Promise<string | null>;
}

export function usePushPermission(): PushPermissionState {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(getInitialPermission);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    setLoading(true);
    try {
      const result = await requestNotificationPermission();
      setPermission(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    setLoading(true);
    try {
      const fcmToken = await getFcmToken();
      if (fcmToken) {
        setToken(fcmToken);
      }
      return fcmToken;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (): Promise<string | null> => {
    setLoading(true);
    try {
      const registeredToken = await requestAndRegisterPush();
      if (registeredToken) {
        setToken(registeredToken);
        setPermission("granted");
      }
      return registeredToken;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    permission,
    registered: token !== null,
    token,
    loading,
    requestPermission,
    getToken,
    register
  };
}

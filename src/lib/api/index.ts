export * from "./client";
export * from "./errors";
export * from "./types";

import { createApiClient } from "./client";
import type { ApiAdapter } from "./client";

let _accessToken: string | null = null;

let _refreshHandler: (() => Promise<string | null>) | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

export function setRefreshTokenHandler(
  handler: (() => Promise<string | null>) | null
): void {
  _refreshHandler = handler;
}

async function handleRefresh(): Promise<string | null> {
  if (!_refreshHandler) return null;
  const newToken = await _refreshHandler();
  if (newToken) _accessToken = newToken;
  return newToken;
}

export const apiClient: ApiAdapter = createApiClient({
  getAccessToken: () => _accessToken,
  onAuthFailure: handleRefresh,
});

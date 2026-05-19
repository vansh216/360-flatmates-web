import { describe, it, expect, beforeEach } from "vitest";
import { authStore } from "../auth-store";

describe("authStore", () => {
  beforeEach(() => {
    authStore.setState({
      user: null,
      session: null,
      loading: true,
      isLoginModalOpen: false,
      pendingRedirect: null,
      authError: null,
    });
  });

  it("should have correct initial state", () => {
    const state = authStore.getState();
    expect(state.isLoginModalOpen).toBe(false);
    expect(state.pendingRedirect).toBeNull();
    expect(state.authError).toBeNull();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.loading).toBe(true);
  });

  it("openLoginModal sets isLoginModalOpen to true", () => {
    authStore.getState().openLoginModal();
    expect(authStore.getState().isLoginModalOpen).toBe(true);
  });

  it("closeLoginModal sets isLoginModalOpen to false", () => {
    authStore.getState().openLoginModal();
    authStore.getState().closeLoginModal();
    expect(authStore.getState().isLoginModalOpen).toBe(false);
  });

  it("setPendingRedirect sets pendingRedirect", () => {
    authStore.getState().setPendingRedirect("/dashboard");
    expect(authStore.getState().pendingRedirect).toBe("/dashboard");
  });

  it("clearPendingRedirect sets pendingRedirect to null", () => {
    authStore.getState().setPendingRedirect("/dashboard");
    authStore.getState().clearPendingRedirect();
    expect(authStore.getState().pendingRedirect).toBeNull();
  });

  it("setAuthError sets authError", () => {
    authStore.getState().setAuthError("Invalid credentials");
    expect(authStore.getState().authError).toBe("Invalid credentials");
  });

  it("clearAuthError sets authError to null", () => {
    authStore.getState().setAuthError("Something went wrong");
    authStore.getState().clearAuthError();
    expect(authStore.getState().authError).toBeNull();
  });

  it("setSession updates both session and user", () => {
    const mockSession = {
      access_token: "test",
      user: { id: "u1", email: "test@test.com" },
    } as unknown as import("@supabase/supabase-js").Session;

    authStore.getState().setSession(mockSession);

    expect(authStore.getState().session).toBe(mockSession);
    expect(authStore.getState().user).toBe(mockSession.user);
  });

  it("setSession to null clears user", () => {
    authStore.getState().setSession(null);
    expect(authStore.getState().session).toBeNull();
    expect(authStore.getState().user).toBeNull();
  });

  it("setLoading updates loading state", () => {
    authStore.getState().setLoading(false);
    expect(authStore.getState().loading).toBe(false);
  });
});

const ADMIN_SESSION_KEY = "bqr_admin_session_v2";
const ADMIN_2FA_KEY = "bqr_admin_2fa_v2";
const ACTIVE_ROLE_KEY = "bqr_active_role_v1";

type AppRole = "admin" | "citizen" | "guest";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.sessionStorage;
}

export function setActiveRole(role: AppRole) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(ACTIVE_ROLE_KEY, role);
}

export function getActiveRole(): AppRole {
  const storage = getStorage();
  if (!storage) return "guest";
  const role = storage.getItem(ACTIVE_ROLE_KEY);
  if (role === "admin" || role === "citizen" || role === "guest") {
    return role;
  }
  return "guest";
}

export function setAdminSession(isLoggedIn: boolean) {
  const storage = getStorage();
  if (!storage) return;
  if (isLoggedIn) {
    storage.setItem(ADMIN_SESSION_KEY, "1");
    setActiveRole("admin");
    return;
  }
  storage.removeItem(ADMIN_SESSION_KEY);
}

export function isAdminSessionActive() {
  const storage = getStorage();
  if (!storage) return false;
  return storage.getItem(ADMIN_SESSION_KEY) === "1";
}

export function setAdminSecondFactor(isVerified: boolean) {
  const storage = getStorage();
  if (!storage) return;
  if (isVerified) {
    storage.setItem(ADMIN_2FA_KEY, "1");
    return;
  }
  storage.removeItem(ADMIN_2FA_KEY);
}

export function isAdminSecondFactorVerified() {
  const storage = getStorage();
  if (!storage) return false;
  return storage.getItem(ADMIN_2FA_KEY) === "1";
}

export function clearAdminAuthState() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(ADMIN_SESSION_KEY);
  storage.removeItem(ADMIN_2FA_KEY);
  storage.removeItem(ACTIVE_ROLE_KEY);
}

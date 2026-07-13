import {
  clearAuthSession as clearApiAuthSession,
  getAccessToken as getApiAccessToken,
  getAuthUser,
  setAuthSession as setApiAuthSession,
} from "@/lib/api";

export function getAccessToken() {
  return getApiAccessToken();
}

export function setAccessToken(token) {
  setApiAuthSession({ accessToken: token, user: getAuthUser() });
}

export function setAuthSession(payload = {}) {
  setApiAuthSession(payload);
}

export function clearAuthSession() {
  clearApiAuthSession();
}

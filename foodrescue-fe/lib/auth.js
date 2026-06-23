let memoryAccessToken = null;

export function getAccessToken() {
  return memoryAccessToken;
}

export function setAccessToken(token) {
  memoryAccessToken = token || null;
}

export function setAuthSession({ accessToken, user }) {
  memoryAccessToken = accessToken || null;

  if (typeof window !== "undefined" && user) {
    localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(new Event("storage"));
  }
}

export function clearAuthSession() {
  memoryAccessToken = null;

  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("storage"));
  }
}

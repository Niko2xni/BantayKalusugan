import { clearAuthSession } from "./authSession";

export const USER_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const AUTH_REDIRECT_ERROR = "AUTH_REDIRECT";

export async function userFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${USER_API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    clearAuthSession();
    window.location.assign("/login");
    throw new Error(AUTH_REDIRECT_ERROR);
  }

  return response;
}

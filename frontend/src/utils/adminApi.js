import { clearAuthSession } from "./authSession";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const AUTH_REDIRECT_ERROR = "AUTH_REDIRECT";

export async function adminFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
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

/**
 * Convert a raw Azure Blob URL into a backend-proxied URL that
 * requires admin authentication.  Non-Azure URLs are returned as-is.
 */
export function getSecureDocumentUrl(rawUrl) {
  if (!rawUrl) return null;
  if (!rawUrl.includes("blob.core.windows.net")) return rawUrl;

  const token = localStorage.getItem("token");
  const encoded = encodeURIComponent(rawUrl);
  return `${API_BASE_URL}/api/admin/documents/view?url=${encoded}&token=${token}`;
}
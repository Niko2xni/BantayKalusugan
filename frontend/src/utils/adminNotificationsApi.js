import { adminFetch } from "./adminApi";

async function parseApiError(response, fallbackMessage) {
  try {
    const payload = await response.json();
    return payload.detail || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function fetchAdminNotifications({ onlyUnread = false } = {}) {
  const query = onlyUnread ? "?only_unread=true" : "";
  const response = await adminFetch(`/api/admin/notifications${query}`);
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Unable to load notifications."));
  }
  return response.json();
}

export async function markAdminNotificationRead(notificationId) {
  const response = await adminFetch(`/api/admin/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Unable to mark notification as read."));
  }
  return response.json();
}

export async function markAllAdminNotificationsRead() {
  const response = await adminFetch("/api/admin/notifications/read-all", {
    method: "PATCH",
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Unable to mark notifications as read."));
  }
  return response.json();
}
import { userFetch } from "./userApi";

async function parseApiError(response, fallbackMessage) {
  try {
    const payload = await response.json();
    return payload.detail || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function fetchAppointments(status = "") {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const response = await userFetch(`/api/me/appointments${query}`);
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Unable to load appointments."));
  }
  return response.json();
}

export async function requestAppointment(payload) {
  const response = await userFetch("/api/me/appointments/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Unable to request appointment."));
  }
  return response.json();
}

export async function cancelAppointment(appointmentId) {
  const response = await userFetch(`/api/me/appointments/${appointmentId}/cancel`, {
    method: "PATCH",
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Unable to cancel appointment."));
  }
  return response.json();
}

export async function rescheduleAppointment(appointmentId, payload) {
  const response = await userFetch(`/api/me/appointments/${appointmentId}/reschedule`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Unable to reschedule appointment."));
  }
  return response.json();
}

export async function fetchNotifications({ onlyUnread = false } = {}) {
  const query = onlyUnread ? "?only_unread=true" : "";
  const response = await userFetch(`/api/me/notifications${query}`);
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Unable to load notifications."));
  }
  return response.json();
}

export async function markNotificationRead(notificationId) {
  const response = await userFetch(`/api/me/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Unable to mark notification as read."));
  }
  return response.json();
}

export async function markAllNotificationsRead() {
  const response = await userFetch("/api/me/notifications/read-all", {
    method: "PATCH",
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Unable to mark notifications as read."));
  }
  return response.json();
}

export async function fetchChatMessages(channel = "support") {
  const response = await userFetch(`/api/me/chat/messages?channel=${encodeURIComponent(channel)}`);
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Unable to load chat messages."));
  }
  return response.json();
}

export async function sendChatMessage(payload) {
  const response = await userFetch("/api/me/chat/messages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Unable to send chat message."));
  }
  return response.json();
}

export async function fetchHelpArticles() {
  const response = await userFetch("/api/help/articles");
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Unable to load help content."));
  }
  const payload = await response.json();
  return Array.isArray(payload.items) ? payload.items : [];
}

export async function fetchVitalSubmissions(status = "") {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const response = await userFetch(`/api/me/vitals/submissions${query}`);
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Unable to load submitted vitals."));
  }
  return response.json();
}

export async function createVitalSubmission(payload) {
  const response = await userFetch("/api/me/vitals/submissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Unable to submit vital signs."));
  }
  return response.json();
}

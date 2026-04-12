export const NOTIFICATIONS_REFRESH_EVENT = "bk:notifications:refresh";


export function notifyNotificationsRefresh(source = "unknown") {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(NOTIFICATIONS_REFRESH_EVENT, {
      detail: { source, timestamp: Date.now() },
    })
  );
}


export function subscribeToNotificationsRefresh(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = (event) => {
    callback(event?.detail || {});
  };

  window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, handler);
  return () => {
    window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, handler);
  };
}

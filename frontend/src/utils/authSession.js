export function clearAuthSession() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}

export function getStoredUser() {
  const rawUser = localStorage.getItem("user");
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    clearAuthSession();
    return null;
  }
}

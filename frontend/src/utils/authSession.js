export function clearAuthSession() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}

export function setStoredUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
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

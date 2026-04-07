import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import ProtectedRoute from "./ProtectedRoute";

function renderProtectedRoute({ initialPath = "/admin", requiredRole = "admin" } = {}) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={<div>User Dashboard</div>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole={requiredRole}>
              <div>Admin Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("redirects unauthenticated users to login", () => {
    renderProtectedRoute();

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("redirects non-admin users away from admin routes", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 7, role: "patient", email: "patient@example.com" })
    );
    localStorage.setItem("token", "token-patient");

    renderProtectedRoute();

    expect(screen.getByText("User Dashboard")).toBeInTheDocument();
  });

  it("allows admins to access admin routes", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1, role: "admin", email: "admin@example.com" })
    );
    localStorage.setItem("token", "token-admin");

    renderProtectedRoute();

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });

  it("redirects admins away from patient-only routes to admin dashboard", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1, role: "admin", email: "admin@example.com" })
    );
    localStorage.setItem("token", "token-admin");

    render(
      <MemoryRouter initialEntries={["/patient"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/dashboard" element={<div>User Dashboard</div>} />
          <Route path="/admin" element={<div>Admin Dashboard</div>} />
          <Route
            path="/patient"
            element={
              <ProtectedRoute requiredRole="patient">
                <div>Patient Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });
});

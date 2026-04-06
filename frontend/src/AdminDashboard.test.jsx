import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminDashboard from "./AdminDashboard";

const hookState = {
  patients: [
    {
      id: "P-001",
      dbId: 1,
      firstName: "Ana",
      lastName: "Dela Cruz",
      age: 33,
      gender: "Female",
      dateRegistered: "2026-04-06",
    },
  ],
  vitalSigns: [
    {
      id: "V-001",
      dbId: 1,
      patientId: "P-001",
      patientName: "Ana Dela Cruz",
      date: "2026-04-06",
      time: "08:00",
      systolic: 130,
      diastolic: 85,
      heartRate: 74,
      temperature: 36.7,
      spO2: 98,
      respiratoryRate: 16,
      weight: 65,
      height: 165,
    },
  ],
  bpTrendData: [],
  registrationsData: [],
  loading: { patients: false, vitals: false, stats: false },
  errors: { patients: "", vitals: "", stats: "" },
  statsSummary: {
    totalPatients: 1,
    bpRecordsToday: 1,
    highRiskCount: 0,
    normalCount: 0,
  },
  refreshPatients: vi.fn(),
  refreshVitals: vi.fn(),
  refreshStats: vi.fn(),
  createPatient: vi.fn(),
  updatePatient: vi.fn(),
  deletePatient: vi.fn(),
  createVital: vi.fn(),
  deleteVital: vi.fn(),
  getPatientLatestVitals: vi.fn(() => ({ systolic: 130, diastolic: 85 })),
  getVitalPatientName: vi.fn(() => "Ana Dela Cruz"),
};

vi.mock("./hooks/useAdminDashboardData", () => ({
  default: () => hookState,
}));

vi.mock("./components/AdminSidebar", () => ({
  default: ({ setActiveNav }) => (
    <div>
      <button type="button" onClick={() => setActiveNav("dashboard")}>
        Dashboard Tab
      </button>
      <button type="button" onClick={() => setActiveNav("patients")}>
        Patients Tab
      </button>
      <button type="button" onClick={() => setActiveNav("records")}>
        Records Tab
      </button>
    </div>
  ),
}));

vi.mock("./components/admin-dashboard/PanelErrorBoundary", () => ({
  default: ({ children }) => <>{children}</>,
}));

vi.mock("./components/admin-dashboard/OverviewPanel", () => ({
  default: ({ onViewAllPatients }) => (
    <div>
      <p>Overview Panel Mock</p>
      <button type="button" onClick={onViewAllPatients}>
        View All Patients
      </button>
    </div>
  ),
}));

vi.mock("./components/admin-dashboard/PatientsPanel", () => ({
  default: () => <div>Patients Panel Mock</div>,
}));

vi.mock("./components/admin-dashboard/VitalsPanel", () => ({
  default: () => <div>Vitals Panel Mock</div>,
}));

vi.mock("./components/admin-dashboard/PatientModal", () => ({
  default: () => null,
}));

vi.mock("./components/admin-dashboard/VitalModal", () => ({
  default: () => null,
}));

vi.mock("./components/admin-dashboard/VitalDetailsModal", () => ({
  default: () => null,
}));

vi.mock("./components/admin-dashboard/DeleteConfirmModal", () => ({
  default: () => null,
}));

vi.mock("./components/admin-dashboard/AdminToast", () => ({
  default: () => null,
}));

function renderDashboard(initialEntry = "/admin") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<div>Admin Settings Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("AdminDashboard", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      "user",
      JSON.stringify({
        first_name: "Aida",
        last_name: "Reyes",
        role: "admin",
      })
    );
  });

  it("renders overview panel by default", () => {
    renderDashboard();

    expect(screen.getByText("Overview Panel Mock")).toBeInTheDocument();
    expect(screen.getByText("Aida Reyes")).toBeInTheDocument();
  });

  it("switches to patients panel from overview action", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByRole("button", { name: "View All Patients" }));

    expect(screen.getByText("Patients Panel Mock")).toBeInTheDocument();
  });

  it("opens records view when tab is provided via route state", () => {
    renderDashboard({ pathname: "/admin", state: { tab: "records" } });

    expect(screen.getByText("Vitals Panel Mock")).toBeInTheDocument();
  });

  it("navigates to admin settings from the profile link", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByRole("link", { name: "Admin Profile" }));

    expect(screen.getByText("Admin Settings Page")).toBeInTheDocument();
  });
});

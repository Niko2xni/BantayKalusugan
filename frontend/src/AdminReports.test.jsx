import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminReports from "./AdminReports";
import { adminFetch } from "./utils/adminApi";

vi.mock("./components/AdminSidebar", () => ({
  default: () => <div>Admin Sidebar Mock</div>,
}));

vi.mock("./components/admin-dashboard/AdminNotificationsDropdown", () => ({
  default: () => <div>Admin Notifications Mock</div>,
}));

vi.mock("./utils/adminApi", () => ({
  AUTH_REDIRECT_ERROR: "AUTH_REDIRECT_ERROR",
  adminFetch: vi.fn(),
}));

vi.mock("recharts", () => {
  const Mock = ({ children }) => <div>{children}</div>;
  return {
    ResponsiveContainer: Mock,
    BarChart: Mock,
    Bar: Mock,
    XAxis: Mock,
    YAxis: Mock,
    CartesianGrid: Mock,
    Tooltip: Mock,
    Legend: Mock,
    PieChart: Mock,
    Pie: Mock,
    Cell: Mock,
    LineChart: Mock,
    Line: Mock,
  };
});

function jsonResponse(data) {
  return {
    ok: true,
    json: async () => data,
  };
}

function blobResponse() {
  return {
    ok: true,
    blob: async () => new Blob(["mock,csv\n1,2"], { type: "text/csv" }),
  };
}

function setupAdminFetchMock() {
  adminFetch.mockImplementation((url) => {
    if (url.includes("/api/admin/reports/overview")) {
      return Promise.resolve(
        jsonResponse({
          total_patients: 12,
          bp_records_today: 4,
          total_visits: 40,
          avg_systolic: 126.5,
          avg_diastolic: 81.2,
          reports_generated: 3,
        })
      );
    }

    if (url.includes("/api/admin/reports/trends")) {
      return Promise.resolve(
        jsonResponse({
          bp_trends: [{ month: "Jan", systolic: 125, diastolic: 80 }],
          registrations: [{ month: "Jan", patients: 5 }],
          monthly_summary: [{ month: "Jan", patients: 5, visits: 12, avg_bp: 125 }],
        })
      );
    }

    if (url.includes("/api/admin/reports/distributions")) {
      return Promise.resolve(
        jsonResponse({
          health_conditions: [{ name: "Normal", value: 8 }],
          age_distribution: [{ range: "18-30", count: 6 }],
        })
      );
    }

    if (url.includes("/api/admin/reports/export")) {
      if (url.includes("format=pdf")) {
        return Promise.resolve({
          ok: true,
          blob: async () => new Blob(["%PDF-1.4\nmock"], { type: "application/pdf" }),
        });
      }

      return Promise.resolve(blobResponse());
    }

    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  });
}

describe("AdminReports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupAdminFetchMock();
  });

  it("fetches reports data for the selected date range", async () => {
    render(
      <MemoryRouter>
        <AdminReports />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(adminFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/reports/overview?date_range=thisMonth")
      );
    });

    expect(screen.getByText("Reports & Analytics"))
      .toBeInTheDocument();
  });

  it("refetches when the date range changes", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AdminReports />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(adminFetch).toHaveBeenCalledWith(
        expect.stringContaining("date_range=thisMonth")
      );
    });

    const dateRangeSelect = screen.getByDisplayValue("This Month");
    await user.selectOptions(dateRangeSelect, "last3Months");

    await waitFor(() => {
      expect(adminFetch).toHaveBeenCalledWith(
        expect.stringContaining("date_range=last3Months")
      );
    });
  });

  it("switches the visible report sections when the report type changes", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AdminReports />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Health Condition Distribution")).toBeInTheDocument();
    });

    const reportTypeSelect = screen.getByDisplayValue("Overview Report");
    await user.selectOptions(reportTypeSelect, "patients");

    await waitFor(() => {
      expect(screen.getByText("Registration Trends")).toBeInTheDocument();
      expect(screen.queryByText("Health Condition Distribution")).not.toBeInTheDocument();
    });
  });

  it("exports CSV using current report filters", async () => {
    const user = userEvent.setup();
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tagName, options) => {
        const element = originalCreateElement(tagName, options);
        if (String(tagName).toLowerCase() === "a") {
          element.click = vi.fn();
        }
        return element;
      });

    try {
      render(
        <MemoryRouter>
          <AdminReports />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Export Report/i })).toBeEnabled();
      });

      await user.click(screen.getByRole("button", { name: /Export Report/i }));

      await waitFor(() => {
        expect(adminFetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/admin/reports/export?")
        );
      });

      const exportCall = adminFetch.mock.calls.find(([url]) =>
        url.includes("/api/admin/reports/export?")
      );

      expect(exportCall?.[0]).toContain("format=csv");
      expect(exportCall?.[0]).toContain("report_type=overview");
      expect(exportCall?.[0]).toContain("date_range=thisMonth");
    } finally {
      createElementSpy.mockRestore();
    }
  });

  it("exports PDF using current report filters", async () => {
    const user = userEvent.setup();
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tagName, options) => {
        const element = originalCreateElement(tagName, options);
        if (String(tagName).toLowerCase() === "a") {
          element.click = vi.fn();
        }
        return element;
      });

    try {
      render(
        <MemoryRouter>
          <AdminReports />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Export Report/i })).toBeEnabled();
      });

      await user.selectOptions(screen.getByDisplayValue("CSV"), "pdf");
      await user.click(screen.getByRole("button", { name: /Export Report/i }));

      await waitFor(() => {
        expect(adminFetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/admin/reports/export?")
        );
      });

      const exportCall = adminFetch.mock.calls.find(([url]) =>
        url.includes("/api/admin/reports/export?")
      );

      expect(exportCall?.[0]).toContain("format=pdf");
      expect(exportCall?.[0]).toContain("report_type=overview");
      expect(exportCall?.[0]).toContain("date_range=thisMonth");
    } finally {
      createElementSpy.mockRestore();
    }
  });
});

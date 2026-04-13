import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AnalyticsPage from "./AnalyticsPage";

const mockSetFilters = vi.fn();
const mockReloadVitalsData = vi.fn();
const mockExportVitalsFile = vi.fn();
const mockFetchVitalSubmissions = vi.fn();
const mockCreateVitalSubmission = vi.fn();

vi.mock("./Layout.jsx", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("./hooks/usePatientVitalsData", () => ({
  default: () => ({
    vitals: [
      {
        id: 1,
        date: "2026-04-03",
        time: "07:45",
        systolic: 126,
        diastolic: 81,
        heart_rate: 74,
        temperature: 36.6,
        spo2: 98,
        respiratory_rate: 16,
        weight: 63.8,
        height: 164,
        recorded_by: "Admin Staff",
      },
    ],
    latestVital: null,
    overview: {
      total_records: 1,
      avg_systolic: 126,
      avg_diastolic: 81,
      avg_heart_rate: 74,
      avg_temperature: 36.6,
      avg_spo2: 98,
      avg_respiratory_rate: 16,
      avg_weight: 63.8,
      avg_height: 164,
      normal_bp_records: 1,
      elevated_bp_records: 0,
      abnormal_bp_records: 0,
    },
    loading: false,
    error: "",
    filters: {
      dateStart: "",
      dateEnd: "",
    },
    setFilters: mockSetFilters,
    reloadVitalsData: mockReloadVitalsData,
    exportVitalsFile: (...args) => mockExportVitalsFile(...args),
  }),
}));

vi.mock("./utils/patientPortalApi", () => ({
  fetchVitalSubmissions: (...args) => mockFetchVitalSubmissions(...args),
  createVitalSubmission: (...args) => mockCreateVitalSubmission(...args),
}));

describe("AnalyticsPage export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExportVitalsFile.mockResolvedValue(undefined);
    mockFetchVitalSubmissions.mockResolvedValue([]);
    mockCreateVitalSubmission.mockResolvedValue({ id: 1, status: "pending" });
  });

  it("exports CSV by default", async () => {
    const user = userEvent.setup();
    render(<AnalyticsPage />);

    await user.click(screen.getByRole("button", { name: /Export CSV/i }));

    await waitFor(() => {
      expect(mockExportVitalsFile).toHaveBeenCalledWith("csv");
    });
  });

  it("exports PDF when selected", async () => {
    const user = userEvent.setup();
    render(<AnalyticsPage />);

    await user.selectOptions(screen.getByRole("combobox", { name: /Export format/i }), "pdf");
    await user.click(screen.getByRole("button", { name: /Export PDF/i }));

    await waitFor(() => {
      expect(mockExportVitalsFile).toHaveBeenCalledWith("pdf");
    });
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SchedulesPage from "./SchedulesPage";

const mockFetchAppointments = vi.fn();
const mockRequestAppointment = vi.fn();
const mockCancelAppointment = vi.fn();
const mockRescheduleAppointment = vi.fn();

vi.mock("./Layout.jsx", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("./utils/patientPortalApi", () => ({
  fetchAppointments: (...args) => mockFetchAppointments(...args),
  requestAppointment: (...args) => mockRequestAppointment(...args),
  cancelAppointment: (...args) => mockCancelAppointment(...args),
  rescheduleAppointment: (...args) => mockRescheduleAppointment(...args),
}));

const baseAppointment = {
  id: 1,
  patient_id: 7,
  appointment_type: "General Consultation",
  health_area: "General",
  scheduled_at: "2026-05-03T09:00:00Z",
  status: "Pending",
  location: "Barangay Health Center",
  assigned_staff: "Pending Assignment",
  notes: "",
  requested_notes: "",
};

describe("SchedulesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchAppointments.mockResolvedValue([baseAppointment]);
    mockRequestAppointment.mockResolvedValue({
      ...baseAppointment,
      id: 2,
      appointment_type: "Dental Check",
      health_area: "Dental",
      scheduled_at: "2026-05-04T08:00:00Z",
    });
    mockCancelAppointment.mockResolvedValue({
      ...baseAppointment,
      status: "Cancelled",
    });
    mockRescheduleAppointment.mockResolvedValue({
      ...baseAppointment,
      scheduled_at: "2026-05-05T11:30:00Z",
      status: "Pending",
    });
  });

  it("loads and renders appointments from API", async () => {
    render(<SchedulesPage />);

    expect(mockFetchAppointments).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("General Consultation")).toBeInTheDocument();
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
  });

  it("submits new appointment requests", async () => {
    const user = userEvent.setup();
    const { container } = render(<SchedulesPage />);

    await screen.findByText("General Consultation");

    const datetimeInput = container.querySelector('input[name="scheduledAt"]');
    fireEvent.change(datetimeInput, { target: { value: "2026-05-06T10:00" } });

    await user.click(screen.getByRole("button", { name: "Request Appointment" }));

    await waitFor(() => {
      expect(mockRequestAppointment).toHaveBeenCalledTimes(1);
    });

    expect(mockRequestAppointment).toHaveBeenCalledWith(
      expect.objectContaining({
        appointment_type: "General Consultation",
        health_area: "General",
        location: "Barangay Health Center",
      })
    );

    expect(await screen.findByText("Appointment request submitted successfully.")).toBeInTheDocument();
    expect(screen.getByText("Dental Check")).toBeInTheDocument();
  });

  it("handles cancel action", async () => {
    const user = userEvent.setup();
    render(<SchedulesPage />);

    await screen.findByText("General Consultation");

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => {
      expect(mockCancelAppointment).toHaveBeenCalledWith(1);
    });
  });

  it("handles reschedule action", async () => {
    const user = userEvent.setup();
    render(<SchedulesPage />);

    await screen.findByText("General Consultation");

    await user.click(screen.getByRole("button", { name: "Reschedule" }));
    await user.type(screen.getByPlaceholderText("Reason or note"), "Need a later schedule");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(mockRescheduleAppointment).toHaveBeenCalledTimes(1);
    });

    expect(mockRescheduleAppointment.mock.calls[0][0]).toBe(1);
    expect(mockRescheduleAppointment.mock.calls[0][1]).toEqual(
      expect.objectContaining({ notes: "Need a later schedule" })
    );
  });
});

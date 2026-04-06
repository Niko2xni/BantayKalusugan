import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Header from "./Header";

const mockFetchNotifications = vi.fn();
const mockMarkNotificationRead = vi.fn();
const mockMarkAllNotificationsRead = vi.fn();

vi.mock("../utils/patientPortalApi", () => ({
  fetchNotifications: (...args) => mockFetchNotifications(...args),
  markNotificationRead: (...args) => mockMarkNotificationRead(...args),
  markAllNotificationsRead: (...args) => mockMarkAllNotificationsRead(...args),
}));

describe("Header notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem(
      "user",
      JSON.stringify({ first_name: "Pat", last_name: "User", role: "patient" })
    );
    localStorage.setItem("token", "token-patient");

    mockFetchNotifications.mockResolvedValue([
      {
        id: 11,
        title: "Appointment updated",
        body: "Your schedule has changed.",
        kind: "appointment",
        is_read: false,
        created_at: "2026-05-03T09:00:00Z",
      },
      {
        id: 12,
        title: "Chat response",
        body: "Support replied to your concern.",
        kind: "chat",
        is_read: true,
        created_at: "2026-05-03T08:00:00Z",
      },
    ]);
    mockMarkNotificationRead.mockResolvedValue({ is_read: true });
    mockMarkAllNotificationsRead.mockResolvedValue({ message: "Marked 1 notifications as read" });
  });

  function renderHeader() {
    return render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
  }

  it("loads notifications and marks all as read", async () => {
    const user = userEvent.setup();
    const { container } = renderHeader();

    await waitFor(() => {
      expect(mockFetchNotifications).toHaveBeenCalled();
    });

    const bellButton = container.querySelector('button[class*="top-header__btn--icon"]');
    await user.click(bellButton);

    expect(await screen.findByText(/Appointment updated/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Mark all as read" }));

    await waitFor(() => {
      expect(mockMarkAllNotificationsRead).toHaveBeenCalledTimes(1);
    });
  });

  it("marks a single unread notification as read when clicked", async () => {
    const user = userEvent.setup();
    const { container } = renderHeader();

    const bellButton = container.querySelector('button[class*="top-header__btn--icon"]');
    await user.click(bellButton);

    const unreadItem = await screen.findByText(/Appointment updated/);
    await user.click(unreadItem);

    await waitFor(() => {
      expect(mockMarkNotificationRead).toHaveBeenCalledWith(11);
    });
  });
});

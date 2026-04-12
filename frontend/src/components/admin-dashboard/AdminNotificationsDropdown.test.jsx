import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminNotificationsDropdown from "./AdminNotificationsDropdown";

const mockFetchAdminNotifications = vi.fn();
const mockMarkAdminNotificationRead = vi.fn();
const mockMarkAllAdminNotificationsRead = vi.fn();

vi.mock("../../utils/adminNotificationsApi", () => ({
  fetchAdminNotifications: (...args) => mockFetchAdminNotifications(...args),
  markAdminNotificationRead: (...args) => mockMarkAdminNotificationRead(...args),
  markAllAdminNotificationsRead: (...args) => mockMarkAllAdminNotificationsRead(...args),
}));

describe("AdminNotificationsDropdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFetchAdminNotifications.mockResolvedValue([
      {
        id: 21,
        title: "Report export ready",
        body: "The monthly PDF export completed successfully.",
        kind: "report",
        is_read: false,
        created_at: "2026-04-07T10:00:00Z",
      },
      {
        id: 22,
        title: "System settings saved",
        body: "Notification preferences were updated.",
        kind: "settings",
        is_read: true,
        created_at: "2026-04-07T09:30:00Z",
      },
    ]);
    mockMarkAdminNotificationRead.mockResolvedValue({ is_read: true });
    mockMarkAllAdminNotificationsRead.mockResolvedValue({ message: "Marked 1 notifications as read" });
  });

  it("loads admin notifications and marks all as read", async () => {
    const user = userEvent.setup();

    render(<AdminNotificationsDropdown />);

    await waitFor(() => {
      expect(mockFetchAdminNotifications).toHaveBeenCalled();
    });

    await user.click(screen.getByRole("button", { name: "Notifications" }));

    expect(await screen.findByText(/Report export ready/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Mark all as read" }));

    await waitFor(() => {
      expect(mockMarkAllAdminNotificationsRead).toHaveBeenCalledTimes(1);
    });
  });

  it("marks a single unread admin notification as read when clicked", async () => {
    const user = userEvent.setup();

    render(<AdminNotificationsDropdown />);

    await user.click(screen.getByRole("button", { name: "Notifications" }));

    const unreadItem = await screen.findByText(/Report export ready/);
    await user.click(unreadItem);

    await waitFor(() => {
      expect(mockMarkAdminNotificationRead).toHaveBeenCalledWith(21);
    });
  });
});
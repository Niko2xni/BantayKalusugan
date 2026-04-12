import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ChatPage from "./ChatPage";

const mockFetchChatMessages = vi.fn();
const mockSendChatMessage = vi.fn();
const mockNotifyNotificationsRefresh = vi.fn();

vi.mock("./Layout.jsx", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("./utils/patientPortalApi", () => ({
  fetchChatMessages: (...args) => mockFetchChatMessages(...args),
  sendChatMessage: (...args) => mockSendChatMessage(...args),
}));

vi.mock("./utils/notificationSync", () => ({
  notifyNotificationsRefresh: (...args) => mockNotifyNotificationsRefresh(...args),
}));

describe("ChatPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchChatMessages.mockResolvedValue([
      {
        id: 1,
        user_id: 7,
        sender_type: "patient",
        message: "Hello",
        channel: "support",
        created_at: "2026-05-03T09:00:00Z",
      },
      {
        id: 2,
        user_id: 7,
        sender_type: "bot",
        message: "How can I help?",
        channel: "support",
        created_at: "2026-05-03T09:01:00Z",
      },
    ]);
    mockSendChatMessage.mockResolvedValue([
      {
        id: 3,
        user_id: 7,
        sender_type: "patient",
        message: "Need appointment help",
        channel: "support",
        created_at: "2026-05-03T09:02:00Z",
      },
      {
        id: 4,
        user_id: 7,
        sender_type: "bot",
        message: "Use the Schedules page for appointment actions.",
        channel: "support",
        created_at: "2026-05-03T09:02:30Z",
      },
    ]);
  });

  it("loads persisted chat history", async () => {
    render(<ChatPage />);

    expect(mockFetchChatMessages).toHaveBeenCalledWith("support");
    expect(await screen.findByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("How can I help?")).toBeInTheDocument();
  });

  it("sends new chat messages", async () => {
    const user = userEvent.setup();
    render(<ChatPage />);

    await screen.findByText("Hello");

    const input = screen.getByPlaceholderText("Type your inquiry here...");
    await user.type(input, "Need appointment help{enter}");

    await waitFor(() => {
      expect(mockSendChatMessage).toHaveBeenCalledWith({
        message: "Need appointment help",
        channel: "support",
      });
    });

    expect(mockNotifyNotificationsRefresh).toHaveBeenCalledWith("chat-message-sent");

    expect(await screen.findByText("Use the Schedules page for appointment actions.")).toBeInTheDocument();
  });
});

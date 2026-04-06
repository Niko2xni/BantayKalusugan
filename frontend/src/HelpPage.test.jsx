import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import HelpPage from "./HelpPage";

const mockFetchHelpArticles = vi.fn();

vi.mock("./Layout.jsx", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("./utils/patientPortalApi", () => ({
  fetchHelpArticles: (...args) => mockFetchHelpArticles(...args),
}));

describe("HelpPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads help articles from API and filters via search", async () => {
    const user = userEvent.setup();
    mockFetchHelpArticles.mockResolvedValue([
      {
        id: "appointments",
        title: "Appointments",
        subtitle: "Manage your booking",
        content: "Use schedules to request and reschedule appointments.",
      },
      {
        id: "chat",
        title: "Support Chat",
        subtitle: "Talk to assistant",
        content: "Open chat page and send your concern.",
      },
    ]);

    render(<HelpPage />);

    expect(await screen.findByText("Appointments")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Search help articles");
    await user.type(searchInput, "vitals");

    expect(await screen.findByText("No help articles match your search.")).toBeInTheDocument();
  });

  it("falls back to local articles when API load fails", async () => {
    mockFetchHelpArticles.mockRejectedValue(new Error("Unable to load help content."));

    render(<HelpPage />);

    expect(await screen.findByText("Getting Started")).toBeInTheDocument();
    expect(screen.getByText("Unable to load help content.")).toBeInTheDocument();
  });
});

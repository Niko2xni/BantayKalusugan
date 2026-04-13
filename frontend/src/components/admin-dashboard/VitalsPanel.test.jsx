import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import VitalsPanel from "./VitalsPanel";

describe("VitalsPanel pending submissions", () => {
  it("invokes approve and reject handlers for patient submissions", async () => {
    const user = userEvent.setup();
    const onReviewSubmission = vi.fn();

    render(
      <VitalsPanel
        vitalSigns={[]}
        vitalSubmissions={[
          {
            id: "S-001",
            dbId: 1,
            patientId: "P-001",
            patientName: "Ana Dela Cruz",
            date: "2026-04-14",
            time: "09:15",
            systolic: 128,
            diastolic: 82,
            heartRate: 76,
            temperature: 36.6,
            spO2: 98,
          },
        ]}
        bpTrendData={[]}
        getVitalPatientName={() => "Unknown"}
        onReviewSubmission={onReviewSubmission}
        onOpenAddVital={() => {}}
        onDeleteVital={() => {}}
        onViewVital={() => {}}
        isLoading={false}
        error=""
        submissionsLoading={false}
        submissionsError=""
        reviewingSubmissionId={null}
        isStatsLoading
        statsError=""
        onRetryVitals={() => {}}
        onRetrySubmissions={() => {}}
        onRetryStats={() => {}}
      />
    );

    expect(screen.getByText("Pending Patient Vital Submissions")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Approve" }));
    await user.click(screen.getByRole("button", { name: "Reject" }));

    expect(onReviewSubmission).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ dbId: 1 }),
      "approved"
    );
    expect(onReviewSubmission).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ dbId: 1 }),
      "rejected"
    );
  });
});

# Rule-Based Chat Bot Implementation Plan

This plan updates `/chat` from a general support assistant into a deterministic rule-based bot focused on appointment schedules and confirmation concerns. The goal is to answer common questions from the patient’s own appointment data, keep the existing chat history flow intact, and preserve the current escalation path for urgent cases.

## Goals

- Answer schedule and confirmation questions without using an external AI service.
- Use live patient appointment data so replies reflect the current state of the account.
- Keep the existing `/api/me/chat/messages` contract so the frontend does not need a full rewrite.
- Preserve generic fallback responses for questions outside the appointment domain.
- Keep the Escalate action available for concerns that need staff review.

## Proposed Behavior

### Intent categories

The bot should classify incoming messages into a small set of deterministic intents:

- Appointment schedule lookup
- Confirmation status lookup
- Reschedule or cancel guidance
- Request guidance
- Generic fallback

### Reply behavior

- If the patient asks when their appointment is scheduled, the bot should summarize the next upcoming appointment, including date, time, location, and status.
- If the patient asks whether an appointment is confirmed, the bot should summarize pending and confirmed appointments and explain that pending items still need confirmation from the health center.
- If the patient asks how to reschedule or cancel, the bot should direct them to the Schedules page and mention the available actions there.
- If the patient has no appointments yet, the bot should clearly say that there are no current bookings and explain how to request one.
- If the question is outside appointment scheduling or confirmation, the bot should return a short fallback response that points the user to Help or to staff escalation.

## Backend Changes

### `backend/app/crud.py`

- Replace the current single-string reply builder with a small rule engine.
- Add helper functions for:
  - normalizing message text
  - classifying message intent
  - formatting appointment date and time for chat replies
  - summarizing the patient’s upcoming appointments
- Reuse the existing `get_patient_appointments()` helper so the bot can inspect live appointment data.
- Keep reply generation deterministic and local to the backend.
- Preserve notification creation after each bot reply.

### `backend/app/main.py`

- Keep the current `/api/me/chat/messages` endpoint shape.
- Continue routing patient chat messages through the backend rule engine when `channel` is `support`.
- Leave the existing response contract unchanged so the frontend still receives the patient message plus the bot response.

### Non-goals

- No database schema changes.
- No external AI or third-party chat service.
- No admin dashboard changes.

## Frontend Changes

### `frontend/src/ChatPage.jsx`

- Update the empty state text so it tells users the assistant is focused on schedules and confirmation questions.
- Optionally add a few quick prompt buttons for common questions like:
  - When is my next appointment?
  - Is my appointment confirmed?
  - How do I reschedule?
- Keep the existing manual message entry and Escalate button.
- Leave message loading and sending behavior unchanged.

### User experience expectations

- The page should feel like a guided appointment assistant, not a generic support inbox.
- The user should always have a clear path to Schedules or escalation when the bot cannot fully answer the question.

## Tests

### Backend tests

Add coverage for the following cases:

- A message that asks for the next appointment.
- A message that asks whether an appointment is confirmed.
- A message that asks to reschedule or cancel.
- A patient with no appointments.
- A generic fallback message for unrelated topics.

### Frontend tests

- Keep the existing `ChatPage` load/send/escalation tests passing.
- Add coverage for any new prompt buttons or updated copy if those are introduced.

## Verification Plan

- Run the backend test suite for the user self-service endpoints.
- Run the frontend `ChatPage` tests.
- Manually verify `/chat` for patients with:
  - one confirmed appointment
  - one pending appointment
  - no appointments at all
- Confirm the `/api/me/chat/messages` response still returns the patient message followed by the bot reply.

## Confirmed Decisions

- Responses stay human-readable only.
- Replies may mention unread notifications where relevant.
- Fallback responses stay text-only.

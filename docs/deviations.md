# Deviations from the project rules

Every place the app departs from the non-negotiable rules in `CLAUDE.md` (or from `docs/design-rationale.md`) is listed here, with the reason. Rule 9: never deviate silently. Add new entries at the end; when a deviation is removed, mark it **Closed** with the date instead of deleting it.

Format: what · rule(s) affected · why · how the risk is reduced · decided by, date · review.

---

## D1. Google Calendar links on Android

- **What:** On Android, the "Add your reminders" step offers one Google Calendar link per entry (`calendar.google.com/calendar/render?action=TEMPLATE…`). Tapping it opens the Google Calendar app or website with the entry filled in.
- **Rules affected:** 1 (the app never sends data anywhere) and 2 (no network). The link carries the entry's title, notes, start and end times, time zone and repeat rule to Google. It also stays in the phone's browser history.
- **Why:** Reminders at the right moment are a key ingredient (see design rationale: implementation intentions, home practice). On Android, the calendar file (.ics) often can't be opened by Google Calendar, and Chrome refuses to open calendar apps through intent links (tested on Tim's phone, 2026-11-22: nothing opened). Without the link, most Android parents would get no reminders.
- **Risk reduced by:**
  - It's a navigation the parent chooses by tapping; the app itself still makes no request (`connect-src 'none'` stays in the production build).
  - Rule 8: the text is discreet and minimal. Nothing about the child, the family, the parent's answers or their own "when" words. Enforced by `src/discretion.test.ts`, which also checks the link carries only those six fields.
  - The screen says plainly what goes to Google, and offers the .ics file as an alternative.
  - Once saved, the same text would sync to Google anyway for anyone using Google Calendar.
- **Decided by:** Tim, 2026-11-22.
- **Review:** After the friend test. Drop it if a no-network method that works on Android appears (for example the Web Share API with an .ics file, if calendar apps start accepting it).

## D2. Calendar entries leave the phone at all

- **What:** Even with the .ics file (no network from the app), entries the parent adds to their calendar usually sync to their calendar provider (Google, Apple, Microsoft) and can appear on the lock screen.
- **Rule affected:** 1 (all user data stays on the phone).
- **Why:** The calendar is the only reminder channel that works without the app sending notifications or running in the background, and reminders matter for practice (design rationale).
- **Risk reduced by:** Optional ("Not now" is always offered, with no guilt text). Rule 8 discretion for every title and note. The privacy line on the screen says entries may sync.
- **Decided by:** Original kit (reminders.json), made explicit by Tim on 2026-11-22 with rule 8.
- **Review:** After the friend test: ask testers whether the entries ever felt exposing.

## D3. No security policy in development mode

- **What:** The network-blocking Content-Security-Policy is only added to the production build.
- **Rule affected:** 2.
- **Why:** The policy breaks Vite's live reload while developing.
- **Risk reduced by:** Development builds never reach users; GitHub Pages only serves the production build, and its `index.html` is checked for `connect-src 'none'`.
- **Decided by:** Original kit (rule 2 itself names this).
- **Review:** None needed.

## D4. Temporary test menu, including "Start over"

- **What:** From the second time the app is opened, a "Test menu" at the bottom of every screen jumps to any screen, and "Start over" deletes everything on the phone.
- **Rules affected:** Design rationale ("every feature traces to the table"); rule 6 in spirit (a tester could land on a half-built screen).
- **Why:** Lets Tim test every screen on a real phone while the app is being built.
- **Risk reduced by:** Hidden during the parent's first run. "Start over" says what it deletes.
- **Decided by:** Tim, 2026-11-22.
- **Review:** **Must be removed or hidden behind a developer flag before the link goes to friends.**

## D5. Saved data from the first fast start is discarded

- **What:** Data saved by the first version of the fast start (version 1) is ignored after the update, so the fast start begins again.
- **Rule affected:** Data ownership (CLAUDE.md "Data stored on the phone"; export/import isn't built yet, so it couldn't be exported first).
- **Why:** Version 1 had no practice plan; only Tim had used it, before any testers.
- **Risk reduced by:** Happened before any real users. Once export exists, future changes to saved data must migrate it instead.
- **Decided by:** Claude, while implementing fast start v2, 2026-11-22. Recorded here for Tim to confirm.
- **Review:** Before the friend test: add migrations for any further changes to saved data.

## D6. Fast start instead of the full intake

- **What:** The 8-question intake, "Your plan" and "Set up your week" were replaced by a fast start (age, pick a skill, when) and a 3-day trial. The other intake questions move to the first weekly check-in, so tailoring by difficulties and stress starts later.
- **Rules affected:** Not a non-negotiable rule; departs from the original design (journey and design rationale).
- **Why and evidence:** See the change log in `docs/design-rationale.md` (2026-11-22, both entries) and `docs/fast-start-v2.md`.
- **Decided by:** Tim, 2026-11-22.
- **Review:** Friend test: does the plan feel relevant without the up-front questions, and do parents answer the deferred questions?

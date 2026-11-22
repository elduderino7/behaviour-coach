# Ethical deviation log

This log records every point, while creating this app, where we departed from the strongly worded guidelines set at the start: above all privacy, but also safety, honesty about evidence and minimal dependencies. It covers both **what the app does** (part A) and **how the app is made and hosted** (part B).

For each entry: what happened, which guideline it bends, why we did it, how we minimised the risk, who decided, and when to look at it again. Rule 9 in `CLAUDE.md`: never deviate silently. Add new entries at the end of the right part. When a deviation ends, mark it **Closed** with the date instead of deleting it.

## The guidelines we started with (kit, 21 Nov 2026)

1. All user data stays on the phone. The app never sends data anywhere. No analytics, crash reporting, third-party scripts or accounts.
2. Network blocked in the published app (`connect-src 'none'`).
3. Wellness, not medicine. No diagnosis, screening or medical claims.
4. Content is data, not code.
5. Help is one tap away.
6. Never make the parent feel behind or judged.
7. Minimal dependencies.

Added during the build: rule 8 (discreet outside the app) and rule 9 (this log).

## Summary

| # | Deviation | Guideline | Status |
| --- | --- | --- | --- |
| A1 | Google Calendar links on Android | 1, 2 | Open, review after friend test |
| A2 | Calendar entries leave the phone | 1 | Open, review after friend test |
| A3 | No network block in development mode | 2 | Accepted |
| A4 | Temporary test menu | Design rationale, 6 | **Must close before friend launch** |
| A5 | Saved data from the first fast start discarded | Data ownership | Closed (one-off), Tim to confirm |
| A6 | Fast start instead of the full intake | Design rationale | Open, review after friend test |
| B1 | Hosting on GitHub Pages | 1 | Open, tell testers |
| B2 | Public repository | Privacy of the maker | Accepted |
| B3 | GitHub user ID looked up via GitHub's API | 1 (in spirit) | Closed (one-off) |
| B4 | AI-assisted code and content | 3, honesty about evidence | Open until professional review |
| B5 | Evidence given from memory | Honesty about evidence | Open, check before citing |
| B6 | Build tools with known advisories | 7 | Open, re-check before launch |
| B7 | Testing with Tim's own phone and calendar | 1 (in spirit) | Accepted |

---

## Part A: in the app

### A1. Google Calendar links on Android

- **What:** On Android, "Add your reminders" offers one Google Calendar link per entry (`calendar.google.com/calendar/render?action=TEMPLATE…`). Tapping it opens Google Calendar with the entry filled in.
- **Guidelines bent:** 1 and 2. The link carries the entry's title, notes, start and end times, time zone and repeat rule to Google. The link also stays in the phone's browser history.
- **Why:** Reminders at the planned moment are a key ingredient (design rationale: implementation intentions, home practice). On Android, Google Calendar often can't open the .ics file, and Chrome refuses to open calendar apps through intent links (tested on Tim's phone, 22 Nov 2026: nothing opened). Without the link, most Android parents would get no reminders.
- **Risk minimised by:**
  - The parent chooses to tap; the app itself still makes no request (`connect-src 'none'` stays in the published app).
  - Rule 8: titles and notes look ordinary and contain nothing about the child, the family, the parent's answers or their own words. `src/discretion.test.ts` enforces this and checks the link carries only those six fields.
  - The screen says what goes to Google and offers the .ics file instead.
  - Once saved, the same text would sync to Google anyway for Google Calendar users.
- **Decided by:** Tim, 22 Nov 2026.
- **Review:** After the friend test. Drop it if a no-network method that works on Android appears.

### A2. Calendar entries leave the phone

- **What:** Even with the .ics file (no network from the app), entries the parent adds usually sync to their calendar provider (Google, Apple, Microsoft) and can show on the lock screen.
- **Guideline bent:** 1.
- **Why:** The calendar is the only reminder channel that works without the app sending notifications or running in the background.
- **Risk minimised by:** Reminders are optional ("Not now", no guilt text). Rule 8 discretion for every title and note. The screen's privacy line says entries may sync.
- **Decided by:** Original kit, made explicit by Tim on 22 Nov 2026 with rule 8.
- **Review:** Friend test: ask testers whether the entries ever felt exposing.

### A3. No network block in development mode

- **What:** The Content-Security-Policy that blocks the network is only in the published build.
- **Guideline bent:** 2.
- **Why:** The policy breaks live reloading while developing.
- **Risk minimised by:** Development builds never reach users. GitHub Pages only serves the published build, and its `index.html` is checked for `connect-src 'none'` after each build.
- **Decided by:** Original kit (rule 2 names this itself).
- **Review:** None needed.

### A4. Temporary test menu, including "Start over"

- **What:** From the second time the app is opened, a test menu at the bottom of every screen jumps to any screen; "Start over" deletes everything on the phone.
- **Guidelines bent:** Design rationale (every feature must trace to a reason for parents); 6 in spirit (a tester could land on a half-built screen).
- **Why:** Lets Tim test every screen on a real phone during the build.
- **Risk minimised by:** Hidden during the parent's first run. "Start over" says what it deletes.
- **Decided by:** Tim, 22 Nov 2026.
- **Review:** **Remove or hide behind a developer flag before the link goes to friends.**

### A5. Saved data from the first fast start discarded

- **What:** Data saved by the first fast-start version (version 1) is ignored after the update, so the fast start begins again.
- **Guideline bent:** Data ownership (export didn't exist yet, so the data couldn't be saved first).
- **Why:** Version 1 had no practice plan, and only Tim had used it.
- **Risk minimised by:** Happened before any testers. From now on, changes to saved data must migrate it.
- **Decided by:** Claude while building fast start v2, 22 Nov 2026. **Tim to confirm.**
- **Review:** Before the friend test: add migrations for any further changes to saved data.

### A6. Fast start instead of the full intake

- **What:** The 8-question intake, "Your plan" and "Set up your week" were replaced by a fast start (age, pick a skill, when) and a 3-day trial. Tailoring by difficulties and stress starts at the first weekly check-in.
- **Guideline bent:** The original design (journey and design rationale), not a non-negotiable rule. Ethically relevant because parents in a harder situation (for example "I often shout") get the generic start first.
- **Why and evidence:** See `docs/design-rationale.md` (change log, 22 Nov 2026) and `docs/fast-start-v2.md`.
- **Risk minimised by:** All three starting skills are low-risk, positive skills. Help stays one tap away on every screen. Consequence-based skills are never offered as a start.
- **Decided by:** Tim, 22 Nov 2026.
- **Review:** Friend test: does the plan feel relevant, and do parents answer the deferred questions?

---

## Part B: in how the app is made and hosted

### B1. Hosting on GitHub Pages

- **What:** The app is downloaded from GitHub Pages. Each download, and each update check when the installed app is opened online, means the phone contacts GitHub (owned by Microsoft), which sees the IP address, device and browser type, and time.
- **Guideline bent:** 1 ("never sends data anywhere"). No data entered in the app is sent, but the visit itself is visible to GitHub.
- **Why:** Free static hosting, and the code is published openly so the privacy promises can be checked (kit, session 0).
- **Risk minimised by:** Only the app's own files are fetched: no cookies, accounts, analytics or third-party scripts. After the first visit, the app works fully offline. Nothing the parent enters is ever part of these requests.
- **Decided by:** Original kit.
- **Review:** Say this plainly on the About and privacy screen (still to build) and in the tester onboarding note. Consider other hosting before any public launch.

### B2. Public repository

- **What:** The code, content and project documents (design rationale, interview guide, this log) are public on GitHub under Tim's username.
- **Guideline bent:** None for users: no user data is ever in the repository. It does make the project publicly linked to Tim's GitHub account.
- **Why:** Open source lets anyone check the privacy promises.
- **Risk minimised by:** Commits use GitHub's private "noreply" address, so Tim's email isn't published. Testers' data never leaves their phones, so it can't end up in the repository.
- **Decided by:** Original kit (public repository); noreply address agreed by Tim, 22 Nov 2026.
- **Review:** Before adding interview notes or tester feedback anywhere: keep them out of the repository.

### B3. GitHub user ID looked up via GitHub's API

- **What:** To build Tim's noreply address, Claude asked GitHub's public API for the account's user ID, from Tim's computer.
- **Guideline bent:** 1 in spirit (a request to an outside service during the build).
- **Why:** The ID is needed for the noreply address that keeps Tim's email out of public commits (B2).
- **Risk minimised by:** Only the username was sent, which is already public. No other data.
- **Decided by:** Claude, 22 Nov 2026, after Tim gave his username for this purpose.
- **Review:** Closed (one-off).

### B4. AI-assisted code and content

- **What:** The code, this documentation and parts of the parenting content were written with Claude: in Claude Code on Tim's computer, and in a claude.ai chat that read the repository and wrote `docs/fast-start-v2.md` into the project folder.
- **Guidelines bent:** 3 and honesty about evidence. Parenting advice drafted with AI can sound confident without being checked.
- **Why:** Speed for a small, private Stage 1 test.
- **Risk minimised by:**
  - All content is marked `"status": "draft"`, and the app shows a "Draft content" label.
  - The techniques come from established parent-training programmes (sources in `docs/sources.md`), not invented by AI.
  - No user data is ever shared with an AI: testers' data exists only on their phones.
  - Every change goes through Tim before it's published.
- **Decided by:** Tim (kit and working style).
- **Review:** Before the friend launch, ideally a psychologist reviews the modules (session 8 plan). Remove the draft label only after that.

### B5. Evidence given from memory

- **What:** Some claims were made from Claude's training knowledge without a fresh source check: the colour research behind the palette (Valdez & Mehrabian 1994, Jonauskaite et al. 2020, Elliot & Maier 2014), and why Android intent links fail.
- **Guideline bent:** Honesty about evidence.
- **Why:** Low-stakes design choices that needed a quick answer.
- **Risk minimised by:** Flagged as unchecked at the time. The palette was chosen by Tim by eye, not justified by those claims. The intent-link explanation was confirmed in practice (the links didn't open on Tim's phone).
- **Decided by:** Claude, 22 Nov 2026.
- **Review:** Check the sources before citing them anywhere public.

### B6. Build tools with known advisories

- **What:** `npm audit` reports 4 moderate advisories in build-time packages (vite-plugin-pwa → workbox-build → glob, minimatch).
- **Guideline bent:** 7 (minimal, trustworthy dependencies).
- **Why:** vite-plugin-pwa is the allowed tool for offline use; the advisories are in its build-time helpers.
- **Risk minimised by:** These packages only run while building, on Tim's computer and GitHub's build servers. They are never shipped to phones; the app itself contains only Preact and idb-keyval.
- **Decided by:** Original kit (dependency list); checked by Claude, 22 Nov 2026.
- **Review:** Run `npm audit` again before the friend launch and update when fixes are released.

### B7. Testing with Tim's own phone and calendar

- **What:** Testing puts real entries ("Coach: …") into Tim's own calendar and Google account.
- **Guideline bent:** 1 in spirit (Tim's own data goes to Google).
- **Why:** The calendar step can only be verified on a real phone.
- **Risk minimised by:** It's Tim's own data and choice. Entries follow rule 8 and can be deleted from the calendar.
- **Decided by:** Tim, 22 Nov 2026.
- **Review:** None needed.

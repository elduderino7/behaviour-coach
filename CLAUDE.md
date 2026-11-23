# Everyday Behaviour Coach — Stage 1 MVP

Read this file at the start of every session. Keep the "Where we left off" section at the bottom up to date at the end of every session.

## What this is

A free web app (installable PWA) that coaches parents and carers of children aged 4–16 through short weekly modules on positive parenting skills: special time, specific praise, clear instructions and routines, rewards and consistency, calm consequences, and staying calm yourself.

Stage 1 is a private 4-week test with 5–10 friends. It is NOT a public product yet.

Every feature exists for a reason documented in `docs/design-rationale.md`. Don't add features that aren't in that table without asking me.

## Non-negotiable rules

1. **Local-only data.** All user data stays on the phone (IndexedDB). The app never sends data anywhere. No analytics, crash reporting, ad SDKs, external fonts, CDNs or third-party scripts. No accounts.
2. **Network blocked in production.** The production build sets a Content-Security-Policy meta tag with `connect-src 'none'` (plus `default-src 'self'`). Content JSON is bundled at build time (imported), never fetched at runtime. No CSP in dev mode (it breaks Vite's hot reload). Sharing uses the Web Share API or copy-to-clipboard, and calendar files are generated as Blobs: neither makes a network request.
   Agreed exception: Google Calendar links on Android (A1 in `docs/ethical-deviation-log.md`).
3. **Wellness, not medicine.** Never use the words "ADHD", "diagnosis", "symptoms", "treatment", "therapy" or "disorder" in app text, except on the Help screen and in the welcome line saying what the app is not. No symptom scores, no screening, no outputs that interpret a child's condition.
4. **Content is data, not code.** All text lives in `content/*.json`. Components render it. Never hard-code user-facing text in components.
5. **Help is one tap away.** A Help button is visible on every screen and opens `content/safety.json`.
6. **Never make the parent feel behind or judged.** No streaks, badges, overdue counts, guilt messages or nagging. Missing days is normal. Finishing counts as success.
7. **Minimal dependencies.** Allowed: Vite, TypeScript, Preact, vite-plugin-pwa, idb-keyval, Vitest. Ask me before adding any other dependency.
8. **Discreet outside the app.** Anything that leaves the app or shows outside it (calendar entries and their notes, lock-screen alarms, Google Calendar links, file names, anything shared) must look ordinary to an outsider and still be clear to the parent. It bridges two needs: low-friction reminders, which means some text has to leave the phone, and the family's privacy.
   - Titles: "Coach: " plus a short everyday description of the activity, at most 32 characters ("Coach: 5 min special time").
   - Titles and notes never mention children, family, behaviour, parenting, emotions or health, and never include names, ages or the parent's answers (not even their own "when" words).
   - Send the minimum: only what the reminder needs (title, short how-to notes, times).
   - `src/discretion.test.ts` checks every calendar text in the content files. New outside-facing text needs a check there too.
9. **Every deviation is written down.** Any time the app, or the way it is built and hosted, departs from these rules (or from the design rationale), record it in the ethical deviation log `docs/ethical-deviation-log.md` before or with the change: what, which rule, why, how the risk is reduced, who decided and when, and when to look at it again. Never deviate silently.

## The journey

One coherent rhythm for the parent: **about 5 minutes once a week** (check in, see next week, plan, share) and **a few minutes most days** (practise with the child, tick the day). The app sends nothing and prompts nothing beyond the calendar entries the parent chose.

1. **Welcome** (`experience.json > welcome`): normalising, non-judgemental, for any parent or carer; what it is and isn't; data stays on the phone; exclusions lead to Help.
2. **Fast start** (`experience.json > quick_start`, decided by Tim on 2026-11-22; full spec in `docs/fast-start-v2.md`). Three steps after Welcome, one decision each:
   - **Age** (step 1 of 3): the only intake question asked up front (`intake.json`, `ask_at: start`). "Younger or older" shows a gentle message, then the two bands.
   - **Pick a skill** (step 2 of 3): Special time (marked "Recommended start"), Specific praise or Staying calm yourself. Tapping one moves on.
   - **When you'll do it** (step 3 of 3): one question worded per skill and age (`modules.json > trial`), time-of-day chips with their times (`quick_start.how.when_options`), nothing pre-selected. After a tap the app shows the plan: 3 sessions from tomorrow (school chips skip weekends) and a check-in the day after the last one. "Change" opens days (2–5) and time in place. **Add {n} reminders** or **Not now**. Logic in `src/trial.ts`, sentences in `src/planText.ts`.
   - **Add reminders**: two entries, a repeating practice series (title names the activity, notes carry the steps) and the check-in. Android: Google Calendar links (see rule 2 exception), fallback .ics. Elsewhere the .ics downloads straight away.
   - After the fast start, the app always opens on This week. The temporary test menu only appears from the second time the app is opened, never during the first run.
3. **This week** (home screen): the plan sentence at the top, a "How did it go?" button from the check-in date, the module in short or full version, a daily "I practised today" tick with "Practised on N of M days" (no streaks). Still to build: learning style (`display_modes`), "I already do this", Share with a practice partner.
4. **Day-4 check-in** (`experience.json > trial_checkin`): how many days (pre-filled from ticks), how it went, then a recommended next step. Went well → "Keep going: 4 more days" (new practice series + first weekly check-in through the same calendar flow; special time 4–9 offers the 10-minute version once). Hard or 0–1 days → "Try a different time" (back to step 3). Or try a different skill.
   - The **first weekly check-in** after those 4 days is where the deferred intake questions (`ask_at: week1_checkin`), the practice partner and the weekly check-in day come in. From there the weekly loop below applies.
5. **Weekly check-in** (`checkin.json`): days practised pre-filled from ticks; then the weekly adaptation (`routing.json > weekly_adaptation`), then "Coming up next week" with an option to share with the partner, then the practice-plan "when" for the next module, pre-filled.
6. **Welcome back** (`experience.json > welcome_back`): shown instead of the home screen after a gap. Never mentions missed weeks.
7. **Finished** (`experience.json > completion`): after the last module's check-in. Private reflection note; all modules stay available; no pressure to restart.
8. **Progress**: the parent's own check-ins over the weeks (simple SVG chart, no chart library) plus their goal.
9. **Settings**: learning style, practice plan, partner, reminders, "My usage summary", export / import / delete everything, about and privacy.

## Tailoring (summary)

- **Age band** picks the text variant of every module.
- **Difficulties and shouting** set the module order (`routing.json > rules`).
- **Learning style**: `practical` (straight to the exercise, "Why this works" collapsed) or `learn` (short how-it-works first). Changeable any time.
- **Minutes = 5**: modules open in their short version (`routing.json > personal_defaults`).
- **Co-parent = yes**: module 4 co-parent step shown; other parent pre-selected as practice partner.
- **Weekly adaptation** after each check-in, based on days practised. The parent always chooses.
- **"I already do this"**: refresher (short version) or skip ahead. Not offered for week 1 of the first plan.

## Data stored on the phone

Intake answers, plan, practice plan per module, partner choice (label only, never contact details), reminder choices, daily ticks, check-ins (with content version, learning style, variant, short version used), adaptation choices, notes, randomised variant assignments, start date, and a local usage log (`experience.json > usage_log`). All of it is included in the export file, and all of it is removed by "Delete everything".

## Randomised content variant

Module 2 has two orders: `example_first` and `explanation_first`. It only matters in `learn` mode. On first opening module 2, assign one at random (50/50), store it, and always show the same one.

## Tech

- Vite + TypeScript + Preact. Single-page app with simple state-based navigation (no router library).
- vite-plugin-pwa for offline use and "Add to Home Screen".
- IndexedDB via idb-keyval.
- Vitest unit tests for routing, personal defaults, already-doing, weekly adaptation, welcome-back trigger, and export/import.
- Hosting: GitHub Pages (static). Base path must match the repo name.
- Mobile-first, large tap targets, readable contrast, screen-reader labels.

## Working style

- For anything bigger than a small fix, propose a plan first and wait for my OK.
- Keep changes small and testable on my phone the same evening.
- Commit at the end of each session with a clear message.
- Explain briefly what you changed and how I can test it.

## Where we left off

- (Session 0) Kit created (content v0.3.0: full journey with welcome, practice plan, practice partner, previews, welcome back and completion, plus learning style, short versions, weekly adaptation and calendar reminders). Nothing built yet. Next: session 1 in `docs/session-prompts.md`.
- (Session 1, 2026-11-22) Skeleton built: Vite 8 + TypeScript + Preact 11, vite-plugin-pwa (offline + installable), content imported at build time, production-only CSP (`vite.config.ts`), GitHub Pages workflow (`.github/workflows/deploy.yml`, base `/behaviour-coach/`). Welcome renders `experience.json > welcome`; Help renders `safety.json` with tap-to-call links; all other screens are placeholders. Shared app text (app name, buttons, screen titles) lives in the new `content/ui.json`. A temporary test menu at the bottom of every screen jumps to any screen (hide it behind a flag in session 5). JSX is compiled via Vite's built-in `oxc` option, so no Preact Vite plugin is needed. Icons are generated by `npm run icons` (Windows only). Next: session 2 (welcome, intake and plan).
- (2026-11-22) Palette changed to periwinkle + mint (`src/styles.css`, light and dark, WCAG AA). Fast start built: Welcome, Age, Pick a skill, How you'll do it, Add reminders (Android intent links or .ics), then a first This week screen (plan line, module in short/full version, example, when it doesn't work, why). State saved in IndexedDB (`src/state.ts`). Calendar helpers with tests in `src/calendar.ts`. Test menu only shows from the second app open, with a 'Start over' reset. Not yet tested on a real phone: the Android calendar intent links and the .ics on iPhone. Next: daily ticks and Share on This week, then the check-in with the deferred intake questions.
- (2026-11-22) Fast start v2 (`docs/fast-start-v2.md`): step 3 is one question with time chips; 3-session trial from tomorrow + check-in the day after; inline Change (days 2–5, time); two calendar entries (practice series with BYDAY/DAILY repeat, check-in). Android uses Google Calendar links (agreed rule 2 exception; intent links never opened the calendar). Daily tick on This week. Day-4 check-in with keep going (4 more days + first weekly check-in, 10-minute offer for special time 4–9) / different time / different skill. Saved data is now version 2 (`trial`, `followUp`, `phase`, `trialCheckin`, `ticks`); version 1 data restarts the fast start. 25 tests. Not yet tested on a real phone: Google Calendar links on Android, the .ics on iPhone. Known limit: public holidays aren't skipped. Next: the first weekly check-in (deferred intake questions, partner, weekly day), Share on This week.
- (2026-11-22) Special time 4–9 now says 5 minutes everywhere. Added rule 8 (discreet outside the app) with `src/discretion.test.ts`, and rule 9 (every deviation written down) with `docs/ethical-deviation-log.md` (now the ethical deviation log, A1–A6 and B1–B7). Calendar titles and notes rewritten to say nothing about children or family. Small hard-coded text moved to content (chip format, short weekdays, back arrow). 45 tests. Before the friend launch: remove or hide the test menu (A4).
- (2026-11-22) `docs/deviations.md` became `docs/ethical-deviation-log.md`: part A (in the app, A1–A6) and part B (how the app is made and hosted, B1–B7: GitHub Pages sees visits, public repository, GitHub API lookup, AI-assisted content, evidence from memory, build-tool advisories, testing on Tim's own calendar). Open before friend launch: A4 (test menu), B1 (tell testers), B4 (professional review), B6 (re-run npm audit).
- (2026-11-23) Tim confirmed A5 (old test data discarded); it is closed.

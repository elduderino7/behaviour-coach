# Everyday Behaviour Coach — Stage 1 MVP

Read this file at the start of every session. Keep the "Where we left off" section at the bottom up to date at the end of every session.

## What this is

A free web app (installable PWA) that coaches parents and carers of children aged 4–16 through short weekly modules on positive parenting skills: special time, specific praise, clear instructions and routines, rewards and consistency, calm consequences, and staying calm yourself.

Stage 1 is a private 4-week test with 5–10 friends. It is NOT a public product yet.

Every feature exists for a reason documented in `docs/design-rationale.md`. Don't add features that aren't in that table without asking me.

## Non-negotiable rules

1. **Local-only data.** All user data stays on the phone (IndexedDB). The app never sends data anywhere. No analytics, crash reporting, ad SDKs, external fonts, CDNs or third-party scripts. No accounts.
2. **Network blocked in production.** The production build sets a Content-Security-Policy meta tag with `connect-src 'none'` (plus `default-src 'self'`). Content JSON is bundled at build time (imported), never fetched at runtime. No CSP in dev mode (it breaks Vite's hot reload). Sharing uses the Web Share API or copy-to-clipboard, and calendar files are generated as Blobs: neither makes a network request.
3. **Wellness, not medicine.** Never use the words "ADHD", "diagnosis", "symptoms", "treatment", "therapy" or "disorder" in app text, except on the Help screen and in the welcome line saying what the app is not. No symptom scores, no screening, no outputs that interpret a child's condition.
4. **Content is data, not code.** All text lives in `content/*.json`. Components render it. Never hard-code user-facing text in components.
5. **Help is one tap away.** A Help button is visible on every screen and opens `content/safety.json`.
6. **Never make the parent feel behind or judged.** No streaks, badges, overdue counts, guilt messages or nagging. Missing days is normal. Finishing counts as success.
7. **Minimal dependencies.** Allowed: Vite, TypeScript, Preact, vite-plugin-pwa, idb-keyval, Vitest. Ask me before adding any other dependency.

## The journey

One coherent rhythm for the parent: **about 5 minutes once a week** (check in, see next week, plan, share) and **a few minutes most days** (practise with the child, tick the day). The app sends nothing and prompts nothing beyond the calendar entries the parent chose.

1. **Welcome** (`experience.json > welcome`): normalising, non-judgemental, for any parent or carer; what it is and isn't; data stays on the phone; exclusions lead to Help.
2. **Intake** (`intake.json`): 8 questions, one per screen, back button, progress dots.
3. **Your plan** (`routing.json > rules`): 4 modules with a "why this module" line each, plus the week 1 framing.
4. **Set up your week** (`experience.json > setup_week`): one screen with three optional parts, all skippable:
   - **When:** an if-then practice plan, shown back as "When {when}, I'll practise: {module}".
   - **Who:** practice partner (pre-selected "the other parent" if intake co_parent = yes) and a Share button using the Web Share API with the template text (fallback: copy to clipboard).
   - **Reminders:** calendar file (`reminders.json`), weekly check-in pre-selected.
5. **This week** (home screen): the practice plan line at the top, the current module in the parent's learning style (`modules.json > display_modes`), full or short exercise, a daily "I practised today" tick with "Practised on N days this week" (no streaks), and the "I already do this" button (`routing.json > already_doing`).
6. **Check-in** (`checkin.json`): days practised pre-filled from ticks; then the weekly adaptation (`routing.json > weekly_adaptation`), then "Coming up next week" with an option to share with the partner, then the practice-plan "when" for the next module, pre-filled.
7. **Welcome back** (`experience.json > welcome_back`): shown instead of the home screen after a gap. Never mentions missed weeks.
8. **Finished** (`experience.json > completion`): after the last module's check-in. Private reflection note; all modules stay available; no pressure to restart.
9. **Progress**: the parent's own check-ins over the weeks (simple SVG chart, no chart library) plus their goal.
10. **Settings**: learning style, practice plan, partner, reminders, "My usage summary", export / import / delete everything, about and privacy.

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

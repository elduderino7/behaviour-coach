# Session prompts for Claude Code

Eight sessions of about 1–2 hours each. Each one ends with something you can test on your phone. The order follows the parent's journey, so the app is usable end to end as early as possible.

Start each session by pasting its prompt. Claude reads `CLAUDE.md` automatically. Before you stop, say: **"Commit, and update 'Where we left off' in CLAUDE.md."**

## Session 0: setup (no coding)

1. Create a GitHub account if you don't have one, then a new public repository, for example `behaviour-coach`. The code is meant to be open source, so the promises can be checked.
2. On a computer, unzip the kit. In the repository, choose "Add file" → "Upload files" and drag in the contents of the unzipped folder (CLAUDE.md plus the `content` and `docs` folders). GitHub keeps the folders. Uploading the .zip itself won't work, because GitHub doesn't unpack it.
3. Open claude.ai/code (on the web or in the Claude iOS app) and connect it to the repository.

## Session 1: skeleton and first deploy

> Read CLAUDE.md and docs/design-rationale.md. Set up the project: Vite + TypeScript + Preact, vite-plugin-pwa, and the content JSON files imported at build time. Create placeholder screens for every step of the journey in CLAUDE.md (Welcome, Intake, Your plan, Set up your week, This week, Check-in, Welcome back, Finished, Progress, Settings, Help), with simple navigation and a Help button on every screen. Add a GitHub Actions workflow that deploys to GitHub Pages on every push to main. Propose the plan first, then build it. At the end, tell me the URL and how to install it on my phone.

**Test:** open the URL on your phone, "Add to Home Screen", then open it in airplane mode.

## Session 2: welcome, intake and plan

> Build Welcome from experience.json, Intake from intake.json (one question per screen, back button, progress dots), and Your plan. Implement the routing rules and personal_defaults in content/routing.json as pure functions with Vitest tests for every test case in that file. Save everything to IndexedDB. Your plan shows the four modules with the reason for each, plus the week 1 framing.

**Test:** go through intake with different answers. Does the plan change as expected? Does the welcome feel warm rather than clinical?

## Session 3: set up your week

> Build Set up your week from experience.json > setup_week: the if-then practice plan, the practice partner (pre-selected if co_parent = yes) with a Share button using the Web Share API and a copy-to-clipboard fallback, and calendar reminders from content/reminders.json (generated as a Blob .ics, no network request). All three parts are optional and skippable. The same settings are editable later in Settings.

**Test:** share the message to yourself on WhatsApp. Download the calendar file on an iPhone and on an Android phone. Check that the reminders appear, and that the fallback instructions show if Android can't open the file.

## Session 4: this week

> Build the This week home screen as described in CLAUDE.md: the practice plan line at the top, the current module in the parent's learning style (display_modes) with a toggle to switch, full or short exercise (with 'Show full version'), the co-parent step when relevant, a daily 'I practised today' tick with 'Practised on N days this week' (no streaks), and 'I already do this' following routing.json > already_doing. Implement the module 2 variant test. Show a small 'Draft content' label while status is draft. Make the Help screen render content/safety.json with tap-to-call links.

**Test:** read each module in both learning styles. Is it short and clear on a phone? Do the phone numbers start a call?

## Session 5: the weekly loop

> Build the Check-in from content/checkin.json, available 7 days after a module starts or earlier if the parent taps 'I've finished this week'. Pre-fill days practised from the ticks. Then implement weekly_adaptation as a pure function with Vitest tests: show the message and options, recommended first, and apply the choice (repeats push the plan back a week). Then show 'Coming up next week' with the option to share with the partner, then ask the practice-plan 'when' for the next module, pre-filled. Build the Progress screen (simple SVG chart of days practised and goal progress per week, plus the goal text).

**Test:** add a temporary developer setting to fast-forward days. Run a 4-week cycle once with low practice (to trigger the short repeat) and once with high practice. Hide the setting behind a flag afterwards.

## Session 6: coming back and finishing

> Build Welcome back (experience.json > welcome_back) with a tested trigger function, and Finished (experience.json > completion). Add the local usage log (experience.json > usage_log) and the 'My usage summary' view in Settings. Check every screen against rule 6 in CLAUDE.md: nothing should make the parent feel behind or judged.

**Test:** fast-forward 12 days without opening the app. Does Welcome back appear, and does it feel welcoming? Finish a full plan. Does the ending feel like an achievement without pressure?

## Session 7: data ownership and hardening

> Build Settings: learning style, practice plan, partner, reminders, export all data as a JSON file, import from file (with validation and confirmation), and 'Delete everything' with a two-step confirmation. Add the About and privacy screen. Add Vitest tests that export → delete → import restores the same data. Then, in the production build only, add the CSP meta tag (default-src 'self'; connect-src 'none'), check that no request leaves the app, check offline use, and check accessibility (labels, focus order, contrast, tap targets). Report anything you couldn't verify.

**Test:** export, delete, import. Open the installed app in airplane mode.

## Session 8: launch to friends

> Add a short tester note to Welcome: this is a 4-week private test, there will be two short interviews, and data stays on their phone. Show the version number in Settings. Prepare a one-page onboarding checklist for testers.

**Then, without code:** read every screen out loud once and fix anything that sounds off. Ideally a psychologist friend reviews the modules. Send the link to 5–10 friends and book the week-1 and week-4 interviews using docs/interview-guide.md.

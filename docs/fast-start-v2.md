# Fast start v2: one decision, a 3-day trial

Decided by Tim on 2026-11-22. This replaces step 3 ("How you'll do it") of the fast start, the reminders it creates, and the first check-in. Welcome, Age and Pick a skill stay as they are.

## Prompt to paste into Claude Code

> Read docs/fast-start-v2.md and implement it. Propose a plan first and wait for my OK. Keep all user-facing text in content JSON (rule 4). When done, update CLAUDE.md (journey section and "Where we left off") and add the new rows to docs/design-rationale.md.

## Why

The current "How you'll do it" screen asks four things at once (when, time, length, check-in shown as fixed) on the screen where the parent has the least context and the most to lose. Goal: from opening the app to a scheduled first try in the fewest possible decisions, while keeping the plan specific enough to work.

Design rules for this change:

1. **One decision per screen.** The parent only answers "When could you do this?".
2. **Defaults instead of questions.** Time, days, length and check-in are worked out by the app and shown in one sentence. "Change" reveals them for the few who want to adjust.
3. **Ask later what doesn't matter now.** Length, weekly rhythm, partner and the other intake questions come at the check-ins, once the parent has tried the skill.
4. **Small first commitment.** Three sessions starting tomorrow, then a check-in on day 4. Getting people back for a second touchpoint is where programmes lose most people (see docs/design-rationale.md and the engagement review).

Evidence: a specific when-and-what plan (implementation intention) has a medium-to-large effect on follow-through (Gollwitzer & Sheeran 2006, d = .65 over 94 tests), including in groups with weaker self-regulation. Most self-guided programmes lose half their users between the first and second session (ParentApp: 97% did module 1, 46% module 2). An early, easy second touchpoint targets exactly that drop.

## The new step 3 screen

Mock-up (content keys in brackets):

```
Step 3 of 3
When could you do 5 minutes of special time?        [trial.question per module and band]

( After school pick-up · 17:00 )  ( After homework · 18:30 )
( Before dinner · 19:30 )         ( At bath time · 20:00 )
( Another time… )

Tomorrow, Tuesday and Wednesday after school pick-up.   [plan_line]
We'll check in on Thursday.                             [checkin_line]
Change                                                   [change_link]

[ Add 3 reminders ]                                      [calendar_button]
  Not now                                                [skip_button]

Calendar entries only say "Coach" and the activity, never anything about your child. Nothing is sent from this app.
```

Behaviour:

- **No chip is pre-selected.** The primary button stays disabled until the parent taps a chip. That tap is the one decision, and it makes the plan theirs.
- **Each chip carries a default time and a day rule** (`when_options` below). The time shows inside the chip.
- **"Another time…"** opens a native time input and an optional short label ("after breakfast"). Day rule: any day.
- **The sentence updates live** after the tap. The weekday names are real ("Tomorrow, Tuesday and Wednesday"). If the first day is tomorrow, say "Tomorrow" for it.
- **"Change"** expands inline (not a new screen) and shows two controls only:
  - **Days:** the next 7 days as chips with the 3 planned days selected. The parent may pick 2–5 days.
  - **Time:** a native time input, pre-filled from the chip.
  Collapsing it keeps the changes. No length option in the fast start (see "What moves out").
- **Button label counts the sessions:** "Add 3 reminders" (or 2–5 if changed in "Change").
- **"Not now"** saves the plan without reminders and goes to This week. No guilt text.

### Day logic (pure function, unit-tested)

`trialDays(startFrom: Date, rule: 'school' | 'any', count = 3): Date[]`

- Start from tomorrow. Never today, even if the time hasn't passed: a same-day start asks too much at the moment of signing up.
- `school`: Monday to Friday only (skip Saturday and Sunday). Public holidays are not handled in Stage 1; note it as a known limit.
- `any`: consecutive days.
- Check-in date = the day after the last session, at the same time as the sessions.

Tests: started on a Friday with `school` → Mon, Tue, Wed, check-in Thu. Started on Wednesday with `any` → Thu, Fri, Sat, check-in Sun. Started on Thursday with `school` → Fri, Mon, Tue, check-in Wed. Custom days from "Change" (non-consecutive) → check-in the day after the last chosen day.

## Calendar events

Two entries in total, so Android needs only two taps:

| Entry | Start | Repeat | Duration | Title | Notes |
| --- | --- | --- | --- | --- | --- |
| Practice series | first trial day at the chosen time | `FREQ=DAILY;COUNT=3` if the days are consecutive, otherwise `FREQ=WEEKLY;BYDAY=<days>;COUNT=<n>` | trial.minutes | `trial.event_title` (e.g. "Coach: 5 min special time") | `trial.event_notes` (the 2–3 steps), then "Open the coach app for tips." |
| Check-in | check-in date, same time | none | 5 min | "Coach: how did it go? (2 min)" | "Open the coach app and tap Check in." |

- The alarm fires at the start time (`TRIGGER:PT0M`) for both.
- The privacy line changes from "only say 'Coach'" to "only say 'Coach' and the activity, never anything about your child". The activity name ("special time", "the pause") isn't sensitive, and a title that says what to do works far better as a cue than "practice time".
- Replace `fastStartEvents()` in `src/calendar.ts` with `trialEvents(plan, content)`. Keep `buildIcs`, `androidIntentUrl` and `downloadIcs`. `androidIntentUrl` already passes `rrule`. Check that `BYDAY` rules open correctly in Google Calendar on Android.
- Calendar screen (Android) button labels: "Add the 3 practice reminders" and "Add the check-in".

## The day-4 check-in ("How did it go?")

A light first check-in, not the full weekly one. It's reached from This week (button appears from the check-in date) or from the calendar entry.

1. **"On how many of the 3 days did you do it?"** Pre-filled from the daily ticks, 0–3 (or 0–n), editable.
2. **"How did it go?"** Better than I expected / OK / Hard.
3. **Next step**, with one recommended option first:
   - 2 or more days and not "Hard" → **"Keep going: 4 more days, same time"** (recommended), "Change time or days", "Try a different skill".
   - 0–1 days, or "Hard" → **"Try a different time"** (recommended), "Keep going as is", "Try a different skill". Message: "Finding the right moment is the hardest part. A different time often helps."
   - "Keep going" creates a second practice series (4 sessions, same day rule, from the next suitable day) plus the first weekly check-in, via the same calendar flow. Offer the full version here once: "Ready for the 10-minute version?" Yes / Keep it short.

The **first weekly check-in** (after those 4 more sessions) is where the deferred intake questions (`ask_at: week1_checkin`), the practice partner and the weekly check-in day are introduced. From then on, the weekly loop in CLAUDE.md applies unchanged.

## What moves out of the fast start

| Was on step 3 | Now |
| --- | --- |
| Separate "Reminder time" row | Time comes with the chip; editable in "Change" |
| "How much time do you have?" (5 / 10 min) | Trial always uses the short version. Full version offered at the day-4 check-in, and always one tap away on This week |
| Weekly check-in "Sunday at 20:30" | Day-4 check-in at the practice time; weekly check-in day chosen at the first weekly check-in |
| Daily practice reminder for 28 days | 3 sessions now, 4 more after the day-4 check-in |

## Content changes (apply to content JSON)

### `experience.json > quick_start.how` (replace)

```json
{
  "progress": "Step 3 of 3",
  "when_options": [
    { "label": "After school pick-up", "time": "17:00", "days": "school" },
    { "label": "After homework", "time": "18:30", "days": "school" },
    { "label": "Before dinner", "time": "19:30", "days": "any" },
    { "label": "At bath time", "time": "20:00", "days": "any" }
  ],
  "when_other": "Another time…",
  "when_other_label_placeholder": "For example: after breakfast (optional)",
  "plan_line": "{days} {when}.",
  "plan_line_custom": "{days} at {time}.",
  "checkin_line": "We'll check in on {checkin_day}.",
  "change_link": "Change",
  "change_days_label": "Days",
  "change_time_label": "Time",
  "change_days_hint": "Pick 2 to 5 days.",
  "tomorrow": "Tomorrow",
  "calendar_button": "Add {n} reminders",
  "skip_button": "Not now",
  "privacy_note": "Calendar entries only say \"Coach\" and the activity, never anything about your child. Nothing is sent from this app."
}
```

Default times suit Spanish family schedules (school ends around 16:30–17:00, dinner is late). Tune them after the friend test.

### `modules.json`: add a `trial` block to the three fast-start modules, per band

```json
"m1_special_time": {
  "4-9":  { "question": "When could you do 5 minutes of special time?", "minutes": 5,
            "event_title": "Coach: 5 min special time",
            "event_notes": "Let your child choose a calm activity. Follow their lead and describe what they do. No teaching or correcting." },
  "10-16": { "question": "When could you spend 10 minutes with your teen on something they choose?", "minutes": 10,
             "event_title": "Coach: 10 min with your teen",
             "event_notes": "Join something they pick. Listen more than you talk. No advice, school or chores." }
},
"m2_praise": {
  "4-9":  { "question": "When is a good moment to catch your child doing something right?", "minutes": 5,
            "event_title": "Coach: catch one good moment",
            "event_notes": "Watch for something your child does well, even partly. Say exactly what it was, right away." },
  "10-16": { "question": "When is a good moment to notice something your teen does well?", "minutes": 5,
             "event_title": "Coach: notice one good thing",
             "event_notes": "Tell your teen one specific thing they did well, in one sentence. Then leave it there." }
},
"m6_staying_calm": {
  "4-9":  { "question": "When could you practise the pause for one minute?", "minutes": 1,
            "event_title": "Coach: 1 min pause practice",
            "event_notes": "Stop. Breathe out slowly three times. Notice how your body feels. Practising when calm makes it easier when it counts." },
  "10-16": { "question": "When could you practise the pause for one minute?", "minutes": 1,
             "event_title": "Coach: 1 min pause practice",
             "event_notes": "Stop. Breathe out slowly three times. Notice how your body feels. Practising when calm makes it easier when it counts." }
}
```

Note: the existing teen `short_exercise` for special time says "10 minutes", so the trial uses 10 for teens to stay consistent.

### New: `experience.json > trial_checkin`

```json
{
  "title": "How did it go?",
  "days_question": "On how many of the {n} days did you do it?",
  "feeling_question": "How did it go?",
  "feeling_options": [
    { "value": "better", "label": "Better than I expected" },
    { "value": "ok", "label": "OK" },
    { "value": "hard", "label": "Hard" }
  ],
  "next_good": {
    "message": "Nice work. A few more tries make it feel natural.",
    "options": [
      { "value": "keep_going", "label": "Keep going: 4 more days, same time", "recommended": true },
      { "value": "change", "label": "Change time or days" },
      { "value": "other_skill", "label": "Try a different skill" }
    ]
  },
  "next_hard": {
    "message": "Finding the right moment is the hardest part. A different time often helps.",
    "options": [
      { "value": "change", "label": "Try a different time", "recommended": true },
      { "value": "keep_going", "label": "Keep going as is" },
      { "value": "other_skill", "label": "Try a different skill" }
    ]
  },
  "full_version_offer": "Ready for the 10-minute version?",
  "full_version_options": ["Yes, try 10 minutes", "Keep it short"]
}
```

(Show `full_version_offer` only for special time, ages 4–9.)

### `reminders.json`

- Replace `events.practice` and `events.checkin` with `trial_practice` (rrule built in code from the days, title and notes from `modules.json > trial`) and `trial_checkin` (single event, title "Coach: how did it go? (2 min)", notes "Open the coach app and tap Check in.", 5 minutes).
- Update `privacy_note` to match the new privacy line.

## State changes (`src/state.ts`)

- Remove `short` from the fast start (default `true` stays for the module view).
- Add `trial: { days: string[] /* YYYY-MM-DD */, time: string /* HH:MM */, whenLabel: string, dayRule: 'school' | 'any' | 'custom', checkinDate: string }`.
- Add `phase: 'trial' | 'continue' | 'weekly'`.
- Add `trialCheckin?: { daysDone: number; feeling: 'better' | 'ok' | 'hard'; choice: string; date: string }`.
- Keep everything local (rule 1). Include it all in export and delete.

## Acceptance checklist

- [ ] Step 3 shows one question, the chips with times, nothing pre-selected, and a disabled button until a chip is tapped.
- [ ] After a tap, the plan sentence and the check-in day are correct for school and any-day chips, started on every weekday (unit tests).
- [ ] "Change" opens inline with days (2–5) and time only. The button count follows the days.
- [ ] iPhone: one .ics with 2 entries; "Add All" creates 3 practice alarms and 1 check-in at the right local times.
- [ ] Android: 2 intent taps create the same. Fallback .ics still works.
- [ ] Event titles and notes come from `modules.json > trial` for the chosen module and age band.
- [ ] The day-4 check-in appears on This week from the check-in date, pre-fills days from ticks, and routes to "keep going" or "different time" as specified.
- [ ] No text anywhere says the parent missed, failed or is behind (rule 6).
- [ ] No hard-coded user-facing text (rule 4). Tests pass. Production build still has `connect-src 'none'`.

## Add to `docs/design-rationale.md`

| Journey step | Feature | Barrier it addresses / ingredient it uses | Evidence (short) |
| --- | --- | --- | --- |
| Fast start step 3 | One question ("When could you…?"), everything else defaulted | Overload at the point of least context; drop-off before the first try | Cognitive load and default effects (design principle); Gollwitzer & Sheeran 2006 (specific when-plan, d = .65) |
| Fast start step 3 | 3-session trial from tomorrow, check-in on day 4 | Steep drop between first and second session | ParentApp: 97% → 46% from module 1 to 2; early second touchpoint |
| Calendar | Event title says the activity; notes carry the steps | Practice is the weakest link; the cue arrives when it's needed | Chacko et al. 2016 (home practice ~41–48%); home practice predicts outcomes |
| Day-4 check-in | "Try a different time" when it was hard | Wrong timing is the most common practical barrier | Koerting et al. 2013 (practical barriers, timing) |

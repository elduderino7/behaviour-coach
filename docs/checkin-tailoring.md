# Check-in tailoring: positive, action-led questions spread over the journey

Decided by Tim on 2026-11-25. Builds on the short rounds design (24 Nov: 3-session rounds, a 2-minute round check-in, weekly rhythm offered from round 2). If session R1 (short rounds) isn't built yet, "round 1 check-in" means the existing day-4 check-in (`TrialCheckin.tsx`) and the later round slots wait for R1.

## Prompt to paste into Claude Code

> Read docs/checkin-tailoring.md and implement it. Propose a plan first and wait for my OK. Build it in the order of the "Build order" section, one part per evening. Keep all user-facing text in content JSON (rule 4), and keep every tailoring answer out of calendar text (rule 8). When done, update CLAUDE.md (journey, tailoring summary, "Where we left off"), add the rows to docs/design-rationale.md, and add A7 and the A4 update to docs/ethical-deviation-log.md.

## Why

Onboarding stays as it is (age, pick a skill, when). Tailoring moves into the check-ins the parent already does, one question at a time, asked at the moment its answer visibly changes the next round. Low perceived relevance and practice that is hard to fit in are among the main reasons parents drop out (engagement review, docs index item 8). Tailoring by situation, the child's interests and logistics answers both, without asking anything up front.

## Wording principles (apply to every question below)

1. Ask about the next try, not the last one.
2. Answer options are things the parent can choose, never judgements of the parent or the child.
3. Use "yet" and "for now" for anything unfinished.
4. Normalise in one short line, no empty praise.
5. Never use "missed", "failed", "behind", "why didn't you" or streak counts (rule 6).
6. Every tailoring question shows a one-line reason ("We'll use this to …") and a **Skip** link.
7. Tailoring is never about symptoms or the child's condition (rule 3). Only situations, interests, logistics and the parent's own energy.
8. Tailoring answers never leave the app: not in calendar titles or notes, not in shared text (rule 8).

## 1. The round check-in (replaces the day-4 check-in questions)

Every round check-in has the same two core questions, then at most one tailoring question, then the next step.

```
How did this round go?                                    [round_checkin.result_question]
( Did it every time )  ( Did it some of the time )  ( Haven't started yet )
                                                          pre-selected from the ticks
What would make the next round easier?                    [round_checkin.easier_question]
( A better time of day )
( A shorter version )
( Ideas for when my child pushes back )
( Feeling more natural saying it )
( It went well, I'm ready for more )
Most parents adjust something after their first rounds.   [round_checkin.easier_note]

[one tailoring question, if the picker returns one]       (section 2)

What next?                                                [next step, recommended first]
```

- **Result** is pre-selected from the ticks: all sessions ticked → `all`, some → `some`, none → `none`. The parent can change it. Store the tick count too (`daysDone`), as today.
- This replaces the old "How did it go?" (Better than I expected / OK / Hard). The obstacle answer carries the same information and also says what to change. Keep the old `feeling` field optional in state so earlier saved check-ins still load.
- **Easier** is single choice and skippable. "Haven't started yet" still asks it (the answer is most useful exactly then).
- For teens (10–16) the pushback option reads "Ideas for when my teen pushes back".

### Next step: `roundNextStep(input)` (pure function, unit-tested)

Input: `{ round, result, easier?, skill, hardRoundsInARowWithSkill }`. A round counts as **hard** when `result === 'none'` or `easier === 'better_time'`.

| Situation | Recommended first | Also offered | Message (`round_checkin.messages`) |
| --- | --- | --- | --- |
| Hard twice in a row with one skill | Try a different skill | Try a different time · Keep going as is (+ weekly rhythm from round 2) | `two_hard` |
| `easier = better_time` | Try a different time (step 3 again, chip pre-selected from `best_moment` if answered) | Keep going as is · Try a different skill | `better_time` |
| `result = none`, no easier answer | Try a different time | Keep going as is · Try a different skill | `not_started` |
| `easier = shorter` | Keep going with the shorter version (next round uses `trial.shorter`) | Change time or days · Try a different skill | `shorter` |
| `easier = pushback` | Keep going, same time (This week shows "When it doesn't work" open for this round) | Change time or days · Try a different skill | `pushback` |
| `easier = natural` | Keep going, same time (This week shows the example open, first) | Change time or days · Try a different skill | `natural` |
| `easier = ready_more`, round 1 | Keep going: 3 more days, same time (+ the 10-minute offer for special time 4–9, as today) | Change time or days · Try a different skill | `ready_more` |
| `easier = ready_more`, round 2 | Keep going: 3 more days, same time | Change time or days · Try a different skill · Move to a weekly rhythm | `ready_more` |
| `easier = ready_more`, round 3+ | Move to a weekly rhythm | Keep going · Try a different skill · Change time or days | `ready_more_rhythm` |
| Skipped, result `all` or `some` | Same as `ready_more` for that round | | `ok` |

From round 2, "Move to a weekly rhythm" is always among the options, never pre-selected unless the table says so. The recommended option shows a small "Because you said: {answer}" tag (section 4).

Tests: one per table row, plus "hard twice" winning over `better_time`, plus skipped easier with `none`.

## 2. Tailoring questions and when each is asked

### The question bank (`content/tailoring.json > questions`)

| id | Question | Options / input | What it changes, visibly and soon |
| --- | --- | --- | --- |
| `best_moment` | When did it work best? | The `when_options` chips, "Another time…", "Not sure yet" | Pre-selects the chip when the parent tries a different time or plans the next round |
| `hardest_moment` | Which part of the day would you most like to go more smoothly? | Mornings · Getting out the door · Homework · Screens · Bedtime · Between siblings | A situation tip on This week for praise and staying calm, a "pick a calmer moment" tip for special time; pre-selects `difficulties` = routines at rhythm start for mornings, out the door, homework and bedtime |
| `child_loves` | What does your child love doing with you? (teen: "What does your teen enjoy doing with you?") | Short text, up to 80 characters | "Ideas from you: …" on the special time screen; later the reward ideas in module 4 |
| `minutes` | On a normal day, how much time feels realistic? | About 2 minutes · About 5 minutes · 10 minutes or more | 2 → next round uses `trial.shorter` and modules open short; 5 → short; 10 → full version |
| `energy` | How much energy have you had for this week? | 5 steps: Very little · Little · Some · Quite a lot · Plenty | 1–2 → "Tough weeks are common. Want a 2-minute reset for yourself first?" (yes = staying calm is offered as the next skill or pulled forward in the plan); low twice in a row → a gentle "Support for you" card linking to Help |
| `who_else` | Who else could practise this with your child? | Partner · Grandparent · Other household · Just me for now | Replaces `co_parent` at rhythm start. Partner or other household → `co_parent = yes`; pre-selects the practice partner label |

Each question has a `why` line and a `skip` label in content (JSON below).

### Priority per check-in (highest expected impact first)

The picker asks **the first eligible question that isn't answered yet**, at most one per check-in. A question skipped twice is not asked again (it stays editable in "Your answers"). The order is data (`tailoring.json > slots`), so it can be changed without code.

| Check-in | 1st | 2nd | 3rd | 4th | Why this order |
| --- | --- | --- | --- | --- | --- |
| **Round 1** | `child_loves` (only if the skill is special time) | `hardest_moment` (only if the skill is praise or staying calm) | `best_moment` (only if result is `all` or `some`) | — | Biggest drop-off point. Ask only what makes round 2 of *this* skill feel more personal right away. |
| **Round 2** | `hardest_moment` | `child_loves` | `best_moment` (result `all`/`some`) | — | Situation tips now, and the answer feeds routing at rhythm start, which is first offered at this check-in. |
| **Round 3+** | `minutes` | `energy` | `hardest_moment` | `child_loves`, then `best_moment` | The weekly rhythm is suggested from round 3, so dose and the parent's own load matter before the bigger commitment. |
| **Rhythm start** | not a single slot: the existing deferred questions, skipping any already answered; `co_parent` replaced by `who_else`; `difficulties` pre-selected from `hardest_moment` | | | | Unchanged otherwise. |
| **Weekly 1** | `energy` | `child_loves` | `best_moment` | — | Parent load matters before the harder skills (rewards, consequences); `child_loves` feeds the rewards module. |
| **Weekly 2+** | `energy` (every second weekly check-in, the only repeating question) | any still unanswered, in Round 3+ order | | | Energy changes week to week; the rest is asked once. |
| **Welcome back** | none | | | | Coming back should cost nothing. |

Also at the weekly check-in, when the session 5 loop is built: if days practised is 0–2, ask the round check-in's "What would make next week easier?" (same options, "week" instead of "round") before the weekly adaptation. Its answer picks the recommended adaptation option, as in the table in section 1.

### `pickTailoringQuestion(slot, state, context)` (pure function, unit-tested)

- Returns a question id or `null`.
- Respects the eligibility conditions in the table (skill, result), "answered", "skipped twice" and the every-second-week rule for `energy`.
- Tests: one per slot and condition; skipped once comes back at the next check-in; skipped twice never comes back; `energy` alternates in weekly 2+.

## 3. Other wording changes

- **"I already do this"** on a module (when built): button "We already do this — show me the next step".
- **Welcome back** (`experience.json > welcome_back`): title "Welcome back!", body "Pick up where you left off, or start with a 1-minute refresher." Options: "Pick up where I left off" · "Start with a 1-minute refresher" (module summary and short exercise, then This week) · "Start a new 3-day round" · "Look back at a skill I've done". Never mention how long they were away.
- **Reminder time suggestion**: store the local time each check-in is completed. If the last two check-ins were completed within 45 minutes of each other and at least 60 minutes away from the planned check-in time, show one line when the next reminders are made: "You often check in around {time}. Want the check-in reminder then?" Yes / Keep it as it is. Never change it silently.

## 4. Transparency

- **Reason line and Skip** on every tailoring question (section 2).
- **"Because you said …" tag** on any tailored content (situation tip, ideas from you, shorter version, recommended next step). Tapping it opens that answer in "Your answers".
- **"Your answers" screen** (new screen `answers`, linked from the bottom of This week and later from Settings): every tailoring answer and when it was given, each with Change and Clear. Clearing an answer lets its question be asked again. Text: "Everything here stays on this phone. Change or clear anything."
- Changes based on how the app is used (reminder time) are always offered, never applied silently.

## 5. Test menu: switch between check-in questions

Extend the temporary test menu (`TestMenu` in `src/App.tsx`, deviation A4). All labels in `content/ui.json > test_menu`.

1. **Check-in questions** group: one entry per question (`result`, `easier`, `best_moment`, `hardest_moment`, `child_loves`, `minutes`, `energy`, `who_else`, reminder suggestion, Welcome back). Each opens a new `question_preview` screen that shows the question exactly as in a check-in (reason line, Skip, age-band wording).
   - **◀ Previous / Next ▶** buttons at the top cycle through all questions in bank order, so switching is one tap.
   - An **age band toggle** (4–9 / 10–16) and, for `easier`, a **round selector** (1 / 2 / 3+) and **skill selector**, so the preview shows the next-step result from `roundNextStep` and the tailored content it would produce (tip, ideas, shorter version).
   - Preview mode never saves anything. Banner: "Preview: nothing is saved."
2. **Run a check-in as…** group: Round 1 · Round 2 · Round 3 · Rhythm start · Weekly 1 · Weekly 2 · Welcome back. Each runs the real check-in flow on a temporary copy of the state, with the slot set, so you can see which question the picker chooses with the current answers. Nothing is saved; same banner.
3. **Clear tailoring answers**: removes only `tailoring` from state, so the questions come back. (Start over stays as it is.)

Like the rest of the test menu, it only shows from the second app open and must be hidden before the friend launch (A4).

## Content (apply to content JSON)

### New file `content/tailoring.json`

```json
{
  "version": "0.1.0",
  "status": "draft",
  "locale": "en",
  "skip": "Skip",
  "because_you_said": "Because you said: {answer}",
  "questions": {
    "best_moment": {
      "text": "When did it work best?",
      "why": "We'll suggest that time first next round.",
      "options_from": "experience.json > quick_start.how.when_options",
      "extra_options": [
        { "value": "other", "label": "Another time…" },
        { "value": "not_sure", "label": "Not sure yet" }
      ],
      "ask_if": { "result": ["all", "some"] }
    },
    "hardest_moment": {
      "text": "Which part of the day would you most like to go more smoothly?",
      "why": "We'll use it for your tips and examples.",
      "options": [
        { "value": "mornings", "label": "Mornings", "lower": "mornings" },
        { "value": "out_the_door", "label": "Getting out the door", "lower": "getting out the door" },
        { "value": "homework", "label": "Homework", "lower": "homework" },
        { "value": "screens", "label": "Screens", "lower": "screen time" },
        { "value": "bedtime", "label": "Bedtime", "lower": "bedtime" },
        { "value": "siblings", "label": "Between siblings", "lower": "sibling squabbles" }
      ],
      "routines_values": ["mornings", "out_the_door", "homework", "bedtime"]
    },
    "child_loves": {
      "text": { "4-9": "What does your child love doing with you?", "10-16": "What does your teen enjoy doing with you?" },
      "why": "We'll use it for special time ideas and, later, rewards.",
      "type": "text",
      "maxLength": 80,
      "placeholder": "For example: drawing, football, baking",
      "shown_as": "Ideas from you: {answer}"
    },
    "minutes": {
      "text": "On a normal day, how much time feels realistic?",
      "why": "We'll size each exercise to fit.",
      "options": [
        { "value": "2", "label": "About 2 minutes" },
        { "value": "5", "label": "About 5 minutes" },
        { "value": "10", "label": "10 minutes or more" }
      ],
      "replaces_intake": "minutes"
    },
    "energy": {
      "text": "How much energy have you had for this week?",
      "why": "So the coach can go easier when life is full.",
      "options": [
        { "value": 1, "label": "Very little" },
        { "value": 2, "label": "Little" },
        { "value": 3, "label": "Some" },
        { "value": 4, "label": "Quite a lot" },
        { "value": 5, "label": "Plenty" }
      ],
      "low_max": 2,
      "low_message": "Tough weeks are common. Want a 2-minute reset for yourself first?",
      "low_options": [
        { "value": "reset", "label": "Yes, show me" },
        { "value": "carry_on", "label": "Carry on as planned" }
      ],
      "support_card": {
        "title": "Support for you",
        "body": "Looking after yourself is part of this too. Here are people you can talk to.",
        "button": "See support options"
      }
    },
    "who_else": {
      "text": { "4-9": "Who else could practise this with your child?", "10-16": "Who else could practise this with your teen?" },
      "why": "We'll suggest them as your practice partner.",
      "options": [
        { "value": "partner", "label": "My partner", "co_parent": "yes", "partner_label": "your partner" },
        { "value": "grandparent", "label": "A grandparent", "co_parent": "no", "partner_label": "a grandparent" },
        { "value": "other_household", "label": "Someone in the other household", "co_parent": "yes", "partner_label": "the other parent" },
        { "value": "just_me", "label": "Just me for now", "co_parent": "no" }
      ],
      "replaces_intake": "co_parent"
    }
  },
  "slots": {
    "round1": [
      { "id": "child_loves", "if_skill": ["m1_special_time"] },
      { "id": "hardest_moment", "if_skill": ["m2_praise", "m6_staying_calm"] },
      { "id": "best_moment" }
    ],
    "round2": [{ "id": "hardest_moment" }, { "id": "child_loves" }, { "id": "best_moment" }],
    "round3plus": [
      { "id": "minutes" }, { "id": "energy" }, { "id": "hardest_moment" },
      { "id": "child_loves" }, { "id": "best_moment" }
    ],
    "weekly1": [{ "id": "energy" }, { "id": "child_loves" }, { "id": "best_moment" }],
    "weekly2plus": [
      { "id": "energy", "every_nth_weekly": 2, "repeats": true },
      { "id": "minutes" }, { "id": "hardest_moment" }, { "id": "child_loves" }, { "id": "best_moment" }
    ],
    "welcome_back": []
  },
  "max_skips": 2,
  "answers_screen": {
    "title": "Your answers",
    "intro": "Everything here stays on this phone. Change or clear anything.",
    "change": "Change",
    "clear": "Clear",
    "empty": "Nothing yet. The coach asks one quick question at some check-ins.",
    "link_label": "Your answers"
  },
  "reminder_suggestion": {
    "text": "You often check in around {time}. Want the check-in reminder then?",
    "yes": "Yes",
    "no": "Keep it as it is"
  }
}
```

### `experience.json > trial_checkin` → add these keys (keep the existing `next_*` keys only until `roundNextStep` replaces them, then remove)

```json
"result_question": "How did this round go?",
"result_options": [
  { "value": "all", "label": "Did it every time" },
  { "value": "some", "label": "Did it some of the time" },
  { "value": "none", "label": "Haven't started yet" }
],
"easier_question": "What would make the next round easier?",
"easier_question_weekly": "What would make next week easier?",
"easier_options": [
  { "value": "better_time", "label": "A better time of day" },
  { "value": "shorter", "label": "A shorter version" },
  { "value": "pushback", "label": { "4-9": "Ideas for when my child pushes back", "10-16": "Ideas for when my teen pushes back" } },
  { "value": "natural", "label": "Feeling more natural saying it" },
  { "value": "ready_more", "label": "It went well, I'm ready for more" }
],
"easier_note": "Most parents adjust something after their first rounds.",
"messages": {
  "better_time": "Finding the right moment is the hardest part. Let's try another one.",
  "not_started": "Getting started is often the trickiest bit. A different time can make it easier.",
  "two_hard": "Some skills fit some families better. Another one might click more easily right now.",
  "shorter": "Shorter counts. A small version done often works better than a long one done rarely.",
  "pushback": "Pushback is common at the start. The tips for that are at the top this round.",
  "natural": "It feels odd at first for most parents. The example is at the top this round to borrow from.",
  "ready_more": "Nice. A few more tries make it feel natural.",
  "ready_more_rhythm": "You've got a rhythm going. A weekly plan could be a good next step.",
  "ok": "Thanks. Here's a suggestion for the next round."
},
"next_options": {
  "keep_going": "Keep going: 3 more days, same time",
  "keep_going_shorter": "Keep going with the shorter version",
  "keep_as_is": "Keep going as is",
  "change_time": "Try a different time",
  "change": "Change time or days",
  "other_skill": "Try a different skill",
  "rhythm": "Move to a weekly rhythm"
}
```

### `modules.json`: two new blocks

**`trial.shorter` per band** (for "A shorter version" and `minutes = 2`). Titles ≤ 32 characters and pass `src/discretion.test.ts`:

```json
"m1_special_time": {
  "4-9":   { "shorter": { "minutes": 3, "event_title": "Coach: 3 min special time",
             "event_notes": "Let them choose. Follow their lead and describe what they do. Three minutes is enough." } },
  "10-16": { "shorter": { "minutes": 5, "event_title": "Coach: 5 min together",
             "event_notes": "Join something they pick for five minutes. Listen more than you talk." } }
},
"m2_praise": {
  "4-9":   { "shorter": { "minutes": 1, "event_title": "Coach: one good word",
             "event_notes": "Say one specific good thing you noticed. One sentence is enough." } },
  "10-16": { "shorter": { "minutes": 1, "event_title": "Coach: one good word",
             "event_notes": "Say one specific good thing you noticed. One sentence is enough." } }
},
"m6_staying_calm": {
  "4-9":   { "shorter": { "minutes": 1, "event_title": "Coach: one slow breath",
             "event_notes": "Stop and breathe out slowly once. That's the whole practice." } },
  "10-16": { "shorter": { "minutes": 1, "event_title": "Coach: one slow breath",
             "event_notes": "Stop and breathe out slowly once. That's the whole practice." } }
}
```

(Merge into the existing `trial` blocks; don't replace them.)

**`situation_tips`** on the module (band-neutral, shown on This week with the "Because you said" tag):

```json
"m1_special_time": { "situation_tip": "Special time works best away from {situation}. Pick a calmer moment for it." },
"m2_praise": { "situation_tips": {
  "mornings": "Mornings: praise the first step done without a reminder, like shoes on or teeth brushed.",
  "out_the_door": "Getting out the door: say what they did the moment they're ready, even if only partly.",
  "homework": "Homework: praise starting, not finishing. \"You sat down and opened your book straight away.\"",
  "screens": "Screens: praise the moment the screen goes down when asked, even on the second try.",
  "bedtime": "Bedtime: praise one step of the routine as it happens, like pyjamas on.",
  "siblings": "Between siblings: catch a calm moment together and say exactly what you saw. \"You let her have a turn.\""
} },
"m6_staying_calm": { "situation_tips": {
  "mornings": "Mornings: do your three slow breaths before the rush starts, so the pause is ready when you need it.",
  "out_the_door": "Getting out the door: pause by the door before the last call, not after.",
  "homework": "Homework: take your pause before you sit down next to them.",
  "screens": "Screens: pause before you ask for the screen to go off.",
  "bedtime": "Bedtime: pause in the doorway before you start the routine.",
  "siblings": "Between siblings: pause before you step in. A second of calm helps you decide whether you need to."
} }
```

### Other content

- `intake.json`: `minutes` options become 2 / 5 / 10 (labels from `tailoring.json`); `co_parent` is replaced by `who_else` at rhythm start.
- `routing.json > personal_defaults`: minutes 2 or 5 → short version; minutes 2 → next round uses `trial.shorter`.
- `experience.json > usage_log > events`: add `tailoring_asked (id, slot, answered | skipped)`, `tailoring_applied (id, where)`, `round_next_step (recommended, chosen)`.
- `experience.json > welcome_back`: the wording in section 3.
- `content/ui.json > test_menu`: labels for section 5.

## State changes (`src/state.ts`)

No version bump: all new fields are optional.

```ts
interface TailoringAnswer { value: string | number; slot: string; date: string; skips: number }
tailoring?: Partial<Record<'best_moment' | 'hardest_moment' | 'child_loves' | 'minutes' | 'energy' | 'who_else', TailoringAnswer>>;
energyHistory?: { date: string; value: number }[];
checkinTimes?: string[];               // local HH:MM of each completed check-in, last 5 kept
roundCheckins?: {                      // replaces the single trialCheckin; keep trialCheckin readable
  round: number; skill: string; daysDone: number;
  result: 'all' | 'some' | 'none'; easier?: string;
  tailoringAsked?: string;             // which question the picker chose, for later comparison
  recommended: string; choice: string; date: string;
}[];
```

All of it local (rule 1), included in export and removed by "Delete everything".

## Rule 8: keep answers out of calendar text

- Calendar builders never receive the `tailoring` object. `trialEvents` takes only the plan and the module's `trial` / `trial.shorter` text.
- Add to `src/discretion.test.ts`: every `trial.shorter` title and note, and a test that builds events from a state whose tailoring answers are sentinel strings ("ZZLOVESZZ" etc.) and asserts none of them appears in any title, note or Google Calendar link.

## Build order

1. **Round check-in**: result + easier questions, `roundNextStep` with tests, messages, shorter version in the calendar flow.
2. **Tailoring picker and bank**: `tailoring.json`, `pickTailoringQuestion` with tests, the question step in the check-in, the "Because you said" tag, situation tips, ideas from you.
3. **Your answers** screen and the reminder time suggestion.
4. **Test menu** entries (can be built right after step 1, to test as you go).
5. **Weekly**: energy, `who_else` at rhythm start, the weekly easier question, when R2 and session 5 exist.

## Acceptance checklist

- [ ] The round check-in shows result (pre-selected from ticks), easier, at most one tailoring question, then the next step with the recommended option first and its "Because you said" tag.
- [ ] `roundNextStep` and `pickTailoringQuestion` have a test for every table row and condition.
- [ ] A skipped question returns once, then never; it stays editable in Your answers.
- [ ] Choosing "A shorter version" makes the next round's calendar entries use `trial.shorter`.
- [ ] Situation tips and "Ideas from you" appear on This week for the right skill, never in calendar text (discretion test with sentinels passes).
- [ ] Test menu: every question opens in preview, Previous/Next cycles through all of them, "Run a check-in as…" shows the picker's choice per slot, nothing is saved in either mode.
- [ ] No text says the parent missed, failed or is behind (rule 6). No new forbidden words outside Help (rule 3). No hard-coded user-facing text (rule 4).
- [ ] Production build still has `connect-src 'none'`. Tests pass.

## Add to `docs/design-rationale.md`

| Journey step | Feature | Barrier it addresses / ingredient it uses | Evidence (short) |
| --- | --- | --- | --- |
| Round check-in | "What would make the next round easier?" with fixes as options | Wrong timing, practice hard to fit in, resistance; feeling judged when asked what went wrong | Koerting et al. 2013 (practical barriers); solution-focused framing; engagement review (feeling judged) |
| Round and weekly check-ins | One tailoring question per check-in, ordered by journey position | Low perceived relevance; overload at the start | Engagement review (tailoring, relevance); "ask when it matters" guideline (24 Nov) |
| This week | Situation tips and "Ideas from you" | Low perceived relevance; practice that doesn't fit daily life | Engagement review; home practice predicts outcomes (Chacko et al. 2016) |
| Round check-in | Shorter version on request | Practice is hard to fit in | Weekly adaptation rationale (short repeat); implementation intentions (Gollwitzer & Sheeran 2006) |
| Weekly check-in | Energy question with a reset offer | Parent stress lowers engagement and practice | Engagement review (parent wellbeing); module 6 rationale |
| Your answers | Every answer visible, changeable, clearable | Trust; user-first, local-only data | Project principles (user-first obligations) |

Change log line: "25 Nov 2026: check-in tailoring (docs/checkin-tailoring.md). The day-4 'How did it go?' question was replaced by result + 'What would make the next round easier?'."

## Add to `docs/ethical-deviation-log.md`

### A7. Energy question and support card

- **What:** At some check-ins the parent rates their own energy for the week (5 steps). Low twice in a row shows a "Support for you" card linking to Help.
- **Guideline bent:** Close to rule 3 (no scores, no screening). It is about the parent's week, not the child, and it doesn't interpret anything or produce a score that's shown back. Logged so the line stays visible.
- **Why and evidence:** Parent stress lowers practice; offering the staying-calm skill early and a route to support is a protective step.
- **Risk minimised by:** Optional with Skip; asked at most every second week; no number or trend is shown back as a result; wording never mentions health; Help content unchanged.
- **Decided by:** Tim, 25 Nov 2026 (to confirm when reviewing the plan).
- **Review:** Clinician review before Stage 2 (with B4); friend test: does it feel caring or intrusive?

### A4 update

Add one line: "25 Nov 2026: the test menu gained check-in question previews and simulated check-ins (docs/checkin-tailoring.md, section 5). Both never save. Same rule: hidden before the friend launch."

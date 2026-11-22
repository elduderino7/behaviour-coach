# Design rationale: why each part of the journey exists

Every feature answers a known reason parents drop out of parenting programmes, or uses an ingredient linked to better outcomes. If a feature can't be traced to this table, it doesn't belong in Stage 1.

Full review with sources: "Literature review: what makes parenting and behaviour change programmes engaging" (project docs index, item 8).

## The journey in one line

Welcome → Intake → Your plan → Set up your week (when, who, reminders) → weekly loop [This week: practise and tick → Check-in → Next step + preview + share] → Finished. "Welcome back" catches anyone who drifts away.

## Feature → evidence

| Journey step | Feature | Barrier it addresses / ingredient it uses | Evidence (short) |
| --- | --- | --- | --- |
| Welcome | Normalising, non-judgemental opening; "any parent or carer" | Stigma, feeling judged, "programmes are for other parents"; fathers feeling excluded | Koerting et al. 2013 (qualitative synthesis); Gonzalez et al. 2023 (father engagement low); NICE NG87 (tell parents it isn't about bad parenting) |
| Welcome | Private, on-phone use | Stigma; fear of being reported or labelled | Aldridge et al. 2024 (web delivery linked to engagement); Opie et al. 2024 (privacy lowers stigma barriers) |
| Intake | Tailored plan by age, difficulties, stress, time and learning style | Low perceived relevance | Aldridge et al. 2024 (tailoring, user control); Lustria et al. 2013 (tailored > untailored, small effect) |
| Your plan | "Why this module" line for each module | Relevance; trust | Koerting et al. 2013 |
| Your plan | Week 1 deliberately small (special time) | Early cliff after module 1 | ParentApp: 97% module 1 → 46% module 2; Kaminski et al. 2008 (positive interaction has the largest effects) |
| Set up your week | If-then practice plan ("When ___, I'll practise ___") | Practice hard to fit in; parents' own attention difficulties | Gollwitzer & Sheeran 2006 (implementation intentions, d = .65 over 94 tests); parental ADHD linked to lower between-session practice |
| Set up your week | Practice partner via share menu | No one to keep you going (biggest single lever); co-parent consistency; fathers | Day & Sanders 2018 (brief support roughly doubled completion); Musiat et al. 2021 (guidance +12% completion) |
| Set up your week | Calendar reminders (check-in on by default) | Forgetting to return | Alkhaldi et al. 2016 (prompts: modest effect) |
| This week | Practice front and centre; daily tick (no streaks) | Home practice is the weakest link and the strongest predictor | Chacko et al. 2016 (homework ~41–48%); home practice predicts outcomes |
| This week | Learning style; short version; minutes = 5 → short by default | Practical load; different learning styles | Koerting et al. 2013; Aldridge et al. 2024 (user control) |
| This week | "I already do this" | "Already use the strategies" → programme feels irrelevant | Koerting et al. 2013 |
| Check-in | Pre-filled days; adaptation; repeat-short option | Falling behind; practice too hard | Koerting et al. 2013; Chacko et al. 2016 |
| After check-in | Preview of next week + share with partner | Early cliff; keeps the partner loop going | ParentApp drop-off; Kelders et al. 2012 (new content and dialogue support predict adherence) |
| Welcome back | Never "behind"; restart short | Missing sessions makes parents feel too far behind to return | Koerting et al. 2013 (catch-up helps) |
| Finished | Graduation, no pressure to continue | Goal is behaviour change, not maximum use | Yardley et al. ("effective engagement") |
| Not included | Streaks, badges, points for the parent | Weak evidence in parenting; risk of guilt | Gamification evidence mostly physical activity; user-first commitments |

## One coherent rhythm for the parent

- **Once a week (about 5 minutes):** check in, see next week, set the when, optionally share.
- **Most days (minutes chosen at intake):** practise with the child, tick the day.
- **Nothing else.** No other prompts from the app. The calendar entries the parent chose, and their partner, are the only nudges.

## What to watch in the friend test

The stages where programmes usually lose people: intake completed → week 1 check-in → module 2 started → days practised per week → programme completed. Plus whether a partner was named and shared with. See docs/interview-guide.md.

## Change log

### 2026-11-22: fast start (decided by Tim)

The full intake, plan and "Set up your week" are replaced by a three-step fast start: age → pick a skill → how you'll do it (with calendar entries). Reason: get the parent from opening the app to a planned first week as fast as possible, since the biggest drop-off happens before and right after module 1.

What is kept, and where it moved:

| Ingredient | Where it is now |
| --- | --- |
| Tailoring by age | Asked up front (the only question) |
| Week 1 small, special time first | Special time is pre-marked "Recommended start"; the alternatives (praise, staying calm) are also low-effort, positive starts. Consequences, rewards and routines are not offered as a start, so the consequences gate still holds |
| If-then practice plan | Step 3, with the plan line shown back before saving |
| Reminders (check-in on by default) | Step 3: one button creates daily practice and weekly check-in |
| Short version for low time | Step 3: "About 5 minutes" (default) or "About 10 minutes" |
| Tailoring by difficulties, stress, co-parent, learning style, goal | Asked at the first check-in, when routing for weeks 2–4 first needs it |
| Practice partner | Share button on This week (to build) |

What to watch in the friend test: whether fewer up-front questions makes the plan feel less relevant ("why this module" is no longer shown for week 1), and whether parents answer the deferred questions at check-in.

### 2026-11-22: fast start v2, one decision and a 3-day trial (decided by Tim)

Full spec: `docs/fast-start-v2.md`. Step 3 asks only "When could you…?"; the app plans the rest.

| Journey step | Feature | Barrier it addresses / ingredient it uses | Evidence (short) |
| --- | --- | --- | --- |
| Fast start step 3 | One question ("When could you…?"), everything else defaulted | Overload at the point of least context; drop-off before the first try | Cognitive load and default effects (design principle); Gollwitzer & Sheeran 2006 (specific when-plan, d = .65) |
| Fast start step 3 | 3-session trial from tomorrow, check-in on day 4 | Steep drop between first and second session | ParentApp: 97% → 46% from module 1 to 2; early second touchpoint |
| Calendar | Event title says the activity; notes carry the steps | Practice is the weakest link; the cue arrives when it's needed | Chacko et al. 2016 (home practice ~41–48%); home practice predicts outcomes |
| Day-4 check-in | "Try a different time" when it was hard | Wrong timing is the most common practical barrier | Koerting et al. 2013 (practical barriers, timing) |

Implementation notes: on Android the calendar step uses Google Calendar links, an agreed exception to rule 2 (see CLAUDE.md), because Chrome doesn't open calendar apps through intent links. Public holidays aren't skipped (known limit).

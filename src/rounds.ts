// The round check-in's next step (docs/checkin-tailoring.md, section 1). Pure, unit-tested.

export type Result = 'all' | 'some' | 'none';
export type Easier = 'better_time' | 'shorter' | 'pushback' | 'natural' | 'ready_more';
export type NextOption =
  | 'keep_going'
  | 'keep_going_shorter'
  | 'keep_as_is'
  | 'change_time'
  | 'change'
  | 'other_skill'
  | 'rhythm';
export type MessageKey =
  | 'better_time'
  | 'not_started'
  | 'two_hard'
  | 'shorter'
  | 'pushback'
  | 'natural'
  | 'ready_more'
  | 'ready_more_rhythm'
  | 'ok';

export interface NextStepInput {
  /** This round's number (1 = the first 3-day trial). */
  round: number;
  result: Result;
  /** Undefined when the parent skipped the "easier" question. */
  easier?: Easier;
  skill: string;
  /** Hard rounds with this skill immediately before this one, in a row. */
  hardRoundsInARowWithSkill: number;
}

export interface NextStep {
  recommended: NextOption;
  /** All options, recommended first. */
  options: NextOption[];
  message: MessageKey;
  /** What the "Because you said" tag quotes. */
  because: { kind: 'easier'; value: Easier } | { kind: 'result'; value: Result };
}

/** A round is hard when nothing happened, or the time didn't work. */
export function isHard(result: Result, easier?: Easier): boolean {
  return result === 'none' || easier === 'better_time';
}

export function resultFromTicks(done: number, total: number): Result {
  if (done <= 0) return 'none';
  return done >= total ? 'all' : 'some';
}

function step(
  input: NextStepInput,
  recommended: NextOption,
  others: NextOption[],
  message: MessageKey,
): NextStep {
  const options = [recommended, ...others.filter((o) => o !== recommended)];
  // From round 2, the weekly rhythm is always offered (never pre-selected unless recommended).
  if (input.round >= 2 && !options.includes('rhythm')) options.push('rhythm');
  const because =
    input.easier !== undefined
      ? ({ kind: 'easier', value: input.easier } as const)
      : ({ kind: 'result', value: input.result } as const);
  return { recommended, options, message, because };
}

function readyMore(input: NextStepInput, message: MessageKey): NextStep {
  if (input.round >= 3) {
    return step(input, 'rhythm', ['keep_going', 'other_skill', 'change'], message === 'ok' ? 'ok' : 'ready_more_rhythm');
  }
  return step(input, 'keep_going', ['change', 'other_skill'], message);
}

export function roundNextStep(input: NextStepInput): NextStep {
  const { result, easier } = input;

  if (isHard(result, easier) && input.hardRoundsInARowWithSkill >= 1) {
    return step(input, 'other_skill', ['change_time', 'keep_as_is'], 'two_hard');
  }
  if (easier === 'better_time') return step(input, 'change_time', ['keep_as_is', 'other_skill'], 'better_time');
  if (result === 'none' && easier === undefined) {
    return step(input, 'change_time', ['keep_as_is', 'other_skill'], 'not_started');
  }
  switch (easier) {
    case 'shorter':
      return step(input, 'keep_going_shorter', ['change', 'other_skill'], 'shorter');
    case 'pushback':
      return step(input, 'keep_going', ['change', 'other_skill'], 'pushback');
    case 'natural':
      return step(input, 'keep_going', ['change', 'other_skill'], 'natural');
    case 'ready_more':
      return readyMore(input, 'ready_more');
    default:
      // Skipped, with result "all" or "some": same as ready_more for this round.
      return readyMore(input, 'ok');
  }
}

/** Consecutive hard rounds with `skill`, counting back from the most recent check-in. */
export function hardRoundsInARow(
  checkins: { skill: string; result: Result; easier?: string }[],
  skill: string,
): number {
  let n = 0;
  for (let i = checkins.length - 1; i >= 0; i--) {
    const c = checkins[i];
    if (c.skill !== skill || !isHard(c.result, c.easier as Easier | undefined)) break;
    n++;
  }
  return n;
}

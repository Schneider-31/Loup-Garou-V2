// Small vibration + sound effects. No audio files: the sounds are generated
// with the browser's Web Audio API, so nothing extra to download or host.
//
// Design rule: the sounds never depend on the player's role. A different sound
// for wolves would tell the people sitting around the table who the wolves are.

const KEY = 'wg-feedback';

export function isFeedbackOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setFeedbackOn(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* storage unavailable: the setting just won't be remembered */
  }
}

export function vibrate(pattern: number | number[]): void {
  if (!isFeedbackOn()) return;
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch {
    /* some browsers refuse vibration without a recent tap: ignore */
  }
}

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (audioCtx) return audioCtx;
    const w = window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
    return audioCtx;
  } catch {
    return null;
  }
}

function tone(
  ctx: AudioContext,
  freq: number,
  startAt: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
}

function play(notes: Array<[freq: number, offset: number, duration: number, volume: number, type?: OscillatorType]>): void {
  if (!isFeedbackOn()) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') void ctx.resume();
    const now = ctx.currentTime;
    for (const [freq, offset, duration, volume, type] of notes) {
      tone(ctx, freq, now + offset, duration, volume, type);
    }
  } catch {
    /* audio is a bonus: never let it break the game */
  }
}

/** The card was revealed: soft two-note chime (same for every role). */
export function feedbackReveal(): void {
  vibrate(35);
  play([
    [523, 0, 0.35, 0.12],
    [784, 0.09, 0.45, 0.1],
  ]);
}

/** The cards have just arrived on this phone. */
export function feedbackDealt(): void {
  vibrate([120, 60, 120]);
  play([
    [196, 0, 0.3, 0.16, 'triangle'],
    [247, 0.14, 0.4, 0.12, 'triangle'],
  ]);
}

/** This player has just been eliminated. Vibration only: a sound would be heard by the whole table. */
export function feedbackEliminated(): void {
  vibrate([250, 80, 250]);
}

/** Night/day switched. Vibration only: players keep silent at night. */
export function feedbackPhaseChange(): void {
  vibrate(60);
}

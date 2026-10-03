/**
 * Demo controls for the mock API: latency profile, error injection and empty data.
 * Persisted per browser so a reviewer can reload with the same scenario; tests use `none`.
 */
import { delay, HttpResponse } from 'msw';

/** `hang` never answers — Storybook uses it to freeze loading states. */
export type Latency = 'none' | 'fast' | 'realistic' | 'slow' | 'hang';
export type Failure = 'none' | 'random' | 'all';

export interface Scenario {
  latency: Latency;
  errors: Failure;
  empty: boolean;
}

const KEY = 'watt-demo-scenario';
const DEFAULT: Scenario = { latency: 'realistic', errors: 'none', empty: false };

function load(): Scenario {
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<Scenario>) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

let current: Scenario = load();
const listeners = new Set<(s: Scenario) => void>();

export const getScenario = () => current;

export function setScenario(patch: Partial<Scenario>, { persist = true } = {}) {
  current = { ...current, ...patch };
  if (persist) {
    try {
      globalThis.localStorage?.setItem(KEY, JSON.stringify(current));
    } catch {
      /* private mode: keep it in memory */
    }
  }
  listeners.forEach((l) => l(current));
}

export function subscribeScenario(listener: (s: Scenario) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Log-normal-ish latency: most answers in 300–900 ms, a long tail up to ~2.5 s. */
function sampleLatency(profile: Latency) {
  if (profile === 'none' || profile === 'hang') return 0;
  const u = Math.random();
  if (profile === 'fast') return 80 + u * 140;
  if (profile === 'slow') return 1600 + u * 2200;
  const gaussian = Math.sqrt(-2 * Math.log(1 - u)) * Math.cos(2 * Math.PI * Math.random());
  return Math.min(2600, Math.max(220, Math.exp(6.35 + 0.45 * gaussian)));
}

/**
 * Called at the top of every handler. Waits like a real gateway would and, depending on the
 * scenario, answers 503 instead of the real payload.
 */
export async function simulate(): Promise<Response | undefined> {
  const s = current;
  if (s.latency === 'hang') await delay('infinite');
  await delay(sampleLatency(s.latency));
  if (s.errors === 'all' || (s.errors === 'random' && Math.random() < 0.15)) {
    return HttpResponse.json(
      { message: 'The meter gateway didn’t respond in time.', code: 'GATEWAY_TIMEOUT' },
      { status: 503 },
    );
  }
  return undefined;
}

export const isEmpty = () => current.empty;

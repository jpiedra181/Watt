import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, expect, vi } from 'vitest';
import { resetDb } from '@/mocks/db';
import { setScenario } from '@/mocks/scenario';
import { server } from '@/mocks/server';

/* ── jsdom gaps used by Radix, Recharts and the layout ───────────────────────────────── */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query.includes('min-width: 1280px') || query.includes('min-width: 768px'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});
class Observer {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
globalThis.ResizeObserver ??= Observer as unknown as typeof ResizeObserver;
globalThis.IntersectionObserver ??= Observer as unknown as typeof IntersectionObserver;
Element.prototype.scrollIntoView ??= () => {};
// The router restores scroll on navigation; jsdom only logs "not implemented".
window.scrollTo = () => {};
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.releasePointerCapture ??= () => {};
URL.createObjectURL ??= () => 'blob:watt';
URL.revokeObjectURL ??= () => {};
HTMLAnchorElement.prototype.click = function click() {}; // downloads are a no-op in tests

/* ── Mock API: same handlers as the browser, instant answers ─────────────────────────── */
const instant = { latency: 'none', errors: 'none', empty: false } as const;
setScenario(instant, { persist: false });
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

/* ── Quality gate: any console.error / console.warn fails the test ───────────────────── */
let logged: string[] = [];
beforeEach(() => {
  logged = [];
  for (const level of ['error', 'warn'] as const) {
    vi.spyOn(console, level).mockImplementation((...args: unknown[]) => {
      logged.push(`console.${level}: ${args.map(String).join(' ').slice(0, 400)}`);
    });
  }
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetDb();
  setScenario(instant, { persist: false });
  expect(logged, 'The test wrote to console.error / console.warn').toEqual([]);
});

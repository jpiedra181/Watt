import type { z } from 'zod';

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const base = () => (typeof window !== 'undefined' ? window.location.origin : 'http://localhost');

/**
 * Typed fetch for the Watt API. Responses are validated against the zod contract in development
 * and tests, so a mock that drifts from the schema fails loudly instead of rendering nonsense.
 */
export async function request<S extends z.ZodType>(
  path: string,
  schema: S,
  init: RequestInit & { json?: unknown } = {},
): Promise<z.infer<S>> {
  const { json, headers, ...rest } = init;
  const res = await fetch(new URL(path, base()), {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (body ?? {}) as { message?: string; code?: string };
    throw new ApiError(err.message ?? `Request failed (${res.status})`, res.status, err.code);
  }
  if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw new Error(`Contract mismatch for ${path}: ${parsed.error.message}`);
    return parsed.data;
  }
  return body as z.infer<S>;
}

export const qs = (params: Record<string, string | number | undefined | null>) => {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params))
    if (v !== undefined && v !== null && v !== '') s.set(k, String(v));
  const str = s.toString();
  return str ? `?${str}` : '';
};

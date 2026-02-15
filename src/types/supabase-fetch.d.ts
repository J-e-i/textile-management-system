// Minimal TypeScript shim for `fetch` used by @supabase types.
// This avoids compiler errors in environments where the DOM lib isn't included.

export {};

declare global {
  const fetch: any;
  type Fetch = any;
}

// Note: This is a small shim to unblock local development. If you prefer full DOM types,
// add "DOM" to the `lib` array in your tsconfig (tsconfig.app.json already has it).

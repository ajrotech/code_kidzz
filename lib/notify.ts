// Pluggable send layer for email/WhatsApp.
//
// Today: every "send" is logged to the console and stored in an Outbox the admin
// can see (Settings > Outbox), so the full flow (password resets, notifications)
// works end-to-end right now with zero configuration.
//
// To go live: implement sendViaProvider() below with a real API call (Resend,
// SendGrid, Twilio, etc.) using a server route — API keys must never live in
// frontend code. A minimal example using a Vercel function is sketched at the
// bottom of this file in a comment.

export type OutboxEntry = {
  id: string;
  to: string;
  channel: 'Email' | 'WhatsApp';
  subject: string;
  body: string;
  createdAt: string;
};

const OUTBOX_KEY = 'codekidzz-outbox';

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getOutbox(): OutboxEntry[] {
  return safeParse<OutboxEntry[]>(localStorage.getItem(OUTBOX_KEY), []);
}

async function sendViaProvider(entry: Omit<OutboxEntry, 'id' | 'createdAt'>): Promise<void> {
  // No provider configured yet — this is the single place to swap in a real one.
  // Example (server-side, e.g. api/notify.js), once you have a Resend key set as
  // an env var:
  //
  //   const res = await fetch('/api/notify', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(entry),
  //   });
  //   if (!res.ok) throw new Error('Send failed');
  //
  console.info(`[notify] Would send ${entry.channel} to ${entry.to}: ${entry.subject}`);
}

export async function sendMessage(entry: Omit<OutboxEntry, 'id' | 'createdAt'>): Promise<OutboxEntry> {
  await sendViaProvider(entry);
  const record: OutboxEntry = { ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  const outbox = getOutbox();
  localStorage.setItem(OUTBOX_KEY, JSON.stringify([record, ...outbox].slice(0, 200)));
  return record;
}

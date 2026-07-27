import { beforeEach, describe, expect, it } from 'vitest';
import {
  authenticateAdminAccount,
  bulkUpdateEnrollmentStatus,
  createAdminAccount,
  getAdminAccounts,
  getEnrollments,
  getLoginHistory,
  getLoginLockStatus,
  saveEnrollment,
  toCSV,
  updateEnrollmentQuote,
  updateEnrollmentStatus,
} from './storage';

beforeEach(() => {
  localStorage.clear();
});

describe('admin accounts & auth', () => {
  it('creates the first admin with a hashed (not plaintext) password', async () => {
    const result = await createAdminAccount({
      name: 'Test Admin',
      email: 'admin@example.com',
      password: 'supersecret123',
      role: 'Admin',
    });
    expect(result.ok).toBe(true);

    const [account] = getAdminAccounts();
    expect(account.email).toBe('admin@example.com');
    expect(account.passwordHash).not.toBe('supersecret123');
    expect(account.passwordHash).toMatch(/^[0-9a-f]{64}$/); // sha256 hex
  });

  it('logs in with correct credentials and rejects wrong ones', async () => {
    await createAdminAccount({ name: 'Admin', email: 'admin@example.com', password: 'correct-password', role: 'Admin' });

    const good = await authenticateAdminAccount({ email: 'admin@example.com', password: 'correct-password' });
    expect(good.ok).toBe(true);

    const bad = await authenticateAdminAccount({ email: 'admin@example.com', password: 'wrong-password' });
    expect(bad.ok).toBe(false);
  });

  it('rejects a password under 8 characters', async () => {
    const result = await createAdminAccount({ name: 'Admin', email: 'a@example.com', password: 'short', role: 'Admin' });
    expect(result.ok).toBe(false);
  });

  it('locks out after 5 failed attempts', async () => {
    await createAdminAccount({ name: 'Admin', email: 'admin@example.com', password: 'correct-password', role: 'Admin' });

    for (let i = 0; i < 5; i += 1) {
      await authenticateAdminAccount({ email: 'admin@example.com', password: 'wrong' });
    }

    expect(getLoginLockStatus().locked).toBe(true);

    // Even the correct password should be rejected while locked.
    const attempt = await authenticateAdminAccount({ email: 'admin@example.com', password: 'correct-password' });
    expect(attempt.ok).toBe(false);
  });

  it('records login attempts in the audit log', async () => {
    await createAdminAccount({ name: 'Admin', email: 'admin@example.com', password: 'correct-password', role: 'Admin' });
    await authenticateAdminAccount({ email: 'admin@example.com', password: 'wrong' });
    await authenticateAdminAccount({ email: 'admin@example.com', password: 'correct-password' });

    const history = getLoginHistory();
    expect(history.some((entry) => entry.result === 'Failed')).toBe(true);
    expect(history.some((entry) => entry.result === 'Success')).toBe(true);
    expect(history.some((entry) => entry.result === 'AccountCreated')).toBe(true);
  });
});

describe('enrollments', () => {
  const sample = {
    studentName: 'Ali',
    parentName: 'Sana',
    ageClass: '8',
    whatsappNumber: '+92 300 1234567',
    emailAddress: 'sana@example.com',
    selectedCourse: 'Game Dev with Scratch',
    message: '',
  };

  it('saves and retrieves an enrollment', () => {
    saveEnrollment(sample);
    const all = getEnrollments();
    expect(all).toHaveLength(1);
    expect(all[0].studentName).toBe('Ali');
    expect(all[0].status).toBe('New');
  });

  it('updates enrollment status', () => {
    const record = saveEnrollment(sample);
    updateEnrollmentStatus(record.id, 'Confirmed');
    expect(getEnrollments()[0].status).toBe('Confirmed');
  });

  it('bulk-updates multiple enrollments at once', () => {
    const a = saveEnrollment(sample);
    const b = saveEnrollment({ ...sample, studentName: 'Bilal' });
    bulkUpdateEnrollmentStatus([a.id, b.id], 'Contacted');
    const all = getEnrollments();
    expect(all.every((item) => item.status === 'Contacted')).toBe(true);
  });

  it('tracks a quote amount and status', () => {
    const record = saveEnrollment(sample);
    updateEnrollmentQuote(record.id, 250, 'Sent');
    const updated = getEnrollments()[0];
    expect(updated.quoteAmount).toBe(250);
    expect(updated.quoteStatus).toBe('Sent');
  });
});

describe('CSV export', () => {
  it('produces a header row and escapes commas/quotes', () => {
    const csv = toCSV(
      [{ name: 'Smith, John', note: 'Said "hello"' }],
      [{ key: 'name', label: 'Name' }, { key: 'note', label: 'Note' }],
    );
    expect(csv).toContain('Name,Note');
    expect(csv).toContain('"Smith, John"');
    expect(csv).toContain('"Said ""hello"""');
  });
});

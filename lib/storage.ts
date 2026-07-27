// Client-side data layer. Works fully offline with no setup.
// To upgrade to shared, multi-device storage, connect the optional API in /api
// (see README) and swap these calls for fetch() calls to those endpoints.

export type EnrollmentFormValues = {
  studentName: string;
  parentName: string;
  ageClass: string;
  whatsappNumber: string;
  emailAddress: string;
  selectedCourse: string;
  message: string;
};

export type ContactFormValues = {
  name: string;
  email: string;
  message: string;
};

export type SchoolInquiryFormValues = {
  schoolName: string;
  contactName: string;
  role: string;
  email: string;
  phone: string;
  studentCount: string;
  programInterest: string;
  message: string;
};

export type EnrollmentRecord = EnrollmentFormValues & {
  id: string;
  createdAt: string;
  status: 'New' | 'Contacted' | 'Confirmed';
  verificationStatus?: 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
  quoteAmount?: number;
  quoteStatus?: 'Not Sent' | 'Sent' | 'Accepted' | 'Declined';
};

export type ContactRecord = ContactFormValues & {
  id: string;
  createdAt: string;
};

export type SchoolInquiryRecord = SchoolInquiryFormValues & {
  id: string;
  createdAt: string;
  status: 'New' | 'Contacted' | 'Scheduled' | 'Closed';
};

export type StudentRecord = {
  id: string;
  fullName: string;
  parentName: string;
  email: string;
  phone: string;
  ageClass: string;
  assignedCourse: string;
  enrollmentId?: string;
  progress: number;
  status: 'Active' | 'Paused' | 'Completed';
  createdAt: string;
};

export type AdminCourseRecord = {
  id: string;
  title: string;
  level: string;
  duration: string;
  instructor: string;
  capacity: number;
  enrolledCount: number;
  status: 'Published' | 'Draft' | 'Archived';
  updatedAt: string;
};

export type ClassScheduleRecord = {
  id: string;
  courseId: string;
  courseTitle: string;
  batchName: string;
  day: string;
  startTime: string;
  endTime: string;
  instructor: string;
  mode: 'Online' | 'Hybrid';
};

export type ResourceRecord = {
  id: string;
  title: string;
  type: 'Worksheet' | 'Project Pack' | 'Recording' | 'Guide';
  courseTitle: string;
  visibility: 'Students' | 'Parents' | 'Internal';
  updatedAt: string;
};

export type NotificationRecord = {
  id: string;
  title: string;
  audience: 'All' | 'Students' | 'Parents' | 'Staff';
  channel: 'Email' | 'In-app' | 'WhatsApp';
  status: 'Draft' | 'Scheduled' | 'Sent';
  createdAt: string;
};

export type PlatformSettings = {
  allowPublicEnrollment: boolean;
  requireManualVerification: boolean;
  sendAutoConfirmation: boolean;
  maintenanceMode: boolean;
  supportEmail: string;
  supportPhone: string;
  timezone: string;
  updatedAt: string;
};

export type AdminRole = 'Admin' | 'Tutor';

export type AdminAccount = {
  name: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  role: AdminRole;
  createdAt: string;
};

export type AdminSession = {
  isAuthed: boolean;
  name: string;
  email: string;
  role: AdminRole;
  authenticatedAt: string;
};

export type LoginHistoryRecord = {
  id: string;
  email: string;
  result: 'Success' | 'Failed' | 'Locked' | 'AccountCreated' | 'PasswordReset';
  role?: AdminRole;
  createdAt: string;
};

type PasswordResetToken = {
  email: string;
  token: string;
  expiresAt: number;
};

const PREFIX = 'codekidzz';
const ENROLLMENT_KEY = `${PREFIX}-enrollments`;
const CONTACT_KEY = `${PREFIX}-contacts`;
const SCHOOL_INQUIRIES_KEY = `${PREFIX}-school-inquiries`;
const ADMIN_KEY = `${PREFIX}-admin-session`;
const STUDENTS_KEY = `${PREFIX}-students`;
const ADMIN_COURSES_KEY = `${PREFIX}-admin-courses`;
const SCHEDULES_KEY = `${PREFIX}-class-schedules`;
const RESOURCES_KEY = `${PREFIX}-resources`;
const NOTIFICATIONS_KEY = `${PREFIX}-notifications`;
const SETTINGS_KEY = `${PREFIX}-platform-settings`;
const ADMIN_ACCOUNTS_KEY = `${PREFIX}-admin-accounts`;
const LOGIN_ATTEMPTS_KEY = `${PREFIX}-admin-login-attempts`;
const LOGIN_HISTORY_KEY = `${PREFIX}-login-history`;
const RESET_TOKENS_KEY = `${PREFIX}-reset-tokens`;

// ---- Password hashing (Web Crypto SHA-256 + per-account salt) ----
// This runs entirely in the browser, so it is meaningfully better than
// plaintext but not a substitute for server-side hashing (bcrypt/argon2)
// once real user data is on the line — that's what the optional /api
// backend (using bcrypt) is for.
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function randomSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string, salt: string = randomSalt()): Promise<{ hash: string; salt: string }> {
  const hash = await sha256Hex(`${salt}:${password}`);
  return { hash, salt };
}

async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  const { hash } = await hashPassword(password, salt);
  return hash === expectedHash;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeAdminAccounts(): AdminAccount[] {
  const existing = safeJsonParse<AdminAccount[]>(localStorage.getItem(ADMIN_ACCOUNTS_KEY), []);
  const usable = existing
    .filter((account) => account.email && account.passwordHash && account.passwordSalt)
    .map((account) => ({ ...account, email: normalizeEmail(account.email), createdAt: account.createdAt ?? new Date().toISOString() }));

  if (JSON.stringify(existing) !== JSON.stringify(usable)) {
    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(usable));
  }
  return usable;
}

export function getAdminAccounts(): AdminAccount[] {
  return normalizeAdminAccounts();
}

export async function createAdminAccount(input: {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const list = getAdminAccounts();
  const exists = list.find((a) => normalizeEmail(a.email) === normalizeEmail(input.email));
  if (exists) return { ok: false, error: 'An account with that email already exists.' };
  if (input.password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };

  const { hash, salt } = await hashPassword(input.password);
  const record: AdminAccount = {
    name: input.name,
    email: normalizeEmail(input.email),
    passwordHash: hash,
    passwordSalt: salt,
    role: input.role,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify([record, ...list]));
  recordLoginHistory(record.email, 'AccountCreated', record.role);
  return { ok: true };
}

export function deleteAdminAccount(email: string): { ok: true } | { ok: false; error: string } {
  const list = getAdminAccounts();
  const remaining = list.filter((a) => normalizeEmail(a.email) !== normalizeEmail(email));
  if (remaining.length === list.length) return { ok: false, error: 'Account not found.' };
  if (remaining.filter((account) => account.role === 'Admin').length === 0) {
    return { ok: false, error: 'At least one Admin account is required.' };
  }
  localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(remaining));
  return { ok: true };
}

export function updateAdminAccountRole(email: string, role: AdminRole): { ok: true } | { ok: false; error: string } {
  const list = getAdminAccounts();
  const idx = list.findIndex((a) => normalizeEmail(a.email) === normalizeEmail(email));
  if (idx === -1) return { ok: false, error: 'Account not found.' };
  if (list[idx].role === 'Admin' && role === 'Tutor' && list.filter((a) => a.role === 'Admin').length === 1) {
    return { ok: false, error: 'At least one Admin account is required.' };
  }
  list[idx] = { ...list[idx], role };
  localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(list));
  return { ok: true };
}

export async function changeAdminPassword(email: string, newPassword: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (newPassword.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
  const list = getAdminAccounts();
  const idx = list.findIndex((a) => normalizeEmail(a.email) === normalizeEmail(email));
  if (idx === -1) return { ok: false, error: 'Account not found.' };
  const { hash, salt } = await hashPassword(newPassword);
  list[idx] = { ...list[idx], passwordHash: hash, passwordSalt: salt };
  localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(list));
  return { ok: true };
}

// ---- Login rate limiting (per browser — a real deterrent, not a bypassable demo toggle) ----
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 10 * 60 * 1000;

type LoginAttemptState = { count: number; lockedUntil: number | null };

function getLoginAttemptState(): LoginAttemptState {
  return safeJsonParse<LoginAttemptState>(localStorage.getItem(LOGIN_ATTEMPTS_KEY), { count: 0, lockedUntil: null });
}

export function getLoginLockStatus(): { locked: boolean; remainingMs: number } {
  const state = getLoginAttemptState();
  if (state.lockedUntil && state.lockedUntil > Date.now()) {
    return { locked: true, remainingMs: state.lockedUntil - Date.now() };
  }
  return { locked: false, remainingMs: 0 };
}

function recordFailedLogin() {
  const state = getLoginAttemptState();
  const count = state.count + 1;
  const lockedUntil = count >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : null;
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify({ count: lockedUntil ? 0 : count, lockedUntil }));
}

function clearLoginAttempts() {
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify({ count: 0, lockedUntil: null }));
}

// ---- Audit log ----
export function getLoginHistory(): LoginHistoryRecord[] {
  return safeJsonParse<LoginHistoryRecord[]>(localStorage.getItem(LOGIN_HISTORY_KEY), []);
}

function recordLoginHistory(email: string, result: LoginHistoryRecord['result'], role?: AdminRole) {
  const entry: LoginHistoryRecord = {
    id: crypto.randomUUID(),
    email,
    result,
    role,
    createdAt: new Date().toISOString(),
  };
  const history = getLoginHistory();
  // Keep the log bounded so localStorage doesn't grow without limit.
  localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify([entry, ...history].slice(0, 500)));
}

export function getEnrollments(): EnrollmentRecord[] {
  return safeJsonParse<EnrollmentRecord[]>(localStorage.getItem(ENROLLMENT_KEY), []);
}

export function saveEnrollment(values: EnrollmentFormValues): EnrollmentRecord {
  const record: EnrollmentRecord = {
    ...values,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'New',
    verificationStatus: 'Pending',
    notes: '',
  };
  const items = getEnrollments();
  localStorage.setItem(ENROLLMENT_KEY, JSON.stringify([record, ...items]));
  return record;
}

export function updateEnrollmentStatus(id: string, status: EnrollmentRecord['status']): EnrollmentRecord[] {
  const updated = getEnrollments().map((item) => (item.id === id ? { ...item, status } : item));
  localStorage.setItem(ENROLLMENT_KEY, JSON.stringify(updated));
  return updated;
}

export function bulkUpdateEnrollmentStatus(ids: string[], status: EnrollmentRecord['status']): EnrollmentRecord[] {
  const idSet = new Set(ids);
  const updated = getEnrollments().map((item) => (idSet.has(item.id) ? { ...item, status } : item));
  localStorage.setItem(ENROLLMENT_KEY, JSON.stringify(updated));
  return updated;
}

export function updateEnrollmentQuote(
  id: string,
  quoteAmount: number | undefined,
  quoteStatus: NonNullable<EnrollmentRecord['quoteStatus']>,
): EnrollmentRecord[] {
  const updated = getEnrollments().map((item) => (item.id === id ? { ...item, quoteAmount, quoteStatus } : item));
  localStorage.setItem(ENROLLMENT_KEY, JSON.stringify(updated));
  return updated;
}

export function updateEnrollmentVerification(
  id: string,
  verificationStatus: NonNullable<EnrollmentRecord['verificationStatus']>,
  notes: string,
): EnrollmentRecord[] {
  const updated = getEnrollments().map((item) =>
    item.id === id ? { ...item, verificationStatus, notes } : item,
  );
  localStorage.setItem(ENROLLMENT_KEY, JSON.stringify(updated));
  return updated;
}

export function addStudentFromEnrollment(enrollmentId: string): StudentRecord | null {
  const enrollment = getEnrollments().find((item) => item.id === enrollmentId);
  if (!enrollment) return null;

  const existing = getStudents().find((item) => item.enrollmentId === enrollmentId);
  if (existing) return existing;

  const student: StudentRecord = {
    id: crypto.randomUUID(),
    fullName: enrollment.studentName,
    parentName: enrollment.parentName,
    email: enrollment.emailAddress,
    phone: enrollment.whatsappNumber,
    ageClass: enrollment.ageClass,
    assignedCourse: enrollment.selectedCourse,
    enrollmentId,
    progress: 0,
    status: 'Active',
    createdAt: new Date().toISOString(),
  };

  const students = getStudents();
  localStorage.setItem(STUDENTS_KEY, JSON.stringify([student, ...students]));
  return student;
}

export function getStudents(): StudentRecord[] {
  return safeJsonParse<StudentRecord[]>(localStorage.getItem(STUDENTS_KEY), []);
}

export function updateStudentStatus(id: string, status: StudentRecord['status']): StudentRecord[] {
  const updated = getStudents().map((item) => (item.id === id ? { ...item, status } : item));
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(updated));
  return updated;
}

export function updateStudentProgress(id: string, progress: number): StudentRecord[] {
  const safeProgress = Math.max(0, Math.min(100, progress));
  const updated = getStudents().map((item) => (item.id === id ? { ...item, progress: safeProgress } : item));
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(updated));
  return updated;
}

export function getContacts(): ContactRecord[] {
  return safeJsonParse<ContactRecord[]>(localStorage.getItem(CONTACT_KEY), []);
}

export function saveContact(values: ContactFormValues): ContactRecord {
  const record: ContactRecord = {
    ...values,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const items = getContacts();
  localStorage.setItem(CONTACT_KEY, JSON.stringify([record, ...items]));
  return record;
}

export function getSchoolInquiries(): SchoolInquiryRecord[] {
  return safeJsonParse<SchoolInquiryRecord[]>(localStorage.getItem(SCHOOL_INQUIRIES_KEY), []);
}

export function saveSchoolInquiry(values: SchoolInquiryFormValues): SchoolInquiryRecord {
  const record: SchoolInquiryRecord = {
    ...values,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'New',
  };
  const items = getSchoolInquiries();
  localStorage.setItem(SCHOOL_INQUIRIES_KEY, JSON.stringify([record, ...items]));
  return record;
}

export function updateSchoolInquiryStatus(id: string, status: SchoolInquiryRecord['status']): SchoolInquiryRecord[] {
  const updated = getSchoolInquiries().map((item) => (item.id === id ? { ...item, status } : item));
  localStorage.setItem(SCHOOL_INQUIRIES_KEY, JSON.stringify(updated));
  return updated;
}

export function setAdminSession(session: AdminSession) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(session));
}

export function isAdminAuthenticated(): boolean {
  const parsed = safeJsonParse<{ isAuthed?: boolean }>(localStorage.getItem(ADMIN_KEY), { isAuthed: false });
  return Boolean(parsed.isAuthed);
}

export function getAdminSession(): AdminSession | null {
  const parsed = safeJsonParse<Partial<AdminSession> | null>(localStorage.getItem(ADMIN_KEY), null);
  if (!parsed || !parsed.isAuthed || !parsed.role || !parsed.email || !parsed.name) {
    return null;
  }
  return {
    isAuthed: true,
    name: parsed.name,
    email: parsed.email,
    role: parsed.role,
    authenticatedAt: parsed.authenticatedAt ?? new Date().toISOString(),
  };
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_KEY);
}

// ---- Password reset ----
export async function requestPasswordReset(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const cleanEmail = normalizeEmail(email);
  const account = getAdminAccounts().find((a) => a.email === cleanEmail);
  // Always return ok (even if the account doesn't exist) so this can't be used to
  // probe which emails have accounts.
  if (!account) return { ok: true };

  const token = randomSalt() + randomSalt();
  const tokens = safeJsonParse<PasswordResetToken[]>(localStorage.getItem(RESET_TOKENS_KEY), []);
  const filtered = tokens.filter((t) => t.email !== cleanEmail);
  filtered.push({ email: cleanEmail, token, expiresAt: Date.now() + 30 * 60 * 1000 });
  localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(filtered));

  const { sendMessage } = await import('./notify');
  await sendMessage({
    to: cleanEmail,
    channel: 'Email',
    subject: 'Reset your CodeKidzz admin password',
    body: `Use this code to reset your password (valid 30 minutes): ${token}`,
  });

  return { ok: true };
}

export async function resetPasswordWithToken(
  email: string,
  token: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (newPassword.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
  const cleanEmail = normalizeEmail(email);
  const tokens = safeJsonParse<PasswordResetToken[]>(localStorage.getItem(RESET_TOKENS_KEY), []);
  const match = tokens.find((t) => t.email === cleanEmail && t.token === token.trim());

  if (!match || match.expiresAt < Date.now()) {
    return { ok: false, error: 'That reset code is invalid or has expired.' };
  }

  const result = await changeAdminPassword(cleanEmail, newPassword);
  if (result.ok) {
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens.filter((t) => t.email !== cleanEmail)));
    recordLoginHistory(cleanEmail, 'PasswordReset');
  }
  return result;
}

export async function authenticateAdminAccount(values: {
  email: string;
  password: string;
}): Promise<{ ok: true; session: AdminSession } | { ok: false; error: string }> {
  const lock = getLoginLockStatus();
  if (lock.locked) {
    const minutes = Math.ceil(lock.remainingMs / 60000);
    recordLoginHistory(normalizeEmail(values.email), 'Locked');
    return { ok: false, error: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` };
  }

  const cleanEmail = normalizeEmail(values.email);
  const account = getAdminAccounts().find((a) => a.email === cleanEmail);
  const valid = account ? await verifyPassword(values.password, account.passwordSalt, account.passwordHash) : false;

  if (!account || !valid) {
    recordFailedLogin();
    recordLoginHistory(cleanEmail, 'Failed');
    return { ok: false, error: 'Email or password is incorrect.' };
  }

  clearLoginAttempts();
  const session: AdminSession = {
    isAuthed: true,
    name: account.name,
    email: account.email,
    role: account.role,
    authenticatedAt: new Date().toISOString(),
  };
  setAdminSession(session);
  recordLoginHistory(account.email, 'Success', account.role);
  return { ok: true, session };
}

const defaultAdminCourses: AdminCourseRecord[] = [
  { id: crypto.randomUUID(), title: 'Game Dev with Scratch', level: 'Ages 6-10', duration: '8 weeks', instructor: 'Neha Sharma', capacity: 30, enrolledCount: 18, status: 'Published', updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: 'AI for Kidz', level: 'Ages 9-13', duration: '8 weeks', instructor: 'Rohan Gupta', capacity: 25, enrolledCount: 12, status: 'Published', updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: 'Robotics & Programming', level: 'Ages 10-14', duration: '10 weeks', instructor: 'Sana Verma', capacity: 20, enrolledCount: 9, status: 'Published', updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: 'Adaptive Learning Pathway', level: 'Ages 7-15', duration: 'Ongoing', instructor: 'Imran Qureshi', capacity: 20, enrolledCount: 7, status: 'Draft', updatedAt: new Date().toISOString() },
];

const defaultSchedules: ClassScheduleRecord[] = [
  { id: crypto.randomUUID(), courseId: 'scratch-coding', courseTitle: 'Game Dev with Scratch', batchName: 'Batch A', day: 'Saturday', startTime: '10:00', endTime: '11:00', instructor: 'Neha Sharma', mode: 'Online' },
  { id: crypto.randomUUID(), courseId: 'ai-for-kidz', courseTitle: 'AI for Kidz', batchName: 'Batch B', day: 'Sunday', startTime: '11:30', endTime: '12:30', instructor: 'Rohan Gupta', mode: 'Hybrid' },
];

const defaultResources: ResourceRecord[] = [
  { id: crypto.randomUUID(), title: 'Scratch Sprite Pack Vol.1', type: 'Project Pack', courseTitle: 'Game Dev with Scratch', visibility: 'Students', updatedAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: 'Parent Progress Checklist', type: 'Guide', courseTitle: 'All Courses', visibility: 'Parents', updatedAt: new Date().toISOString() },
];

const defaultNotifications: NotificationRecord[] = [
  { id: crypto.randomUUID(), title: 'New Batch Starts Next Monday', audience: 'Parents', channel: 'Email', status: 'Scheduled', createdAt: new Date().toISOString() },
  { id: crypto.randomUUID(), title: 'Monthly Project Showcase', audience: 'All', channel: 'In-app', status: 'Draft', createdAt: new Date().toISOString() },
];

const defaultSettings: PlatformSettings = {
  allowPublicEnrollment: true,
  requireManualVerification: true,
  sendAutoConfirmation: true,
  maintenanceMode: false,
  supportEmail: 'support@codekidzz.com',
  supportPhone: '+92 300 0000000',
  timezone: 'Asia/Karachi',
  updatedAt: new Date().toISOString(),
};

export function getAdminCourses(): AdminCourseRecord[] {
  const stored = safeJsonParse<AdminCourseRecord[]>(localStorage.getItem(ADMIN_COURSES_KEY), []);
  if (stored.length > 0) return stored;
  localStorage.setItem(ADMIN_COURSES_KEY, JSON.stringify(defaultAdminCourses));
  return defaultAdminCourses;
}

export function updateAdminCourseStatus(id: string, status: AdminCourseRecord['status']): AdminCourseRecord[] {
  const updated = getAdminCourses().map((item) =>
    item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item,
  );
  localStorage.setItem(ADMIN_COURSES_KEY, JSON.stringify(updated));
  return updated;
}

export function getClassSchedules(): ClassScheduleRecord[] {
  const stored = safeJsonParse<ClassScheduleRecord[]>(localStorage.getItem(SCHEDULES_KEY), []);
  if (stored.length > 0) return stored;
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(defaultSchedules));
  return defaultSchedules;
}

export function saveClassSchedule(
  record: Omit<ClassScheduleRecord, 'id'> & { id?: string },
): ClassScheduleRecord[] {
  const schedules = getClassSchedules();
  if (record.id) {
    const updated = schedules.map((item) => (item.id === record.id ? { ...item, ...record } : item));
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(updated));
    return updated;
  }
  const newRecord: ClassScheduleRecord = { ...record, id: crypto.randomUUID() };
  const updated = [newRecord, ...schedules];
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(updated));
  return updated;
}

export function getResources(): ResourceRecord[] {
  const stored = safeJsonParse<ResourceRecord[]>(localStorage.getItem(RESOURCES_KEY), []);
  if (stored.length > 0) return stored;
  localStorage.setItem(RESOURCES_KEY, JSON.stringify(defaultResources));
  return defaultResources;
}

export function getNotifications(): NotificationRecord[] {
  const stored = safeJsonParse<NotificationRecord[]>(localStorage.getItem(NOTIFICATIONS_KEY), []);
  if (stored.length > 0) return stored;
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(defaultNotifications));
  return defaultNotifications;
}

export function updateNotificationStatus(id: string, status: NotificationRecord['status']): NotificationRecord[] {
  const updated = getNotifications().map((item) => (item.id === id ? { ...item, status } : item));
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  return updated;
}

export async function sendNotificationNow(id: string): Promise<NotificationRecord[]> {
  const notification = getNotifications().find((item) => item.id === id);
  if (notification) {
    const { sendMessage } = await import('./notify');
    await sendMessage({
      to: notification.audience,
      channel: notification.channel === 'WhatsApp' ? 'WhatsApp' : 'Email',
      subject: notification.title,
      body: `Notification to ${notification.audience} via ${notification.channel}: ${notification.title}`,
    });
  }
  return updateNotificationStatus(id, 'Sent');
}

export function getPlatformSettings(): PlatformSettings {
  const stored = safeJsonParse<PlatformSettings | null>(localStorage.getItem(SETTINGS_KEY), null);
  if (stored) return stored;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
  return defaultSettings;
}

export function savePlatformSettings(settings: PlatformSettings): PlatformSettings {
  const updated = { ...settings, updatedAt: new Date().toISOString() };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

// ---- CSV export ----
export function toCSV<T extends Record<string, unknown>>(
  records: T[],
  columns: { key: keyof T; label: string }[],
): string {
  const escape = (value: unknown) => {
    const str = value === undefined || value === null ? '' : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const header = columns.map((c) => escape(c.label)).join(',');
  const rows = records.map((record) => columns.map((c) => escape(record[c.key])).join(','));
  return [header, ...rows].join('\n');
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---- Backend connection status (for the Settings tab) ----
export async function checkBackendStatus(): Promise<'connected' | 'not-configured'> {
  try {
    const res = await fetch('/api/auth/me', { method: 'GET' });
    // Any real HTTP response (even 401 Unauthorized) means the /api functions are
    // deployed and a database is reachable behind them.
    return res.status ? 'connected' : 'not-configured';
  } catch {
    return 'not-configured';
  }
}

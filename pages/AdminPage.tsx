import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  addStudentFromEnrollment,
  AdminRole,
  bulkUpdateEnrollmentStatus,
  clearAdminSession,
  authenticateAdminAccount,
  checkBackendStatus,
  deleteAdminAccount,
  downloadCSV,
  getAdminCourses,
  getAdminAccounts,
  getAdminSession,
  getClassSchedules,
  getContacts,
  getEnrollments,
  getLoginHistory,
  getLoginLockStatus,
  getNotifications,
  getPlatformSettings,
  getResources,
  getSchoolInquiries,
  getStudents,
  requestPasswordReset,
  resetPasswordWithToken,
  saveClassSchedule,
  savePlatformSettings,
  createAdminAccount,
  sendNotificationNow,
  toCSV,
  updateAdminCourseStatus,
  updateEnrollmentQuote,
  updateEnrollmentStatus,
  updateEnrollmentVerification,
  updateStudentProgress,
  updateStudentStatus,
} from '../lib/storage';

type EnrollmentStatus = 'New' | 'Contacted' | 'Confirmed';
type VerificationStatus = 'Pending' | 'Approved' | 'Rejected';
type DashboardTab =
  | 'overview'
  | 'enrollments'
  | 'students'
  | 'courses'
  | 'schedule'
  | 'resources'
  | 'notifications'
  | 'analytics'
  | 'audit'
  | 'settings';

const roleTabPermissions: Record<AdminRole, DashboardTab[]> = {
  Admin: ['overview', 'enrollments', 'students', 'courses', 'schedule', 'resources', 'notifications', 'analytics', 'audit', 'settings'],
  Tutor: ['overview', 'students', 'analytics'],
};

const tabIcons: Record<DashboardTab, string> = {
  overview: '\u25A6',
  enrollments: '\u2713',
  students: '\u25A4',
  courses: '\u25A3',
  schedule: '\u25F7',
  resources: '\u25A1',
  notifications: '\u25B2',
  analytics: '\u25C8',
  audit: '\u25C9',
  settings: '\u2699',
};

// ---------------------------------------------------------------------------
// Login / first-run setup / forgot-password
// ---------------------------------------------------------------------------

type LoginMode = 'login' | 'forgot-request' | 'forgot-reset';

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [accounts, setAccounts] = useState(getAdminAccounts());
  const [mode, setMode] = useState<LoginMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [lock, setLock] = useState(getLoginLockStatus());

  const noAccounts = accounts.length === 0;
  const lockMinutes = Math.ceil(lock.remainingMs / 60000);

  const createFirstAdmin = async () => {
    setError('');
    setInfo('');
    const accountName = name.trim() || email.trim().split('@')[0] || 'Admin';
    if (!accountName || !email.trim() || !password.trim()) {
      setError('Name, email, and password are required to create the first Admin.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setBusy(true);
    const res = await createAdminAccount({ name: accountName, email: email.trim().toLowerCase(), password, role: 'Admin' });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setAccounts(getAdminAccounts());
    setInfo('Admin account created. You can sign in now.');
    setPassword('');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setInfo('');

    if (noAccounts) {
      await createFirstAdmin();
      return;
    }

    const currentLock = getLoginLockStatus();
    if (currentLock.locked) {
      setLock(currentLock);
      setError(`Account temporarily locked. Try again in about ${Math.ceil(currentLock.remainingMs / 60000)} minute(s).`);
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required to log in.');
      return;
    }

    setBusy(true);
    const auth = await authenticateAdminAccount({ email, password });
    setBusy(false);

    if (!auth.ok) {
      setError(auth.error);
      setLock(getLoginLockStatus());
      return;
    }

    onLogin();
  };

  const submitForgotRequest = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setInfo('');
    if (!email.trim()) {
      setError('Enter your account email first.');
      return;
    }
    setBusy(true);
    await requestPasswordReset(email.trim().toLowerCase());
    setBusy(false);
    setInfo('If that account exists, a reset code has been sent. Check the Outbox (Settings) if email sending is not yet configured.');
    setMode('forgot-reset');
  };

  const submitForgotReset = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setInfo('');
    if (!resetToken.trim() || newPassword.length < 8) {
      setError('Enter the reset code and a password of at least 8 characters.');
      return;
    }
    setBusy(true);
    const res = await resetPasswordWithToken(email.trim().toLowerCase(), resetToken.trim(), newPassword);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setInfo('Password updated. You can sign in now.');
    setMode('login');
    setPassword('');
    setNewPassword('');
    setResetToken('');
  };

  return (
    <section className="section auth-split admin-login-wrap">
      <div className="auth-visual">
        <img src="/logo.svg" alt="CodeKidzz logo" className="dashboard-logo-large" />
        <div className="welcome-text">
          <span className="role-pill">EMAIL-BASED STAFF ACCESS</span>
          <h2>CodeKidzz Control Center</h2>
          <p>Sign in directly with your email and password. Admin and Tutor accounts use the same login flow.</p>
        </div>
      </div>

      {mode === 'login' && (
        <form className="form-card" onSubmit={submit}>
          <span className="eyebrow">STAFF LOGIN</span>
          <h1 className="sign-heading">{noAccounts ? 'Create your Admin account' : 'Secure email sign-in'}</h1>
          {noAccounts && (
            <label>
              Full name
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </label>
          )}
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </label>

          {error && <p className="field-error">{error}</p>}
          {info && <p className="note">{info}</p>}
          {lock.locked && !noAccounts && (
            <p className="note">Too many failed attempts. Locked for about {lockMinutes} minute(s).</p>
          )}

          <button
            className="primary-btn"
            type={noAccounts ? 'button' : 'submit'}
            disabled={lock.locked || busy}
            onClick={noAccounts ? createFirstAdmin : undefined}
          >
            {busy ? 'Please wait…' : noAccounts ? 'Create Admin Account' : 'Login'}
          </button>

          {!noAccounts && (
            <button type="button" className="link-btn" onClick={() => { setMode('forgot-request'); setError(''); setInfo(''); }}>
              Forgot password?
            </button>
          )}
        </form>
      )}

      {mode === 'forgot-request' && (
        <form className="form-card" onSubmit={submitForgotRequest}>
          <span className="eyebrow">RESET PASSWORD</span>
          <h1 className="sign-heading">Request a reset code</h1>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your account email" />
          </label>
          {error && <p className="field-error">{error}</p>}
          {info && <p className="note">{info}</p>}
          <button className="primary-btn" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send Reset Code'}</button>
          <button type="button" className="link-btn" onClick={() => setMode('login')}>Back to login</button>
        </form>
      )}

      {mode === 'forgot-reset' && (
        <form className="form-card" onSubmit={submitForgotReset}>
          <span className="eyebrow">RESET PASSWORD</span>
          <h1 className="sign-heading">Enter your reset code</h1>
          <label>
            Reset code
            <input value={resetToken} onChange={(e) => setResetToken(e.target.value)} placeholder="Paste the code" />
          </label>
          <label>
            New password
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" />
          </label>
          {error && <p className="field-error">{error}</p>}
          {info && <p className="note">{info}</p>}
          <button className="primary-btn" type="submit" disabled={busy}>{busy ? 'Please wait…' : 'Set New Password'}</button>
          <button type="button" className="link-btn" onClick={() => setMode('login')}>Back to login</button>
        </form>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard
// ---------------------------------------------------------------------------

function AdminPage({ isAuthed, onLogout }: { isAuthed: boolean; onLogout: () => void }) {
  const [session, setSession] = useState(getAdminSession());
  const [ready, setReady] = useState(Boolean(isAuthed && getAdminSession()));
  const [tab, setTab] = useState<DashboardTab>('overview');
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [systemMessage, setSystemMessage] = useState('');
  const [verificationNote, setVerificationNote] = useState('');
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<string[]>([]);
  const [quoteDraft, setQuoteDraft] = useState<{ amount: string; status: NonNullable<import('../lib/storage').EnrollmentRecord['quoteStatus']> }>({ amount: '', status: 'Not Sent' });
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'not-configured'>('checking');

  const [scheduleForm, setScheduleForm] = useState({
    courseTitle: 'Game Dev with Scratch',
    batchName: '',
    day: 'Saturday',
    startTime: '10:00',
    endTime: '11:00',
    instructor: 'Neha Sharma',
    mode: 'Online' as 'Online' | 'Hybrid',
  });

  const [settingsDraft, setSettingsDraft] = useState(getPlatformSettings());
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Tutor' as AdminRole,
  });

  const enrollments = useMemo(() => getEnrollments(), [refreshFlag]);
  const contacts = useMemo(() => getContacts(), [refreshFlag]);
  const schoolInquiries = useMemo(() => getSchoolInquiries(), [refreshFlag]);
  const students = useMemo(() => getStudents(), [refreshFlag]);
  const adminCourses = useMemo(() => getAdminCourses(), [refreshFlag]);
  const schedules = useMemo(() => getClassSchedules(), [refreshFlag]);
  const resources = useMemo(() => getResources(), [refreshFlag]);
  const notifications = useMemo(() => getNotifications(), [refreshFlag]);
  const adminAccounts = useMemo(() => getAdminAccounts(), [refreshFlag]);
  const loginHistory = useMemo(() => getLoginHistory(), [refreshFlag]);

  const selectedEnrollment =
    enrollments.find((item) => item.id === selectedEnrollmentId) ?? enrollments[0] ?? null;
  const selectedStudent = students.find((item) => item.id === selectedStudentId) ?? students[0] ?? null;

  useEffect(() => {
    if (selectedEnrollment) {
      setQuoteDraft({
        amount: selectedEnrollment.quoteAmount !== undefined ? String(selectedEnrollment.quoteAmount) : '',
        status: selectedEnrollment.quoteStatus ?? 'Not Sent',
      });
    }
  }, [selectedEnrollment?.id]);

  useEffect(() => {
    checkBackendStatus().then(setBackendStatus);
  }, []);

  const verificationCounts = useMemo(() => {
    const pending = enrollments.filter((item) => item.verificationStatus !== 'Approved').length;
    const approved = enrollments.filter((item) => item.verificationStatus === 'Approved').length;
    return { pending, approved };
  }, [enrollments]);

  const analytics = useMemo(() => {
    const totalLeads = enrollments.length;
    const confirmed = enrollments.filter((item) => item.status === 'Confirmed').length;
    const conversionRate = totalLeads > 0 ? Math.round((confirmed / totalLeads) * 100) : 0;
    const avgProgress =
      students.length > 0
        ? Math.round(students.reduce((total, student) => total + student.progress, 0) / students.length)
        : 0;
    const activeStudents = students.filter((item) => item.status === 'Active').length;
    return { totalLeads, confirmed, conversionRate, avgProgress, activeStudents };
  }, [enrollments, students]);

  const dashboardStats = [
    { label: 'Enrollments', value: enrollments.length },
    { label: 'Pending Verification', value: verificationCounts.pending },
    { label: 'School Inquiries', value: schoolInquiries.length },
    { label: 'Students', value: students.length },
    { label: 'Courses', value: adminCourses.length },
    { label: 'Schedules', value: schedules.length },
  ];

  const triggerRefresh = () => setRefreshFlag((value) => value + 1);

  const setMessage = (message: string) => {
    setSystemMessage(message);
    window.setTimeout(() => setSystemMessage(''), 2200);
  };

  const handleEnrollmentStatus = (status: EnrollmentStatus) => {
    if (!selectedEnrollment) return;
    updateEnrollmentStatus(selectedEnrollment.id, status);
    setMessage(`Enrollment for ${selectedEnrollment.studentName} updated to ${status}.`);
    triggerRefresh();
  };

  const handleVerification = (verificationStatus: VerificationStatus) => {
    if (!selectedEnrollment) return;
    updateEnrollmentVerification(selectedEnrollment.id, verificationStatus, verificationNote);
    setMessage(`Verification set to ${verificationStatus}.`);
    triggerRefresh();
  };

  const handleCreateStudent = () => {
    if (!selectedEnrollment) return;
    const student = addStudentFromEnrollment(selectedEnrollment.id);
    if (!student) {
      setMessage('No enrollment selected to onboard.');
      return;
    }
    setSelectedStudentId(student.id);
    setMessage(`Student profile created for ${student.fullName}.`);
    triggerRefresh();
  };

  const handleStudentStatus = (status: 'Active' | 'Paused' | 'Completed') => {
    if (!selectedStudent) return;
    updateStudentStatus(selectedStudent.id, status);
    setMessage(`${selectedStudent.fullName} marked as ${status}.`);
    triggerRefresh();
  };

  const handleStudentProgress = (delta: number) => {
    if (!selectedStudent) return;
    updateStudentProgress(selectedStudent.id, selectedStudent.progress + delta);
    triggerRefresh();
  };

  const handleCourseStatus = (id: string, status: 'Published' | 'Draft' | 'Archived') => {
    updateAdminCourseStatus(id, status);
    setMessage(`Course updated to ${status}.`);
    triggerRefresh();
  };

  const submitSchedule = (event: FormEvent) => {
    event.preventDefault();
    if (!scheduleForm.batchName.trim()) {
      setMessage('Batch name is required.');
      return;
    }

    saveClassSchedule({
      courseId: `course-${scheduleForm.courseTitle.toLowerCase().replace(/\s+/g, '-')}`,
      courseTitle: scheduleForm.courseTitle,
      batchName: scheduleForm.batchName,
      day: scheduleForm.day,
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      instructor: scheduleForm.instructor,
      mode: scheduleForm.mode,
    });

    setScheduleForm((state) => ({ ...state, batchName: '' }));
    setMessage('Class schedule saved.');
    triggerRefresh();
  };

  const handleNotificationSend = async (id: string) => {
    await sendNotificationNow(id);
    setMessage('Notification sent (see Outbox in Settings for delivery log).');
    triggerRefresh();
  };

  const saveSettings = () => {
    const saved = savePlatformSettings(settingsDraft);
    setSettingsDraft(saved);
    setMessage('Platform settings updated.');
  };

  const createStaffAccount = async (event: FormEvent) => {
    event.preventDefault();
    if (!session || session.role !== 'Admin') return;
    if (!staffForm.name.trim() || !staffForm.email.trim() || !staffForm.password.trim()) {
      setMessage('Name, email, and password are required.');
      return;
    }

    const result = await createAdminAccount({
      name: staffForm.name.trim(),
      email: staffForm.email.trim().toLowerCase(),
      password: staffForm.password,
      role: staffForm.role,
    });

    if (!result.ok) {
      setMessage(result.error);
      return;
    }

    setStaffForm({ name: '', email: '', password: '', role: 'Tutor' });
    setMessage(`${staffForm.role} account created.`);
    triggerRefresh();
  };

  const removeStaffAccount = (email: string) => {
    if (!session || session.role !== 'Admin') return;
    if (email === session.email) {
      setMessage('You cannot delete the account you are currently using.');
      return;
    }
    const result = deleteAdminAccount(email);
    setMessage(result.ok ? 'Staff account deleted.' : result.error);
    triggerRefresh();
  };

  const toggleEnrollmentSelection = (id: string) => {
    setSelectedEnrollmentIds((state) => (state.includes(id) ? state.filter((item) => item !== id) : [...state, id]));
  };

  const toggleSelectAllEnrollments = () => {
    setSelectedEnrollmentIds((state) => (state.length === enrollments.length ? [] : enrollments.map((item) => item.id)));
  };

  const handleBulkEnrollmentStatus = (status: EnrollmentStatus) => {
    if (selectedEnrollmentIds.length === 0) return;
    bulkUpdateEnrollmentStatus(selectedEnrollmentIds, status);
    setMessage(`${selectedEnrollmentIds.length} enrollment(s) updated to ${status}.`);
    setSelectedEnrollmentIds([]);
    triggerRefresh();
  };

  const exportEnrollmentsCSV = () => {
    const csv = toCSV(enrollments, [
      { key: 'studentName', label: 'Student' },
      { key: 'parentName', label: 'Parent' },
      { key: 'selectedCourse', label: 'Course' },
      { key: 'whatsappNumber', label: 'WhatsApp' },
      { key: 'emailAddress', label: 'Email' },
      { key: 'status', label: 'Status' },
      { key: 'verificationStatus', label: 'Verification' },
      { key: 'quoteAmount', label: 'Quote Amount' },
      { key: 'quoteStatus', label: 'Quote Status' },
      { key: 'createdAt', label: 'Submitted' },
    ]);
    downloadCSV(`enrollments-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const exportStudentsCSV = () => {
    const csv = toCSV(students, [
      { key: 'fullName', label: 'Student' },
      { key: 'parentName', label: 'Parent' },
      { key: 'assignedCourse', label: 'Course' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'progress', label: 'Progress %' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Enrolled' },
    ]);
    downloadCSV(`students-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const saveQuote = () => {
    if (!selectedEnrollment) return;
    const amount = quoteDraft.amount.trim() ? Number(quoteDraft.amount) : undefined;
    updateEnrollmentQuote(selectedEnrollment.id, amount, quoteDraft.status);
    setMessage('Quote updated.');
    triggerRefresh();
  };

  useEffect(() => {
    if (ready && !session) {
      setReady(false);
    }
  }, [ready, session]);

  const allTabs: { key: DashboardTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'enrollments', label: 'Enrollments' },
    { key: 'students', label: 'Students' },
    { key: 'courses', label: 'Courses' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'resources', label: 'Resources' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'audit', label: 'Audit Log' },
    { key: 'settings', label: 'Settings' },
  ];

  const allowedTabs: DashboardTab[] = session ? roleTabPermissions[session.role] : ['overview'];

  useEffect(() => {
    if (!allowedTabs.includes(tab)) {
      setTab('overview');
    }
  }, [allowedTabs, tab]);

  const visibleTabs = allTabs.filter((item) => allowedTabs.includes(item.key));
  const activeTabLabel = allTabs.find((item) => item.key === tab)?.label ?? 'Overview';

  if (!ready || !session) {
    return (
      <AdminLogin
        onLogin={() => {
          setSession(getAdminSession());
          setReady(true);
        }}
      />
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <img src="/logo.svg" alt="CodeKidzz logo" />
          <span>CodeKidzz</span>
        </div>
        <nav className="admin-sidebar-nav">
          {visibleTabs.map((item) => (
            <button
              key={item.key}
              className={`admin-nav-item ${tab === item.key ? 'active' : ''}`}
              type="button"
              onClick={() => setTab(item.key)}
            >
              <span className="admin-nav-icon" aria-hidden="true">{tabIcons[item.key]}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user-chip">
            <span className="admin-user-avatar">{session.name.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{session.name}</strong>
              <span>{session.role}</span>
            </div>
          </div>
          <button
            className="ghost-btn small"
            onClick={() => {
              clearAdminSession();
              onLogout();
              setSession(null);
              setReady(false);
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-breadcrumb">Admin / {activeTabLabel}</span>
            <h1>{activeTabLabel}</h1>
          </div>
          {systemMessage && <div className="admin-toast">{systemMessage}</div>}
        </header>

        <div className="admin-content">
          {tab === 'overview' && (
            <section className="admin-grid enterprise-grid">
              <article className="dashboard-card wide">
                <h2>Snapshot</h2>
                <div className="stats-grid dashboard-stats enterprise-stats" style={{ marginTop: 8 }}>
                  {dashboardStats.map((metric) => (
                    <article className="stat-card" key={metric.label}>
                      <strong>{metric.value}</strong>
                      <span>{metric.label}</span>
                    </article>
                  ))}
                </div>
              </article>
              <article className="dashboard-card">
                <h2>Access Scope</h2>
                <p><strong>Role:</strong> {session.role}</p>
                <p>Allowed modules: {visibleTabs.map((item) => item.label).join(', ')}</p>
              </article>
              <article className="dashboard-card">
                <h2>Operational Snapshot</h2>
                <ul>
                  <li>Total leads: {analytics.totalLeads}</li>
                  <li>Confirmed enrollments: {analytics.confirmed}</li>
                  <li>Active students: {analytics.activeStudents}</li>
                  <li>Avg progress: {analytics.avgProgress}%</li>
                </ul>
              </article>
              <article className="dashboard-card wide">
                <h2>Recent Contacts</h2>
                <div className="message-list">
                  {contacts.length === 0 && <p className="note">No messages yet.</p>}
                  {contacts.slice(0, 4).map((message) => (
                    <div key={message.id} className="message-card">
                      <strong>{message.name}</strong>
                      <p>{message.message}</p>
                      <span>{message.email}</span>
                    </div>
                  ))}
                </div>
              </article>
              <article className="dashboard-card wide">
                <h2>School Inquiries</h2>
                <div className="message-list">
                  {schoolInquiries.length === 0 && <p className="note">No school inquiries yet.</p>}
                  {schoolInquiries.slice(0, 4).map((inquiry) => (
                    <div key={inquiry.id} className="message-card">
                      <strong>{inquiry.schoolName}</strong>
                      <p>{inquiry.contactName} ({inquiry.role}) • {inquiry.studentCount} students • Interested in: {inquiry.programInterest}</p>
                      <span>{inquiry.email} • {inquiry.phone} • {inquiry.status}</span>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          )}

          {tab === 'enrollments' && (
            <section className="admin-grid enterprise-grid">
              <article className="dashboard-card">
                <div className="admin-card-header">
                  <h2>Applications</h2>
                  <button className="ghost-btn small" type="button" onClick={exportEnrollmentsCSV}>Export CSV</button>
                </div>

                {enrollments.length > 0 && (
                  <label className="switch-line" style={{ marginBottom: 8 }}>
                    <input
                      type="checkbox"
                      checked={selectedEnrollmentIds.length === enrollments.length}
                      onChange={toggleSelectAllEnrollments}
                    />
                    <span>Select all ({selectedEnrollmentIds.length}/{enrollments.length})</span>
                  </label>
                )}

                {selectedEnrollmentIds.length > 0 && (
                  <div className="review-actions" style={{ marginBottom: 10 }}>
                    <button className="ghost-btn small" type="button" onClick={() => handleBulkEnrollmentStatus('Contacted')}>Mark Contacted</button>
                    <button className="primary-btn small" type="button" onClick={() => handleBulkEnrollmentStatus('Confirmed')}>Confirm Selected</button>
                  </div>
                )}

                <div className="enrollment-review-list">
                  {enrollments.map((entry) => (
                    <div key={entry.id} className="review-item-row">
                      <input
                        type="checkbox"
                        checked={selectedEnrollmentIds.includes(entry.id)}
                        onChange={() => toggleEnrollmentSelection(entry.id)}
                      />
                      <button
                        type="button"
                        className={`review-item ${selectedEnrollment?.id === entry.id ? 'active' : ''}`}
                        onClick={() => setSelectedEnrollmentId(entry.id)}
                      >
                        <strong>{entry.studentName}</strong>
                        <span>{entry.selectedCourse}</span>
                        <em>{entry.verificationStatus ?? 'Pending'}</em>
                      </button>
                    </div>
                  ))}
                </div>
              </article>
              <article className="dashboard-card wide">
                <h2>Verification Workbench</h2>
                {selectedEnrollment ? (
                  <div className="review-panel">
                    <p><strong>Student:</strong> {selectedEnrollment.studentName}</p>
                    <p><strong>Parent:</strong> {selectedEnrollment.parentName}</p>
                    <p><strong>Course:</strong> {selectedEnrollment.selectedCourse}</p>
                    <p><strong>Contact:</strong> {selectedEnrollment.whatsappNumber}</p>
                    <p><strong>Email:</strong> {selectedEnrollment.emailAddress}</p>
                    <p><strong>Status:</strong> {selectedEnrollment.status}</p>
                    <p><strong>Verification:</strong> {selectedEnrollment.verificationStatus ?? 'Pending'}</p>

                    <label>
                      Verification notes
                      <textarea
                        value={verificationNote}
                        onChange={(e) => setVerificationNote(e.target.value)}
                        placeholder="Add verification notes for audit trail"
                        rows={3}
                      />
                    </label>

                    <div className="review-actions">
                      <button className="ghost-btn" type="button" onClick={() => handleEnrollmentStatus('New')}>Mark New</button>
                      <button className="ghost-btn" type="button" onClick={() => handleEnrollmentStatus('Contacted')}>Mark Contacted</button>
                      <button className="primary-btn" type="button" onClick={() => handleEnrollmentStatus('Confirmed')}>Confirm</button>
                    </div>

                    <div className="review-actions">
                      <button className="ghost-btn" type="button" onClick={() => handleVerification('Pending')}>Set Pending</button>
                      <button className="primary-btn" type="button" onClick={() => handleVerification('Approved')}>Approve</button>
                      <button className="ghost-btn" type="button" onClick={() => handleVerification('Rejected')}>Reject</button>
                    </div>

                    <button className="secondary-btn" type="button" onClick={handleCreateStudent}>Create Student Profile</button>

                    <div className="quote-box">
                      <h3>Quote</h3>
                      <div className="split-layout">
                        <label>
                          Amount ($)
                          <input
                            type="number"
                            value={quoteDraft.amount}
                            onChange={(e) => setQuoteDraft((state) => ({ ...state, amount: e.target.value }))}
                            placeholder="e.g. 250"
                          />
                        </label>
                        <label>
                          Status
                          <select
                            value={quoteDraft.status}
                            onChange={(e) => setQuoteDraft((state) => ({ ...state, status: e.target.value as typeof state.status }))}
                          >
                            <option value="Not Sent">Not Sent</option>
                            <option value="Sent">Sent</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Declined">Declined</option>
                          </select>
                        </label>
                      </div>
                      <button className="secondary-btn small" type="button" onClick={saveQuote}>Save Quote</button>
                    </div>
                  </div>
                ) : (
                  <p className="note">No enrollment applications available.</p>
                )}
              </article>
            </section>
          )}

          {tab === 'students' && (
            <section className="admin-grid enterprise-grid">
              <article className="dashboard-card">
                <div className="admin-card-header">
                  <h2>Student Registry</h2>
                  <button className="ghost-btn small" type="button" onClick={exportStudentsCSV}>Export CSV</button>
                </div>
                <div className="enrollment-review-list">
                  {students.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      className={`review-item ${selectedStudent?.id === student.id ? 'active' : ''}`}
                      onClick={() => setSelectedStudentId(student.id)}
                    >
                      <strong>{student.fullName}</strong>
                      <span>{student.assignedCourse}</span>
                      <em>{student.status}</em>
                    </button>
                  ))}
                </div>
              </article>
              <article className="dashboard-card wide">
                <h2>Student Management Console</h2>
                {selectedStudent ? (
                  <div className="review-panel">
                    <p><strong>Name:</strong> {selectedStudent.fullName}</p>
                    <p><strong>Parent:</strong> {selectedStudent.parentName}</p>
                    <p><strong>Course:</strong> {selectedStudent.assignedCourse}</p>
                    <p><strong>Email:</strong> {selectedStudent.email}</p>
                    <p><strong>Phone:</strong> {selectedStudent.phone}</p>
                    <p><strong>Progress:</strong> {selectedStudent.progress}%</p>

                    <div className="review-actions">
                      <button className="ghost-btn" type="button" onClick={() => handleStudentProgress(-10)}>-10%</button>
                      <button className="ghost-btn" type="button" onClick={() => handleStudentProgress(10)}>+10%</button>
                      <button className="primary-btn" type="button" onClick={() => handleStudentProgress(25)}>+25%</button>
                    </div>

                    <div className="review-actions">
                      <button className="ghost-btn" type="button" onClick={() => handleStudentStatus('Active')}>Set Active</button>
                      <button className="ghost-btn" type="button" onClick={() => handleStudentStatus('Paused')}>Set Paused</button>
                      <button className="primary-btn" type="button" onClick={() => handleStudentStatus('Completed')}>Mark Completed</button>
                    </div>
                  </div>
                ) : (
                  <p className="note">No students found. Approve enrollments and create profiles.</p>
                )}
              </article>
            </section>
          )}

          {tab === 'courses' && (
            <section className="admin-grid enterprise-grid">
              {adminCourses.map((course) => (
                <article className="dashboard-card" key={course.id}>
                  <h2>{course.title}</h2>
                  <p><strong>Level:</strong> {course.level}</p>
                  <p><strong>Duration:</strong> {course.duration}</p>
                  <p><strong>Instructor:</strong> {course.instructor}</p>
                  <p><strong>Capacity:</strong> {course.enrolledCount} / {course.capacity}</p>
                  <p><strong>Status:</strong> {course.status}</p>
                  <div className="review-actions">
                    <button className="ghost-btn" type="button" onClick={() => handleCourseStatus(course.id, 'Draft')}>Draft</button>
                    <button className="primary-btn" type="button" onClick={() => handleCourseStatus(course.id, 'Published')}>Publish</button>
                    <button className="ghost-btn" type="button" onClick={() => handleCourseStatus(course.id, 'Archived')}>Archive</button>
                  </div>
                </article>
              ))}
            </section>
          )}

          {tab === 'schedule' && (
            <section className="admin-grid enterprise-grid">
              <article className="dashboard-card">
                <h2>Create / Update Class Schedule</h2>
                <form className="form-stack" onSubmit={submitSchedule}>
                  <label>
                    Course
                    <input
                      value={scheduleForm.courseTitle}
                      onChange={(e) => setScheduleForm((state) => ({ ...state, courseTitle: e.target.value }))}
                    />
                  </label>
                  <label>
                    Batch name
                    <input
                      value={scheduleForm.batchName}
                      onChange={(e) => setScheduleForm((state) => ({ ...state, batchName: e.target.value }))}
                      placeholder="Batch C"
                    />
                  </label>
                  <div className="split-layout">
                    <label>
                      Day
                      <input
                        value={scheduleForm.day}
                        onChange={(e) => setScheduleForm((state) => ({ ...state, day: e.target.value }))}
                      />
                    </label>
                    <label>
                      Instructor
                      <input
                        value={scheduleForm.instructor}
                        onChange={(e) => setScheduleForm((state) => ({ ...state, instructor: e.target.value }))}
                      />
                    </label>
                  </div>
                  <div className="split-layout">
                    <label>
                      Start time
                      <input
                        type="time"
                        value={scheduleForm.startTime}
                        onChange={(e) => setScheduleForm((state) => ({ ...state, startTime: e.target.value }))}
                      />
                    </label>
                    <label>
                      End time
                      <input
                        type="time"
                        value={scheduleForm.endTime}
                        onChange={(e) => setScheduleForm((state) => ({ ...state, endTime: e.target.value }))}
                      />
                    </label>
                  </div>
                  <label>
                    Mode
                    <select
                      value={scheduleForm.mode}
                      onChange={(e) =>
                        setScheduleForm((state) => ({ ...state, mode: e.target.value as 'Online' | 'Hybrid' }))
                      }
                    >
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </label>
                  <button className="primary-btn" type="submit">Save Schedule</button>
                </form>
              </article>
              <article className="dashboard-card wide">
                <h2>Class Timetable</h2>
                <div className="message-list">
                  {schedules.map((item) => (
                    <div className="message-card" key={item.id}>
                      <strong>{item.courseTitle} — {item.batchName}</strong>
                      <p>{item.day}, {item.startTime} - {item.endTime}</p>
                      <span>{item.instructor} • {item.mode}</span>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          )}

          {tab === 'resources' && (
            <section className="admin-grid enterprise-grid">
              {resources.map((item) => (
                <article className="dashboard-card" key={item.id}>
                  <h2>{item.title}</h2>
                  <p><strong>Type:</strong> {item.type}</p>
                  <p><strong>Course:</strong> {item.courseTitle}</p>
                  <p><strong>Visibility:</strong> {item.visibility}</p>
                  <p className="note">Last updated: {new Date(item.updatedAt).toLocaleString()}</p>
                </article>
              ))}
            </section>
          )}

          {tab === 'notifications' && (
            <section className="admin-grid enterprise-grid">
              {notifications.map((item) => (
                <article className="dashboard-card" key={item.id}>
                  <h2>{item.title}</h2>
                  <p><strong>Audience:</strong> {item.audience}</p>
                  <p><strong>Channel:</strong> {item.channel}</p>
                  <p><strong>Status:</strong> {item.status}</p>
                  <div className="review-actions">
                    <button className="primary-btn" type="button" onClick={() => handleNotificationSend(item.id)}>Send Now</button>
                  </div>
                </article>
              ))}
            </section>
          )}

          {tab === 'analytics' && (
            <section className="admin-grid enterprise-grid">
              <article className="dashboard-card">
                <h2>Enrollment Funnel</h2>
                <ul>
                  <li>Total leads: {analytics.totalLeads}</li>
                  <li>Confirmed: {analytics.confirmed}</li>
                  <li>Conversion rate: {analytics.conversionRate}%</li>
                </ul>
              </article>
              <article className="dashboard-card">
                <h2>Learner Progress</h2>
                <ul>
                  <li>Average progress: {analytics.avgProgress}%</li>
                  <li>Active learners: {analytics.activeStudents}</li>
                  <li>Completed learners: {students.filter((item) => item.status === 'Completed').length}</li>
                </ul>
              </article>
              <article className="dashboard-card wide">
                <h2>Operational Alerts</h2>
                <ul>
                  <li>{verificationCounts.pending} enrollment(s) pending verification</li>
                  <li>{notifications.filter((item) => item.status === 'Draft').length} draft notification(s) pending review</li>
                  <li>{adminCourses.filter((item) => item.status === 'Draft').length} draft course(s) not published</li>
                </ul>
              </article>
              <article className="dashboard-card wide note-card">
                <h2>Visitor Analytics</h2>
                <p className="note">
                  This tracks your own enrollment/student data. For real website traffic (visitors, sources, bounce rate),
                  add Plausible or GA4 — see <code>lib/analytics.ts</code> for the ready-made integration point.
                </p>
              </article>
            </section>
          )}

          {tab === 'audit' && (
            <section className="admin-grid enterprise-grid">
              <article className="dashboard-card wide">
                <div className="admin-card-header">
                  <h2>Login Activity</h2>
                </div>
                <p className="note">Every login attempt (success, failure, lockout, account change) against this browser's admin accounts.</p>
                <div className="audit-table">
                  <div className="audit-row audit-head">
                    <span>When</span>
                    <span>Email</span>
                    <span>Result</span>
                    <span>Role</span>
                  </div>
                  {loginHistory.length === 0 && <p className="note">No activity recorded yet.</p>}
                  {loginHistory.slice(0, 100).map((entry) => (
                    <div className="audit-row" key={entry.id}>
                      <span>{new Date(entry.createdAt).toLocaleString()}</span>
                      <span>{entry.email}</span>
                      <span className={`audit-result audit-${entry.result.toLowerCase()}`}>{entry.result}</span>
                      <span>{entry.role ?? '—'}</span>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          )}

          {tab === 'settings' && (
            <section className="admin-grid enterprise-grid">
              <article className="dashboard-card wide">
                <h2>Backend Connection</h2>
                <p>
                  <span className={`status-dot ${backendStatus === 'connected' ? 'status-live' : 'status-off'}`} />
                  {backendStatus === 'checking' && 'Checking…'}
                  {backendStatus === 'connected' && 'Connected — running on the Postgres-backed API in /api.'}
                  {backendStatus === 'not-configured' && 'Not connected — running on this browser\'s local storage. See README for how to connect a real database.'}
                </p>
              </article>

              {session.role === 'Admin' && (
                <article className="dashboard-card wide">
                  <h2>Staff Accounts</h2>
                  <form className="form-stack" onSubmit={createStaffAccount}>
                    <div className="split-layout">
                      <label>
                        Full name
                        <input
                          value={staffForm.name}
                          onChange={(e) => setStaffForm((state) => ({ ...state, name: e.target.value }))}
                          placeholder="Staff name"
                        />
                      </label>
                      <label>
                        Role
                        <select
                          value={staffForm.role}
                          onChange={(e) => setStaffForm((state) => ({ ...state, role: e.target.value as AdminRole }))}
                        >
                          <option value="Tutor">Tutor</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </label>
                    </div>
                    <div className="split-layout">
                      <label>
                        Email
                        <input
                          type="email"
                          value={staffForm.email}
                          onChange={(e) => setStaffForm((state) => ({ ...state, email: e.target.value }))}
                          placeholder="name@example.com"
                        />
                      </label>
                      <label>
                        Temporary password
                        <input
                          type="password"
                          value={staffForm.password}
                          onChange={(e) => setStaffForm((state) => ({ ...state, password: e.target.value }))}
                          placeholder="At least 8 characters"
                        />
                      </label>
                    </div>
                    <button className="primary-btn" type="submit">Create Staff Account</button>
                  </form>

                  <div className="staff-list">
                    {adminAccounts.map((account) => (
                      <div className="staff-row" key={account.email}>
                        <div>
                          <strong>{account.name}</strong>
                          <span>{account.email}</span>
                        </div>
                        <em>{account.role}</em>
                        <button
                          className="ghost-btn"
                          type="button"
                          disabled={account.email === session.email}
                          onClick={() => removeStaffAccount(account.email)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              <article className="dashboard-card wide">
                <h2>Platform Configuration</h2>
                <div className="form-stack">
                  <label className="switch-line">
                    <input
                      type="checkbox"
                      checked={settingsDraft.allowPublicEnrollment}
                      onChange={(e) =>
                        setSettingsDraft((state) => ({ ...state, allowPublicEnrollment: e.target.checked }))
                      }
                    />
                    <span>Allow public enrollment</span>
                  </label>
                  <label className="switch-line">
                    <input
                      type="checkbox"
                      checked={settingsDraft.requireManualVerification}
                      onChange={(e) =>
                        setSettingsDraft((state) => ({ ...state, requireManualVerification: e.target.checked }))
                      }
                    />
                    <span>Require manual verification</span>
                  </label>
                  <label className="switch-line">
                    <input
                      type="checkbox"
                      checked={settingsDraft.sendAutoConfirmation}
                      onChange={(e) =>
                        setSettingsDraft((state) => ({ ...state, sendAutoConfirmation: e.target.checked }))
                      }
                    />
                    <span>Send automated confirmations</span>
                  </label>
                  <label className="switch-line">
                    <input
                      type="checkbox"
                      checked={settingsDraft.maintenanceMode}
                      onChange={(e) =>
                        setSettingsDraft((state) => ({ ...state, maintenanceMode: e.target.checked }))
                      }
                    />
                    <span>Maintenance mode</span>
                  </label>

                  <label>
                    Support email
                    <input
                      value={settingsDraft.supportEmail}
                      onChange={(e) => setSettingsDraft((state) => ({ ...state, supportEmail: e.target.value }))}
                    />
                  </label>
                  <label>
                    Support phone
                    <input
                      value={settingsDraft.supportPhone}
                      onChange={(e) => setSettingsDraft((state) => ({ ...state, supportPhone: e.target.value }))}
                    />
                  </label>
                  <label>
                    Timezone
                    <input
                      value={settingsDraft.timezone}
                      onChange={(e) => setSettingsDraft((state) => ({ ...state, timezone: e.target.value }))}
                    />
                  </label>
                  <button className="primary-btn" type="button" onClick={saveSettings}>Save Configuration</button>
                </div>
              </article>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;

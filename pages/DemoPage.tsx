import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { CONTACT, pillars } from '../data';
import { saveSchoolInquiry, type SchoolInquiryFormValues } from '../lib/storage';

const emptySchoolForm: SchoolInquiryFormValues = {
  schoolName: '',
  contactName: '',
  role: '',
  email: '',
  phone: '',
  studentCount: '',
  programInterest: pillars[0].label,
  message: '',
};

function DemoPage() {
  const [schoolForm, setSchoolForm] = useState<SchoolInquiryFormValues>(emptySchoolForm);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const updateSchoolForm = (field: keyof SchoolInquiryFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setSchoolForm((state) => ({ ...state, [field]: e.target.value }));

  const submitSchoolForm = (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!schoolForm.schoolName.trim() || !schoolForm.contactName.trim() || !schoolForm.email.trim()) {
      setFormError('School name, your name, and email are required.');
      return;
    }
    saveSchoolInquiry(schoolForm);
    setSubmitted(true);
    setSchoolForm(emptySchoolForm);
  };

  return (
    <div className="page">
      <section className="section auth-split school-form-wrap">
        <div className="auth-visual">
          <div className="welcome-text">
            <span className="role-pill">PARTNER WITH US</span>
            <h2>Request a Demo</h2>
            <p>Tell us about your school and we'll schedule a walkthrough.</p>
            <p className="note">Or reach us directly at {CONTACT.email} / {CONTACT.phone}.</p>
          </div>
        </div>

        {submitted ? (
          <div className="form-card">
            <span className="eyebrow">Thank you</span>
            <h1 className="sign-heading">Request received</h1>
            <p>We'll reach out to your team shortly.</p>
            <Link className="primary-btn" to="/services">Browse Services</Link>
          </div>
        ) : (
          <form className="form-card" onSubmit={submitSchoolForm}>
            <span className="eyebrow">SCHOOL DETAILS</span>
            <h1 className="sign-heading">Tell us about your school</h1>

            <label>
              School name
              <input value={schoolForm.schoolName} onChange={updateSchoolForm('schoolName')} placeholder="Greenwood Academy" />
            </label>
            <label>
              Your name
              <input value={schoolForm.contactName} onChange={updateSchoolForm('contactName')} placeholder="Your full name" />
            </label>
            <label>
              Your role
              <input value={schoolForm.role} onChange={updateSchoolForm('role')} placeholder="STEM Coordinator, Principal, etc." />
            </label>
            <label>
              Email
              <input type="email" value={schoolForm.email} onChange={updateSchoolForm('email')} placeholder="you@school.edu" />
            </label>
            <label>
              Phone
              <input value={schoolForm.phone} onChange={updateSchoolForm('phone')} placeholder="+92 300 0000000" />
            </label>
            <label>
              Approx. number of students
              <input value={schoolForm.studentCount} onChange={updateSchoolForm('studentCount')} placeholder="e.g. 30-50" />
            </label>
            <label>
              Program of interest
              <select value={schoolForm.programInterest} onChange={updateSchoolForm('programInterest')}>
                {pillars.map((pillar) => (
                  <option key={pillar.key} value={pillar.label}>{pillar.label}</option>
                ))}
              </select>
            </label>
            <label>
              Message
              <textarea value={schoolForm.message} onChange={updateSchoolForm('message')} rows={3} placeholder="Anything else we should know?" />
            </label>

            {formError && <p className="field-error">{formError}</p>}
            <button className="primary-btn" type="submit">Request a Demo</button>
          </form>
        )}
      </section>
    </div>
  );
}

export default DemoPage;

import { FormEvent, useState } from 'react';
import { CONTACT } from '../data';
import { saveContact, type ContactFormValues } from '../lib/storage';

const initialValues: ContactFormValues = {
  name: '',
  email: '',
  message: '',
};

function ContactPage() {
  const [values, setValues] = useState(initialValues);
  const [submitted, setSubmitted] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!values.name || !values.email || !values.message) return;
    saveContact(values);
    setSubmitted(true);
    setValues(initialValues);
  };

  return (
    <div className="page">
      <section className="section page-intro">
        <span className="eyebrow">Contact</span>
        <h1>Talk to the CodeKidzz team</h1>
        <p>Use the form below, WhatsApp, or email to reach the team. Schools should use the Schools page instead.</p>
      </section>

      <section className="section contact-layout">
        <form className="form-card" onSubmit={submit}>
          <label>
            Contact Name
            <input value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
          </label>
          <label>
            Email
            <input type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
          </label>
          <label>
            Message
            <textarea rows={6} value={values.message} onChange={(e) => setValues({ ...values, message: e.target.value })} />
          </label>
          <button className="primary-btn" type="submit">Send Message</button>
          {submitted && <p className="status-message success">Message received — we'll get back to you soon.</p>}
        </form>

        <aside className="sidebar-card">
          <h2>Reach us directly</h2>
          <p><strong>WhatsApp:</strong> <a href={`https://wa.me/${CONTACT.whatsappNumber}`} target="_blank" rel="noreferrer">Chat on WhatsApp</a></p>
          <p><strong>Email:</strong> <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p>
          <p><strong>Phone:</strong> {CONTACT.phone}</p>
          <p><strong>Social:</strong> Instagram, YouTube, and Facebook links are available in the footer.</p>
          <div className="map-frame" aria-label="Google map section">
            <iframe
              title="Google Maps"
              src={`https://www.google.com/maps?q=${encodeURIComponent(CONTACT.address)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className="note">Map centers on the address in CONTACT.address (data.ts) — update it once you have a real location.</p>
        </aside>
      </section>
    </div>
  );
}

export default ContactPage;

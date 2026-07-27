import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="page">
      <section className="section page-intro">
        <span className="eyebrow">404</span>
        <h1>We couldn't find that page</h1>
        <p>The page you're looking for may have moved or no longer exists.</p>
        <div className="cta-row">
          <Link className="primary-btn" to="/">Back to Home</Link>
          <Link className="secondary-btn" to="/services">Browse Services</Link>
        </div>
      </section>
    </div>
  );
}

export default NotFoundPage;

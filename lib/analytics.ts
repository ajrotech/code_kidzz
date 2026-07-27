// Real visitor analytics (page views, traffic sources) — separate from the
// business-data "Analytics" tab in the admin dashboard, which tracks your own
// enrollments/students, not website visitors.
//
// Not wired to a real account yet — you need your own tracking ID (free tier
// works fine for either provider). Once you have one, set it below or as an
// env var and this activates automatically. Until then this file does nothing.

const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN ?? ''; // e.g. 'codekidzz.com' — from plausible.io
const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_ID ?? ''; // e.g. 'G-XXXXXXX' — from analytics.google.com

export function initAnalytics() {
  if (PLAUSIBLE_DOMAIN) {
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = PLAUSIBLE_DOMAIN;
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
    return;
  }

  if (GA4_MEASUREMENT_ID) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    const inline = document.createElement('script');
    inline.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA4_MEASUREMENT_ID}');
    `;
    document.head.appendChild(inline);
  }
}

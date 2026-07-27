// Original decorative illustrations (hand-built, flat/geometric style — no stock art).

export function HeroIllustration() {
  return (
    <svg viewBox="0 0 420 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of a kid coding next to a robot">
      <ellipse cx="210" cy="330" rx="170" ry="24" fill="var(--brand-purple)" opacity="0.08" />

      {/* floating code bracket */}
      <g opacity="0.9">
        <text x="30" y="90" fontSize="42" fontWeight="800" fill="var(--brand-yellow)" fontFamily="monospace">{'<'}</text>
        <text x="70" y="70" fontSize="26" fontWeight="800" fill="var(--brand-green)" fontFamily="monospace">{'/>'}</text>
      </g>

      {/* kid silhouette sitting cross-legged with laptop */}
      <g transform="translate(70,150)">
        <circle cx="60" cy="26" r="26" fill="var(--brand-dark)" />
        <path d="M20 150c0-46 18-72 40-72s40 26 40 72z" fill="var(--brand-purple)" />
        <path d="M0 168c20-16 100-16 120 0v14H0z" fill="var(--brand-dark)" opacity="0.9" />
        <rect x="34" y="96" width="52" height="34" rx="6" fill="#fff" stroke="var(--brand-dark)" strokeWidth="3" />
        <path d="M40 108h16M40 116h28" stroke="var(--brand-green)" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* small robot buddy */}
      <g transform="translate(280,140)">
        <rect x="10" y="30" width="70" height="56" rx="14" fill="var(--brand-green)" />
        <circle cx="32" cy="56" r="7" fill="#fff" />
        <circle cx="58" cy="56" r="7" fill="#fff" />
        <circle cx="32" cy="56" r="3" fill="var(--brand-dark)" />
        <circle cx="58" cy="56" r="3" fill="var(--brand-dark)" />
        <rect x="24" y="94" width="16" height="20" rx="4" fill="var(--brand-dark)" opacity="0.85" />
        <rect x="50" y="94" width="16" height="20" rx="4" fill="var(--brand-dark)" opacity="0.85" />
        <line x1="45" y1="30" x2="45" y2="14" stroke="var(--brand-dark)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="45" cy="10" r="6" fill="var(--brand-yellow)" />
        <line x1="10" y1="50" x2="-8" y2="44" stroke="var(--brand-green)" strokeWidth="6" strokeLinecap="round" />
        <line x1="80" y1="50" x2="98" y2="44" stroke="var(--brand-green)" strokeWidth="6" strokeLinecap="round" />
      </g>

      {/* sparkle stars */}
      <g fill="var(--brand-yellow)">
        <path d="M340 60l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" />
        <path d="M40 220l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
      </g>
      <g fill="var(--brand-purple)" opacity="0.5">
        <circle cx="360" cy="220" r="5" />
        <circle cx="20" cy="130" r="4" />
      </g>
    </svg>
  );
}

export function VideoPlaceholder({
  label = 'Class highlight video',
  image,
  src,
}: {
  label?: string;
  image?: string;
  src?: string;
}) {
  if (src) {
    return (
      <div className="video-slot video-slot--player">
        <video
          className="video-slot-media"
          controls
          playsInline
          preload="metadata"
          src={src}
          poster={image}
        />
        <span className="video-slot-caption">{label}</span>
      </div>
    );
  }

  return (
    <div
      className="video-slot"
      role="img"
      aria-label={`${label} — placeholder`}
      style={image ? { backgroundImage: `linear-gradient(rgba(30,27,75,0.45), rgba(30,27,75,0.45)), url(${image})` } : undefined}
    >
      <svg viewBox="0 0 80 80" width="60" height="60">
        <circle cx="40" cy="40" r="38" fill="rgba(255,255,255,0.22)" />
        <path d="M32 26l24 14-24 14z" fill="#fff" />
      </svg>
      <span>{label}</span>
    </div>
  );
}

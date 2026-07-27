// Small line-style icons for the "How It Works" strip. Single color via currentColor.
type IconProps = { className?: string };

export function ClockIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="2.2" />
      <path d="M20 11v9l6 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="14" r="5" stroke="currentColor" strokeWidth="2.2" />
      <path d="M6 32c0-5.5 4-9 9-9s9 3.5 9 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="27" cy="15" r="4" stroke="currentColor" strokeWidth="2" opacity="0.7" />
      <path d="M25 32c0-4.5 2.8-7.6 7-8.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function RatioIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="13" r="4" stroke="currentColor" strokeWidth="2.2" />
      <path d="M13 19c-4.4 0-8 2.8-8 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="23" y="10" width="12" height="20" rx="3" stroke="currentColor" strokeWidth="2" opacity="0.7" />
      <path d="M27 16h4M27 20h4M27 24h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function MonitorIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="8" width="30" height="19" rx="3" stroke="currentColor" strokeWidth="2.2" />
      <path d="M14 33h12M20 27v6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M15 17l5-3 5 3v0l-5 3-5-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" opacity="0.7" />
    </svg>
  );
}

export function VideoIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="12" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2.2" />
      <path d="M25 17l10-5v16l-10-5" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}

export function DocIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 5h13l6 6v24H11z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M24 5v6h6" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M15 21h10M15 26h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export const featureIconMap = {
  clock: ClockIcon,
  users: UsersIcon,
  ratio: RatioIcon,
  monitor: MonitorIcon,
  video: VideoIcon,
  doc: DocIcon,
};

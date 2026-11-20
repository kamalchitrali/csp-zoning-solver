export function BusIcon({ size = 22, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="3" width="16" height="16" rx="3" fill="currentColor" opacity=".16" />
      <path d="M7 17.5V6.8c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v10.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 11h10M7.5 8h3M13.5 8h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 14h14M8 19v1.5M16 19v1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8" cy="17" r="1.25" fill="currentColor" />
      <circle cx="16" cy="17" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function RouteIcon({ size = 20, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="2.5" fill="currentColor" opacity=".2" />
      <circle cx="18" cy="18" r="2.5" fill="currentColor" opacity=".2" />
      <path d="M6 8.5v2.2c0 1.8 1.4 3.3 3.2 3.3h5.6c1.8 0 3.2 1.5 3.2 3.3v.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="18" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function GridIcon({ size = 20, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="6" height="6" rx="1.4" fill="currentColor" opacity=".2" />
      <rect x="14" y="4" width="6" height="6" rx="1.4" fill="currentColor" opacity=".2" />
      <rect x="4" y="14" width="6" height="6" rx="1.4" fill="currentColor" opacity=".2" />
      <rect x="14" y="14" width="6" height="6" rx="1.4" fill="currentColor" opacity=".2" />
      <rect x="4" y="4" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="4" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="14" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="14" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ActivityIcon({ size = 20, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 14h3l2-7 4 12 2-7h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="4" cy="14" r="1.6" fill="currentColor" />
      <circle cx="20" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function DownloadIcon({ size = 18, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4v10M8 11l4 4 4-4M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SparkIcon({ size = 18, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" fill="currentColor" opacity=".2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" fill="currentColor" />
    </svg>
  );
}

export function MapIcon({ size = 20, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2V6Z" fill="currentColor" opacity=".12" />
      <path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2V6ZM9 4v14M15 6v14" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m6 10 1.5 1.5L10 9M16.5 11.5l1.5-1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ZoomInIcon({ size = 18, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="5.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15 15 20 20M10.5 8v5M8 10.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ZoomOutIcon({ size = 18, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="5.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15 15 20 20M8 10.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function LocateIcon({ size = 18, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ExpandIcon({ size = 18, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 4H4v4M16 4h4v4M20 16v4h-4M4 16v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m4 4 5 5M20 4l-5 5M20 20l-5-5M4 20l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CollapseIcon({ size = 18, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m9 4-5 5M15 4l5 5M20 15l-5 5M4 15l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9h5V4M20 9h-5V4M20 15h-5v5M4 15h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

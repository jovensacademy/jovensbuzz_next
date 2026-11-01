/**
 * Small inline SVG flags (emoji flags don't render on Windows). Simplified but recognisable;
 * decorative only — the country name and ISO code are always shown alongside.
 */
export function CountryFlag({ iso }: { iso: string }) {
  const common = { width: 22, height: 15, viewBox: "0 0 22 15", "aria-hidden": true, focusable: false, className: "jb-phone__flag" } as const;
  switch (iso) {
    case "US":
      return (
        <svg {...common}>
          <rect width="22" height="15" fill="#fff" />
          {[0, 2, 4, 6, 8, 10, 12].map((i) => (
            <rect key={i} y={i * 1.154} width="22" height="1.154" fill="#b22234" />
          ))}
          <rect width="9.5" height="8.08" fill="#3c3b6e" />
        </svg>
      );
    case "IN":
      return (
        <svg {...common}>
          <rect width="22" height="5" fill="#ff9933" />
          <rect y="5" width="22" height="5" fill="#fff" />
          <rect y="10" width="22" height="5" fill="#138808" />
          <circle cx="11" cy="7.5" r="1.9" fill="none" stroke="#000080" strokeWidth=".7" />
        </svg>
      );
    case "CA":
      return (
        <svg {...common}>
          <rect width="22" height="15" fill="#fff" />
          <rect width="5.5" height="15" fill="#d80621" />
          <rect x="16.5" width="5.5" height="15" fill="#d80621" />
          <path d="M11 3.2l.8 1.6 1.2-.5-.4 2.2 1.5-1-.3 1.5 1.3.3-1.9 1.6.4 1H11.4V11h-.8V9.9H8.4l.4-1-1.9-1.6 1.3-.3-.3-1.5 1.5 1-.4-2.2 1.2.5z" fill="#d80621" />
        </svg>
      );
    case "GB":
      return (
        <svg {...common}>
          <rect width="22" height="15" fill="#012169" />
          <path d="M0 0l22 15M22 0L0 15" stroke="#fff" strokeWidth="3" />
          <path d="M0 0l22 15M22 0L0 15" stroke="#c8102e" strokeWidth="1.2" />
          <path d="M11 0v15M0 7.5h22" stroke="#fff" strokeWidth="4.2" />
          <path d="M11 0v15M0 7.5h22" stroke="#c8102e" strokeWidth="2.4" />
        </svg>
      );
    case "AU":
      return (
        <svg {...common}>
          <rect width="22" height="15" fill="#012169" />
          <g transform="scale(.5)">
            <path d="M0 0l22 15M22 0L0 15" stroke="#fff" strokeWidth="3" />
            <path d="M0 0l22 15M22 0L0 15" stroke="#c8102e" strokeWidth="1.2" />
            <path d="M11 0v15M0 7.5h22" stroke="#fff" strokeWidth="4.2" />
            <path d="M11 0v15M0 7.5h22" stroke="#c8102e" strokeWidth="2.4" />
          </g>
          <circle cx="5.5" cy="11.5" r="1.3" fill="#fff" />
          <circle cx="16.5" cy="3.5" r=".8" fill="#fff" />
          <circle cx="14" cy="7" r=".8" fill="#fff" />
          <circle cx="18.5" cy="7.5" r=".8" fill="#fff" />
          <circle cx="16.5" cy="12" r=".8" fill="#fff" />
        </svg>
      );
    default:
      return null;
  }
}

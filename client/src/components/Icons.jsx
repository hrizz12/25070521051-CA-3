// Small, minimal line icons (inline SVG so we need no icon library).
function Icon({ children, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconLogo = (props) => (
  <Icon {...props}>
    <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
    <circle cx="12" cy="12" r="2.6" />
  </Icon>
);
export const IconDashboard = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </Icon>
);
export const IconFilm = (props) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
  </Icon>
);
export const IconPlus = (props) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
export const IconEdit = (props) => (
  <Icon {...props}>
    <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16v4z" />
  </Icon>
);
export const IconTrash = (props) => (
  <Icon {...props}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3" />
  </Icon>
);
export const IconCheck = (props) => (
  <Icon {...props}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
);
export const IconLogout = (props) => (
  <Icon {...props}>
    <path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4M16 17l5-5-5-5M21 12H9" />
  </Icon>
);
export const IconSearch = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Icon>
);
export const IconMenu = (props) => (
  <Icon {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);
export const IconX = (props) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);
export const IconCalendar = (props) => (
  <Icon {...props}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Icon>
);
export const IconPin = (props) => (
  <Icon {...props}>
    <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.4" />
  </Icon>
);
export const IconClock = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);
export const IconArrowLeft = (props) => (
  <Icon {...props}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
);

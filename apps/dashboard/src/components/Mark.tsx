export function Mark() {
  return (
    <svg
      className="mark"
      viewBox="0 0 52 32"
      width="38"
      height="23"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 16
           C4 9 10 5 16 6
           C23 7.2 28.5 9.6 33 12.6
           C34.9 13.9 34.9 18.1 33 19.4
           C28.5 22.4 23 24.8 16 26
           C10 27 4 23 4 16 Z"
        fill="var(--green, #40BE46)"
      />
      <path
        d="M33.5 16 C38.5 17.2 41 13.2 45.5 11.4"
        fill="none"
        stroke="var(--green, #40BE46)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="13" cy="14" r="2.3" fill="var(--ink, #121212)" />
    </svg>
  );
}

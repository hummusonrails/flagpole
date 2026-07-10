import type { Flag } from "flagpole-client";

export function Pond({ flags }: { flags: Flag[] }) {
  return (
    <div className="pond" aria-hidden="true">
      <span className="pond-label">the pond</span>
      <div className="pond-water">
        {flags.map((flag) => (
          <span key={flag.key} className="creature" data-enabled={flag.enabled}>
            <Tadpole />
            <FrogSprite />
          </span>
        ))}
      </div>
    </div>
  );
}

function Tadpole() {
  return (
    <svg className="tadpole" viewBox="0 0 36 28" width="34" height="26" focusable="false">
      <circle cx="11" cy="15" r="6" fill="var(--slate-ink)" />
      <path
        d="M16.5 15 C22.5 16.8 25.5 11.5 31 10"
        fill="none"
        stroke="var(--slate-ink)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="9.5" cy="13.5" r="1.5" fill="var(--mist)" />
    </svg>
  );
}

function FrogSprite() {
  return (
    <svg className="frog" viewBox="0 0 36 30" width="34" height="28" focusable="false">
      <ellipse cx="18" cy="28" rx="15" ry="2.2" fill="var(--green-wash)" />
      <circle cx="11" cy="8" r="5" fill="var(--green)" />
      <circle cx="25" cy="8" r="5" fill="var(--green)" />
      <ellipse cx="18" cy="17.5" rx="13" ry="9" fill="var(--green)" />
      <circle cx="11" cy="7.5" r="2.5" fill="#ffffff" />
      <circle cx="25" cy="7.5" r="2.5" fill="#ffffff" />
      <circle cx="11.6" cy="8" r="1.2" fill="var(--ink)" />
      <circle cx="24.4" cy="8" r="1.2" fill="var(--ink)" />
      <path
        d="M11.5 19.5 q6.5 4 13 0"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

import type { Flag } from "flagpole-client";
import { timeAgo } from "../lib/time";

type FlagRowProps = {
  flag: Flag;
  pending: boolean;
  now: Date;
  onToggle: (flag: Flag) => void;
};

export function FlagRow({ flag, pending, now, onToggle }: FlagRowProps) {
  const keyId = `flag-key-${flag.key}`;

  return (
    <li className="flag-row" data-enabled={flag.enabled}>
      <button
        type="button"
        role="switch"
        aria-checked={flag.enabled}
        aria-labelledby={keyId}
        aria-busy={pending || undefined}
        className="pole-toggle"
        onClick={() => onToggle(flag)}
      >
        <svg viewBox="0 0 30 60" width="30" height="60" aria-hidden="true" focusable="false">
          <circle cx="9" cy="4.5" r="2.4" fill="currentColor" />
          <rect x="8" y="6.5" width="2" height="45" rx="1" fill="currentColor" />
          <path d="M2 54 q7 3.6 14 0" className="ripple" />
          <path d="M5 52.5 q4 2 8 0" className="ripple ripple-inner" />
          <g className="pennant-lift">
            <path
              className="pennant-cloth"
              d="M10.5 8 C16.5 8.4 22 10 27 12.7 C22 15.4 16.5 17 10.5 17.4 Z"
            />
          </g>
        </svg>
      </button>
      <div className="flag-meta">
        <code className="flag-key" id={keyId}>
          {flag.key}
        </code>
        <span className="flag-updated">updated {timeAgo(flag.updatedAt, now)}</span>
      </div>
      <span className="flag-state">{flag.enabled ? "On" : "Off"}</span>
    </li>
  );
}

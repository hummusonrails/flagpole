import { useCallback, useEffect, useState } from "react";
import type { Flag } from "@hummusonrails/flagpole-client";
import { baseUrl, client } from "./lib/client";
import { FlagRow } from "./components/FlagRow";
import { Mark } from "./components/Mark";
import { Pond } from "./components/Pond";
import jfrogLogo from "./assets/jfrog-logo.svg";
import jfrogFlyLogo from "./assets/jfrog-fly-logo.svg";

function describeCount(raised: number, total: number): string {
  if (raised === total) return `all ${total} raised`;
  if (raised === 0) return total === 1 ? "still a tadpole" : `all ${total} still tadpoles`;
  const waiting = total - raised;
  return `${raised} raised, ${waiting} still ${waiting === 1 ? "a tadpole" : "tadpoles"}`;
}

type LoadState = "loading" | "ready" | "offline";

const serviceHost = baseUrl.replace(/^https?:\/\//, "");

export function App() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [pendingKeys, setPendingKeys] = useState<ReadonlySet<string>>(new Set());
  const [notice, setNotice] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  const load = useCallback(async () => {
    setLoadState("loading");
    setNotice(null);
    try {
      const list = await client.listFlags();
      setFlags(list);
      setLoadState("ready");
    } catch {
      setLoadState("offline");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(tick);
  }, []);

  const toggle = useCallback(async (flag: Flag) => {
    const next = !flag.enabled;
    setNotice(null);
    setPendingKeys((keys) => new Set(keys).add(flag.key));
    setFlags((list) =>
      list.map((f) => (f.key === flag.key ? { ...f, enabled: next } : f)),
    );
    try {
      const saved = await client.setFlag(flag.key, next);
      setFlags((list) => list.map((f) => (f.key === saved.key ? saved : f)));
      setNow(new Date());
    } catch {
      setFlags((list) => list.map((f) => (f.key === flag.key ? flag : f)));
      setNotice(`Couldn't update ${flag.key}. Check that the service at ${serviceHost} is still running.`);
    } finally {
      setPendingKeys((keys) => {
        const rest = new Set(keys);
        rest.delete(flag.key);
        return rest;
      });
    }
  }, []);

  const raisedCount = flags.filter((f) => f.enabled).length;

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <Mark />
          <span className="wordmark">flagpole</span>
          <span className="cobrand" aria-hidden="true" />
          <img className="fly-logo" src={jfrogFlyLogo} alt="JFrog Fly" width={112} height={63} />
        </div>
        <p className="service" data-state={loadState}>
          <span className="service-dot" aria-hidden="true" />
          <span className="service-label">
            {loadState === "ready" && "connected"}
            {loadState === "loading" && "connecting"}
            {loadState === "offline" && "offline"}
          </span>
          <code className="service-host">{serviceHost}</code>
        </p>
      </header>

      <main>
        <div className="ledger-head">
          <h1>Flags</h1>
          {loadState === "ready" && flags.length > 0 && (
            <p className="raised-count">{describeCount(raisedCount, flags.length)}</p>
          )}
        </div>

        {notice && (
          <p className="notice" role="alert">
            {notice}
          </p>
        )}

        {loadState === "loading" && (
          <div className="ledger-card" aria-hidden="true">
            <div className="skeleton-row" />
            <div className="skeleton-row" />
            <div className="skeleton-row" />
          </div>
        )}
        {loadState === "loading" && (
          <p className="visually-hidden" role="status">
            Loading flags
          </p>
        )}

        {loadState === "offline" && (
          <div className="offline-panel" role="alert">
            <h2>Flag service unreachable</h2>
            <p>
              flagpole asked <code>{baseUrl}/flags</code> and got no answer. Start the service, then
              try again:
            </p>
            <pre>
              <code>pnpm --filter @flagpole/service dev</code>
            </pre>
            <button type="button" className="retry" onClick={() => void load()}>
              Try again
            </button>
          </div>
        )}

        {loadState === "ready" && flags.length === 0 && (
          <div className="empty-panel">
            <h2>No flags yet</h2>
            <p>Set one from your terminal and it appears here:</p>
            <pre>
              <code>{`curl -X PUT ${baseUrl}/flags/my-first-flag \\\n  -H 'content-type: application/json' \\\n  -d '{"enabled": true}'`}</code>
            </pre>
          </div>
        )}

        {loadState === "ready" && flags.length > 0 && (
          <div className="ledger-card">
            <ul className="ledger">
              {flags.map((flag) => (
                <FlagRow
                  key={flag.key}
                  flag={flag}
                  pending={pendingKeys.has(flag.key)}
                  now={now}
                  onToggle={(f) => void toggle(f)}
                />
              ))}
            </ul>
            <Pond flags={flags} />
          </div>
        )}
      </main>

      <footer className="colophon">
        <p>A tiny feature flag service, built to demo JFrog Fly.</p>
        <a className="jfrog-credit" href="https://jfrog.com" target="_blank" rel="noreferrer">
          <span>Shipped with</span>
          <img className="jfrog-logo" src={jfrogLogo} alt="JFrog" width={44} height={43} />
        </a>
      </footer>
    </div>
  );
}

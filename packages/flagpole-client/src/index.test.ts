import { describe, it, expect, vi, afterEach } from "vitest";
import { FlagpoleClient } from "./index";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const client = new FlagpoleClient({ baseUrl: "http://svc.test/" });

afterEach(() => vi.unstubAllGlobals());

describe("FlagpoleClient", () => {
  it("listFlags returns the array from /flags", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse([{ key: "a", enabled: true, updatedAt: "t" }])),
    );
    const flags = await client.listFlags();
    expect(flags[0]?.key).toBe("a");
  });

  it("isEnabled reflects the flag value", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ key: "x", enabled: true, updatedAt: "t" })),
    );
    expect(await client.isEnabled("x")).toBe(true);
  });

  it("getFlag returns null when the flag is missing", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error: "nope" }, 404)));
    expect(await client.getFlag("nope")).toBeNull();
  });

  it("setFlag PUTs the enabled value", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({ key: "x", enabled: true, updatedAt: "t" }),
    );
    vi.stubGlobal("fetch", fetchMock);
    await client.setFlag("x", true);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://svc.test/flags/x",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ enabled: true }),
      }),
    );
  });

  it("sends an authorization header when a token is set", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) => jsonResponse([]),
    );
    vi.stubGlobal("fetch", fetchMock);
    await new FlagpoleClient({ baseUrl: "http://svc.test", token: "secret" }).listFlags();
    const init = fetchMock.mock.lastCall?.[1] as RequestInit;
    expect(new Headers(init.headers).get("authorization")).toBe("Bearer secret");
  });
});

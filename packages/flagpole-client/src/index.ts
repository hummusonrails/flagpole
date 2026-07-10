// a feature flag as returned by the flagpole service
export type Flag = {
  key: string;
  enabled: boolean;
  updatedAt: string;
};

export type FlagpoleClientOptions = {
  baseUrl: string;
  token?: string;
};

// typed client for the flagpole service, uses global fetch so it runs in node and the browser
export class FlagpoleClient {
  #baseUrl: string;
  #token?: string;

  constructor(options: FlagpoleClientOptions) {
    // trim trailing slashes so path joins are predictable
    this.#baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.#token = options.token;
  }

  // the money method, the one line an app actually writes
  async isEnabled(key: string): Promise<boolean> {
    const flag = await this.getFlag(key);
    return flag?.enabled ?? false;
  }

  // returns null when the flag does not exist
  async getFlag(key: string): Promise<Flag | null> {
    const res = await this.#request(`/flags/${encodeURIComponent(key)}`);
    if (res.status === 404) return null;
    await this.#ensureOk(res);
    return (await res.json()) as Flag;
  }

  async listFlags(): Promise<Flag[]> {
    const res = await this.#request("/flags");
    await this.#ensureOk(res);
    return (await res.json()) as Flag[];
  }

  async setFlag(key: string, enabled: boolean): Promise<Flag> {
    const res = await this.#request(`/flags/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    await this.#ensureOk(res);
    return (await res.json()) as Flag;
  }

  #request(path: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);
    if (this.#token) headers.set("authorization", `Bearer ${this.#token}`);
    return fetch(`${this.#baseUrl}${path}`, { ...init, headers });
  }

  async #ensureOk(res: Response): Promise<void> {
    if (res.ok) return;
    const body = await res.text().catch(() => "");
    throw new Error(`flagpole request failed: ${res.status} ${body}`.trim());
  }
}

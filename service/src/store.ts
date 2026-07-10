// in-memory seeded flag store, runs anywhere with zero external setup

export type Flag = {
  key: string;
  enabled: boolean;
  updatedAt: string;
};

export interface FlagStore {
  list(): Flag[];
  get(key: string): Flag | undefined;
  set(key: string, enabled: boolean): Flag;
}

const DEFAULT_SEED: ReadonlyArray<readonly [string, boolean]> = [
  ["new-checkout", false],
  ["dark-mode", true],
  ["beta-banner", false],
];

export function createStore(
  seed: ReadonlyArray<readonly [string, boolean]> = DEFAULT_SEED,
): FlagStore {
  const flags = new Map<string, Flag>();
  const stamp = (): string => new Date().toISOString();

  for (const [key, enabled] of seed) {
    flags.set(key, { key, enabled, updatedAt: stamp() });
  }

  return {
    list: () => [...flags.values()],
    get: (key) => flags.get(key),
    set: (key, enabled) => {
      const flag: Flag = { key, enabled, updatedAt: stamp() };
      flags.set(key, flag);
      return flag;
    },
  };
}

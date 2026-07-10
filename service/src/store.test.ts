import { describe, it, expect } from "vitest";
import { createStore } from "./store";

describe("createStore", () => {
  it("seeds default flags and reads one back", () => {
    const store = createStore();
    expect(store.list().length).toBeGreaterThan(0);
    expect(store.get("dark-mode")?.enabled).toBe(true);
  });

  it("set toggles an existing flag and creates a new one", () => {
    const store = createStore();
    expect(store.set("dark-mode", false).enabled).toBe(false);
    expect(store.set("brand-new", true).key).toBe("brand-new");
    expect(store.get("brand-new")?.enabled).toBe(true);
  });
});

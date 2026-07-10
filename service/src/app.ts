import express, { type Express } from "express";
import cors from "cors";
import { createStore, type FlagStore } from "./store";

// build the app, store is injectable so tests can pass a fresh one
export function createApp(store: FlagStore = createStore()): Express {
  const app = express();
  // cors so browser apps on another origin can call the sdk
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/flags", (_req, res) => {
    res.json(store.list());
  });

  app.get("/flags/:key", (req, res) => {
    const flag = store.get(req.params.key);
    if (!flag) {
      res.status(404).json({ error: `unknown flag: ${req.params.key}` });
      return;
    }
    res.json(flag);
  });

  app.put("/flags/:key", (req, res) => {
    const enabled = (req.body as { enabled?: unknown })?.enabled;
    if (typeof enabled !== "boolean") {
      res.status(400).json({ error: "body must include a boolean 'enabled'" });
      return;
    }
    res.json(store.set(req.params.key, enabled));
  });

  return app;
}

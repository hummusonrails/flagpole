import { FlagpoleClient } from "@hummusonrails/flagpole-client";

export const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export const client = new FlagpoleClient({ baseUrl });

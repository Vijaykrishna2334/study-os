// Central GCP config. Reads from .env / .env.local.
// Sets GOOGLE_APPLICATION_CREDENTIALS if a key file is given so all GCP SDKs auto-auth.
import { existsSync } from "node:fs";
import { resolve } from "node:path";

export const GCP_PROJECT = process.env.GCP_PROJECT || "gen-lang-client-0754997267";
export const GCP_LOCATION = process.env.GCP_LOCATION || "us-central1";
export const AGENT_BUILDER_LOCATION = process.env.AGENT_BUILDER_LOCATION || "global";
export const GCS_BUCKET = process.env.GCS_BUCKET || `${GCP_PROJECT}-study-notes`;
export const DATASTORE_ID = process.env.DATASTORE_ID || "study-notes-ds";
export const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID || "study-notes-engine";

const KEY_FILE = process.env.GOOGLE_APPLICATION_CREDENTIALS || resolve(process.cwd(), "gcp-key.json");

if (existsSync(KEY_FILE)) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = KEY_FILE;
}

export function gcpReady(): { ok: boolean; reason?: string } {
  if (!existsSync(KEY_FILE)) return { ok: false, reason: `Service account key not found at ${KEY_FILE}` };
  if (!GCP_PROJECT) return { ok: false, reason: "GCP_PROJECT env not set" };
  return { ok: true };
}

export const KEY_FILE_PATH = KEY_FILE;

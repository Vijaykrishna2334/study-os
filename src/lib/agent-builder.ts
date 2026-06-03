// Vertex AI Search + Conversational Search (Agent Builder) clients.
// Uses ₹94,800 restricted credit.
import { v1 as DE } from "@google-cloud/discoveryengine";
import { GCP_PROJECT, AGENT_BUILDER_LOCATION, DATASTORE_ID, SEARCH_ENGINE_ID } from "./gcp";

let _search: DE.SearchServiceClient | null = null;
let _convo: DE.ConversationalSearchServiceClient | null = null;
let _docs: DE.DocumentServiceClient | null = null;
let _dataStore: DE.DataStoreServiceClient | null = null;
let _engine: DE.EngineServiceClient | null = null;

const apiEndpoint = AGENT_BUILDER_LOCATION === "global"
  ? "discoveryengine.googleapis.com"
  : `${AGENT_BUILDER_LOCATION}-discoveryengine.googleapis.com`;

const opts = { apiEndpoint };

export function searchClient()       { return _search    ??= new DE.SearchServiceClient(opts); }
export function convoClient()        { return _convo     ??= new DE.ConversationalSearchServiceClient(opts); }
export function docClient()          { return _docs      ??= new DE.DocumentServiceClient(opts); }
export function dataStoreClient()    { return _dataStore ??= new DE.DataStoreServiceClient(opts); }
export function engineClient()       { return _engine    ??= new DE.EngineServiceClient(opts); }

export const COLLECTION = "default_collection";
export const BRANCH = "default_branch";
export const SERVING_CONFIG_ID = "default_search";

export function collectionPath(): string {
  return `projects/${GCP_PROJECT}/locations/${AGENT_BUILDER_LOCATION}/collections/${COLLECTION}`;
}
export function dataStorePath(): string {
  return `${collectionPath()}/dataStores/${DATASTORE_ID}`;
}
export function branchPath(): string {
  return `${dataStorePath()}/branches/${BRANCH}`;
}
export function servingConfigPath(): string {
  return `${collectionPath()}/engines/${SEARCH_ENGINE_ID}/servingConfigs/${SERVING_CONFIG_ID}`;
}
export function enginePath(): string {
  return `${collectionPath()}/engines/${SEARCH_ENGINE_ID}`;
}

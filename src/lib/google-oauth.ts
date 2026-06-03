import { google } from "googleapis";
import { prisma } from "./prisma";

export const SCOPES = ["https://www.googleapis.com/auth/calendar"];

export function makeOAuthClient() {
  const id     = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redir  = process.env.GOOGLE_OAUTH_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";
  if (!id || !secret) throw new Error("GOOGLE_OAUTH_CLIENT_ID/SECRET not set in .env");
  return new google.auth.OAuth2(id, secret, redir);
}

export function authUrl() {
  const client = makeOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
}

export async function exchangeCode(code: string) {
  const client = makeOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth: client });
  const me = await oauth2.userinfo.get();
  return { tokens, email: me.data.email || "" };
}

export async function loadAuthorisedClient() {
  const acct = await prisma.connectedAccount.findUnique({ where: { provider: "google" } });
  if (!acct || !acct.refreshToken) return null;
  const client = makeOAuthClient();
  client.setCredentials({
    access_token: acct.accessToken,
    refresh_token: acct.refreshToken,
    expiry_date: acct.expiresAt ? acct.expiresAt.getTime() : undefined,
  });
  // Persist refreshed tokens automatically
  client.on("tokens", async (t) => {
    const data: any = {};
    if (t.access_token) data.accessToken = t.access_token;
    if (t.expiry_date) data.expiresAt = new Date(t.expiry_date);
    if (t.refresh_token) data.refreshToken = t.refresh_token;
    if (Object.keys(data).length) {
      await prisma.connectedAccount.update({ where: { provider: "google" }, data });
    }
  });
  return { client, account: acct };
}

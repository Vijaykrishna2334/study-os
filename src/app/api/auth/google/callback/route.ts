import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/google-oauth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const code = new URL(req.url).searchParams.get("code");
    if (!code) return NextResponse.redirect(new URL("/settings?google=missing_code", req.url));

    const { tokens, email } = await exchangeCode(code);
    await prisma.connectedAccount.upsert({
      where: { provider: "google" },
      create: {
        provider: "google",
        email,
        accessToken: tokens.access_token || "",
        refreshToken: tokens.refresh_token || "",
        scope: (tokens.scope || ""),
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
      update: {
        email,
        accessToken: tokens.access_token || "",
        refreshToken: tokens.refresh_token || "",
        scope: (tokens.scope || ""),
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });
    return NextResponse.redirect(new URL("/settings?google=connected", req.url));
  } catch (e: any) {
    return NextResponse.redirect(new URL(`/settings?google=error&msg=${encodeURIComponent(e.message)}`, req.url));
  }
}

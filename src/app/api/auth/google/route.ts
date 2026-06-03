import { NextResponse } from "next/server";
import { authUrl } from "@/lib/google-oauth";

export async function GET() {
  try {
    return NextResponse.redirect(authUrl());
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

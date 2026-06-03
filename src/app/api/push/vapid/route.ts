import { NextResponse } from "next/server";
import { VAPID_PUBLIC } from "@/lib/push";

export async function GET() {
  return NextResponse.json({ publicKey: VAPID_PUBLIC });
}

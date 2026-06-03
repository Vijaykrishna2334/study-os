import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface GcpCredit {
  id: string;
  name: string;
  original: number;   // ₹ original value
  remaining: number;  // ₹ remaining
  type: "one-time" | "monthly";
}

// From the user's GCP console screenshot
const DEFAULT_CREDITS: GcpCredit[] = [
  { id: "genai-builder",  name: "GenAI App Builder Trial",       original: 94812.51, remaining: 94799.62, type: "one-time" },
  { id: "dev-monthly-1", name: "Developer Program (Monthly) 1", original: 948.13,   remaining: 945.51,   type: "monthly"  },
  { id: "dev-monthly-2", name: "Developer Program (Monthly) 2", original: 948.13,   remaining: 39.81,    type: "monthly"  },
];

export async function GET() {
  try {
    const settings = await prisma.userSettings.findUnique({ where: { id: "singleton" } });
    const raw = settings?.creditsJSON;
    const credits: GcpCredit[] = raw && raw !== "[]" ? JSON.parse(raw) : DEFAULT_CREDITS;
    return NextResponse.json({ credits });
  } catch {
    return NextResponse.json({ credits: DEFAULT_CREDITS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { credits } = await req.json() as { credits: GcpCredit[] };
    await prisma.userSettings.upsert({
      where: { id: "singleton" },
      update: { creditsJSON: JSON.stringify(credits) },
      create: { id: "singleton", creditsJSON: JSON.stringify(credits) },
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

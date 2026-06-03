import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const gigs = await prisma.freelanceGig.findMany({ orderBy: { createdAt: "desc" } });
    const total = gigs.length;
    const earned = gigs.filter(g => g.status === "completed").reduce((s, g) => s + g.amountINR, 0);
    const active = gigs.filter(g => g.status === "active").length;
    const proposals = gigs.filter(g => g.status === "proposal").length;
    const completed = gigs.filter(g => g.status === "completed").length;
    return NextResponse.json({ gigs, stats: { total, earned, active, proposals, completed } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const gig = await prisma.freelanceGig.create({ data: body });
    return NextResponse.json({ gig });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

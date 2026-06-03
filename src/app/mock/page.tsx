import { prisma } from "@/lib/prisma";
import MockInterviewer from "@/components/MockInterviewer";

export const dynamic = "force-dynamic";

export default async function MockPage() {
  const topics = await prisma.topic.findMany({
    where: { tier: { in: ["A", "B"] } },
    orderBy: [{ phase: "asc" }, { order: "asc" }],
    select: { id: true, code: true, title: true, phase: true, tier: true },
  });
  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">Live Mock Interview</div>
        <h1 className="text-4xl font-extrabold gradient-text">Get grilled by Gemini</h1>
        <p className="text-text-secondary mt-2">Pick a topic. Answer like you're on a call. Gemini scores correctness, depth, articulation and follows up.</p>
      </header>
      <MockInterviewer topics={topics} />
    </div>
  );
}

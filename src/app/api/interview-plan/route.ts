import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── Score topics against a JD using keyword matching ──────────────────────────
function scoreTopics(topics: any[], jdText: string): any[] {
  const jd = jdText.toLowerCase();

  // Extract meaningful keywords from JD (ignore stop words)
  const stopWords = new Set(["the","a","an","and","or","for","in","on","at","to","of","with","is","are","you","we","your","our","will","can","must","have","has","be","been","that","this","it","its","from","by","as","do","not","all","any","more","also","would","should","each","their","they","them","these","those","but","so","if","then","when","there","what","which","who","how","was","were","been","had","has","use","used","using","work","working","team"]);

  const jdWords = jd
    .replace(/[^a-z0-9\s\/\-_\.]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  const jdSet = new Set(jdWords);

  // Key ML/AI tech keyword groups for bonus scoring
  const techGroups: Record<string, string[]> = {
    "python":       ["python","py","scripting"],
    "pytorch":      ["pytorch","torch"],
    "tensorflow":   ["tensorflow","tf","keras"],
    "ml":           ["machine learning","ml","supervised","unsupervised"],
    "deep learning":["deep learning","dl","neural network","cnn","rnn","lstm"],
    "nlp":          ["nlp","natural language","bert","gpt","llm","transformer","attention"],
    "cv":           ["computer vision","image","opencv","yolo","resnet","detection"],
    "statistics":   ["statistics","probability","bayes","distribution","regression"],
    "linear algebra":["linear algebra","matrix","vector","eigen","svd"],
    "calculus":     ["calculus","gradient","derivative","optimization"],
    "sql":          ["sql","database","query","mysql","postgres"],
    "system design":["system design","scalability","distributed","microservice"],
    "docker":       ["docker","container","kubernetes","k8s","devops"],
    "git":          ["git","github","version control"],
    "rag":          ["rag","retrieval","embedding","vector database","chromadb"],
    "mlops":        ["mlops","deployment","pipeline","airflow","mlflow"],
    "reinforcement":["reinforcement","rl","reward","agent","policy"],
  };

  return topics.map(topic => {
    const titleWords = (topic.title + " " + topic.code).toLowerCase().split(/[\s_]+/);
    let score = 0;

    // 1. Direct word match
    for (const w of titleWords) {
      if (w.length > 2 && jdSet.has(w)) score += 3;
    }

    // 2. Tech group match
    for (const [, keywords] of Object.entries(techGroups)) {
      const topicText = (topic.title + " " + topic.code).toLowerCase();
      const jdHasGroup = keywords.some(k => jd.includes(k));
      const topicInGroup = keywords.some(k => topicText.includes(k));
      if (jdHasGroup && topicInGroup) score += 10;
    }

    // 3. Tier bonus
    if (topic.tier === "A") score += 5;
    if (topic.tier === "B") score += 2;

    // 4. Boost unmastered topics (need more study)
    if (topic.confidence < 4) score += 3;
    if (topic.confidence === 0) score += 2;

    return { ...topic, jdScore: score };
  });
}

// ── Build day-by-day schedule ─────────────────────────────────────────────────
function buildSchedule(
  orderedTopics: any[],
  startDate: Date,
  endDate: Date,
  maxPerDay: number
): Record<string, string[]> {
  const schedule: Record<string, string[]> = {};
  let topicIdx = 0;

  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end && topicIdx < orderedTopics.length) {
    const dayKey = cursor.toISOString().slice(0, 10);
    const dayTopics: string[] = [];

    for (let i = 0; i < maxPerDay && topicIdx < orderedTopics.length; i++) {
      dayTopics.push(orderedTopics[topicIdx].id);
      topicIdx++;
    }

    if (dayTopics.length > 0) schedule[dayKey] = dayTopics;
    cursor.setDate(cursor.getDate() + 1);
  }

  return schedule;
}

// GET — fetch active plan
export async function GET() {
  try {
    const plan = await prisma.interviewPlan.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
    if (!plan) return NextResponse.json({ plan: null });

    const schedule = JSON.parse(plan.scheduleJSON);
    const completedDays = JSON.parse(plan.completedDays);
    const topicIds: string[] = Object.values(schedule).flat() as string[];
    const topics = await prisma.topic.findMany({
      where: { id: { in: topicIds } },
      select: { id: true, code: true, title: true, confidence: true, tier: true },
    });
    const topicMap = Object.fromEntries(topics.map(t => [t.id, t]));

    return NextResponse.json({ plan: { ...plan, schedule, completedDays, topicMap } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST — create new plan
export async function POST(req: NextRequest) {
  try {
    const { jdTitle, jdText, interviewDate, maxPerDay = 4 } = await req.json();
    if (!jdText || !interviewDate) {
      return NextResponse.json({ error: "jdText and interviewDate required" }, { status: 400 });
    }

    // Deactivate old plans
    await prisma.interviewPlan.updateMany({ where: { active: true }, data: { active: false } });

    // Score and order all topics
    const allTopics = await prisma.topic.findMany({
      select: { id: true, code: true, title: true, tier: true, confidence: true, phase: true, order: true },
      orderBy: [{ phase: "asc" }, { order: "asc" }],
    });

    const scored = scoreTopics(allTopics, jdText)
      .sort((a, b) => {
        // Sort: high JD score first, then tier A before others, then by phase order
        if (b.jdScore !== a.jdScore) return b.jdScore - a.jdScore;
        const tierOrder: Record<string,number> = { A:0, B:1, C:2, D:3 };
        return (tierOrder[a.tier] ?? 2) - (tierOrder[b.tier] ?? 2);
      });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const interview = new Date(interviewDate);

    const schedule = buildSchedule(scored, today, interview, maxPerDay);

    const plan = await prisma.interviewPlan.create({
      data: {
        jdTitle: jdTitle || "Interview Prep",
        jdText,
        interviewDate: interview,
        topicsJSON: JSON.stringify(scored.map(t => t.id)),
        scheduleJSON: JSON.stringify(schedule),
        completedDays: "[]",
        maxPerDay,
      },
    });

    return NextResponse.json({ plan });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

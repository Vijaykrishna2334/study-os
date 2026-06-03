// Increment today's StudyDay counters. Called on any meaningful interaction.
import { prisma } from "./prisma";

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

type Bump = Partial<{ minutes: number; topicsTouched: number; reads: number; quizzes: number; artifacts: number; mocks: number }>;

export async function logStudyDay(bump: Bump) {
  const date = todayKey();
  const existing = await prisma.studyDay.findUnique({ where: { date } });
  if (!existing) {
    await prisma.studyDay.create({
      data: {
        date,
        minutes: bump.minutes || 0,
        topicsTouched: bump.topicsTouched || 0,
        reads: bump.reads || 0,
        quizzes: bump.quizzes || 0,
        artifacts: bump.artifacts || 0,
        mocks: bump.mocks || 0,
      },
    });
    return;
  }
  await prisma.studyDay.update({
    where: { date },
    data: {
      minutes: existing.minutes + (bump.minutes || 0),
      topicsTouched: existing.topicsTouched + (bump.topicsTouched || 0),
      reads: existing.reads + (bump.reads || 0),
      quizzes: existing.quizzes + (bump.quizzes || 0),
      artifacts: existing.artifacts + (bump.artifacts || 0),
      mocks: existing.mocks + (bump.mocks || 0),
    },
  });
}

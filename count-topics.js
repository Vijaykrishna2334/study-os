const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.topic.findMany({ select: { confidence: true, tier: true, phase: true } }).then(t => {
  const total = t.length;
  const mastered = t.filter(x => x.confidence >= 4).length;
  const inprogress = t.filter(x => x.confidence > 0 && x.confidence < 4).length;
  const notstarted = t.filter(x => x.confidence === 0).length;
  const tierA = t.filter(x => x.tier === 'A').length;
  const tierAdone = t.filter(x => x.tier === 'A' && x.confidence >= 4).length;
  const remaining = total - mastered;

  console.log('=== TOPIC STATS ===');
  console.log('Total topics:', total);
  console.log('Mastered (conf 4+):', mastered);
  console.log('In Progress (conf 1-3):', inprogress);
  console.log('Not Started (conf 0):', notstarted);
  console.log('Remaining (to finish):', remaining);
  console.log('Tier A:', tierAdone + '/' + tierA, 'done');

  // Time estimates
  console.log('\n=== TIME TO COMPLETE REMAINING', remaining, 'topics ===');
  [2, 3, 4, 5, 6].forEach(perDay => {
    const days = Math.ceil(remaining / perDay);
    const date = new Date('2024-05-24');
    date.setDate(date.getDate() + days);
    console.log(perDay + ' topics/day =>', days, 'days (~', Math.ceil(days/7), 'weeks) => finish around', date.toDateString());
  });

  p.$disconnect();
});

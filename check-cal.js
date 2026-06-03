const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.calendarEvent.count().then(c => {
  console.log('Calendar events in DB:', c);
  p.$disconnect();
});

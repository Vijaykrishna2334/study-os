const { google } = require('googleapis');

const CALENDAR_ID = 'vijaykrishna2334@gmail.com';
const TZ = 'Asia/Kolkata';

function dt(dateStr, hour, minute = 0) {
  const h = String(hour).padStart(2, '0');
  const m = String(minute).padStart(2, '0');
  return `${dateStr}T${h}:${m}:00+05:30`;
}

const FIXED_BLOCKS = [
  { summary: '📧 NextMile — Emails + Nimbus Check',       desc: '✅ Check all new emails\n✅ Check Nimbus service status\n✅ Note pending queries\n✅ Reply urgent messages', sh: 9,  sm: 0,  eh: 9,  em: 30, color: '5' },
  { summary: '📜 NextMile — Certificate Prep + Queries',  desc: '✅ Certificate preparation work\n✅ Solve pending queries\n✅ Document progress\n✅ Update task tracker',    sh: 9,  sm: 30, eh: 10, em: 30, color: '5' },
  { summary: '📚 Study Session 1 — AI/ML Topics',         desc: 'Open Study OS: http://167.71.226.211\nStudy 2 topics, rate your confidence, take notes.',              sh: 10, sm: 30, eh: 12, em: 30, color: '7' },
  { summary: '💼 LinkedIn Post + Job Search',             desc: '✅ Post something on LinkedIn (tip, learning, or project)\n✅ Search new job openings\n✅ Save interesting JDs',  sh: 12, sm: 30, eh: 13, em: 0,  color: '9' },
  { summary: '🔍 Apply to Jobs',                          desc: '✅ Apply to 3-5 jobs\n✅ Tailor resume if needed\n✅ Track applications in Study OS',                       sh: 13, sm: 0,  eh: 14, em: 0,  color: '9' },
  { summary: '🍽️ Lunch Break',                           desc: 'Rest and recharge. Step away from screen.',                                                              sh: 14, sm: 0,  eh: 15, em: 0,  color: '8' },
  { summary: '📚 Study Session 2 — AI/ML Topics',         desc: 'Open Study OS: http://167.71.226.211\nStudy 2 more topics, update confidence levels.',                  sh: 15, sm: 0,  eh: 17, em: 0,  color: '7' },
  { summary: '☕ Snack Break',                            desc: 'Short break. Stretch, hydrate.',                                                                        sh: 17, sm: 0,  eh: 17, em: 30, color: '8' },
  { summary: '🔍 Job Applications + LinkedIn Engage',     desc: '✅ Apply to more jobs\n✅ Reply to LinkedIn comments\n✅ Connect with recruiters\n✅ Follow target companies', sh: 17, sm: 30, eh: 19, em: 30, color: '9' },
  { summary: '📧 NextMile Evening — Emails + Nimbus',     desc: '✅ Check evening emails\n✅ Nimbus service final check\n✅ Resolve end-of-day queries\n✅ Plan tomorrow',   sh: 20, sm: 0,  eh: 21, em: 0,  color: '5' },
  { summary: '📚 Evening Study + Review',                 desc: '✅ Review today\'s topics\n✅ Update confidence in Study OS\n✅ Note doubts\n\nhttp://167.71.226.211',     sh: 21, sm: 0,  eh: 22, em: 0,  color: '7' },
  { summary: '🍽️ Dinner',                                desc: 'Dinner and wind down.',                                                                                 sh: 22, sm: 0,  eh: 23, em: 0,  color: '8' },
];

async function pushSchedule() {
  const auth = new google.auth.GoogleAuth({
    keyFile: '/var/www/study-app/gcp-key.json',
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  const cal = google.calendar({ version: 'v3', auth });

  const startDate = new Date('2026-05-24');
  let created = 0, errors = 0;

  for (let i = 0; i < 30; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    process.stdout.write(`Day ${i+1} (${dateStr}): `);

    for (const b of FIXED_BLOCKS) {
      try {
        await cal.events.insert({
          calendarId: CALENDAR_ID,
          requestBody: {
            summary: b.summary,
            description: b.desc,
            start: { dateTime: dt(dateStr, b.sh, b.sm), timeZone: TZ },
            end:   { dateTime: dt(dateStr, b.eh, b.em), timeZone: TZ },
            colorId: b.color,
            reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 10 }] },
          },
        });
        created++;
        process.stdout.write('.');
      } catch (e) {
        errors++;
        process.stdout.write('x');
      }
    }
    console.log(` ✅`);
    // Small delay to avoid rate limit
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n🎉 DONE! Created: ${created} events, Errors: ${errors}`);
}

pushSchedule().catch(console.error);

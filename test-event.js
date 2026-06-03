const { google } = require('googleapis');

async function test() {
  const auth = new google.auth.GoogleAuth({
    keyFile: '/var/www/study-app/gcp-key.json',
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  const cal = google.calendar({ version: 'v3', auth });

  try {
    // Try inserting a test event to the user's calendar
    const event = await cal.events.insert({
      calendarId: 'vijaykrishna2334@gmail.com',
      requestBody: {
        summary: '✅ Study OS Test Event — DELETE ME',
        description: 'This is a test event. You can delete it.',
        start: { dateTime: '2026-05-24T09:00:00+05:30', timeZone: 'Asia/Kolkata' },
        end:   { dateTime: '2026-05-24T09:30:00+05:30', timeZone: 'Asia/Kolkata' },
        colorId: '7',
      },
    });
    console.log('✅ SUCCESS! Event created:', event.data.id);
    console.log('Event link:', event.data.htmlLink);
  } catch (e) {
    console.error('❌ FAIL:', e.message);
  }
}
test();

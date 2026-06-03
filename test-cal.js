const { google } = require('googleapis');

async function test() {
  const auth = new google.auth.GoogleAuth({
    keyFile: '/var/www/study-app/gcp-key.json',
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  try {
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    console.log('AUTH OK ✅ token starts:', token.token.slice(0, 20) + '...');

    // Try to list calendars
    const cal = google.calendar({ version: 'v3', auth });
    const list = await cal.calendarList.list();
    console.log('Calendars found:', list.data.items.length);
    list.data.items.forEach(c => console.log(' -', c.summary, c.id));
  } catch (e) {
    console.error('FAIL ❌', e.message);
    if (e.errors) console.error(JSON.stringify(e.errors));
  }
}
test();

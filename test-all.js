const http = require('http');

const BASE = 'http://localhost:3000';

function req(method, path, payload) {
  return new Promise((resolve) => {
    const body = payload ? JSON.stringify(payload) : null;
    const opts = {
      hostname: 'localhost', port: 3000, path, method,
      headers: { 'Content-Type': 'application/json', ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}) }
    };
    const r = http.request(opts, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, ok: res.statusCode < 400, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, ok: res.statusCode < 400, body: data.slice(0, 60) }); }
      });
    });
    r.on('error', e => resolve({ status: 0, ok: false, body: e.message }));
    if (body) r.write(body);
    r.end();
  });
}

const get  = (p) => req('GET', p);
const post = (p, b) => req('POST', p, b);

async function run() {
  console.log('\n═══════════════════════════════════════════');
  console.log('   STUDY OS — FULL LIVE TEST');
  console.log('═══════════════════════════════════════════\n');

  const tests = [
    // Pages
    { cat: '📄 PAGES',        name: 'Homepage',              fn: () => get('/') },
    { cat: '📄 PAGES',        name: 'Topics page',           fn: () => get('/topics') },
    { cat: '📄 PAGES',        name: 'Today page',            fn: () => get('/today') },
    { cat: '📄 PAGES',        name: 'Flashcards page',       fn: () => get('/flashcards') },
    { cat: '📄 PAGES',        name: 'Analytics page',        fn: () => get('/analytics') },
    { cat: '📄 PAGES',        name: 'Interview Planner',     fn: () => get('/interview-planner') },
    { cat: '📄 PAGES',        name: 'Freelance Tracker',     fn: () => get('/freelance') },
    { cat: '📄 PAGES',        name: 'Applications page',     fn: () => get('/applications') },
    { cat: '📄 PAGES',        name: 'DSA Grinder page',      fn: () => get('/dsa') },

    // Core APIs
    { cat: '⚡ APIs',          name: 'Streak',                fn: () => get('/api/streak') },
    { cat: '⚡ APIs',          name: 'Analytics',             fn: () => get('/api/analytics') },
    { cat: '⚡ APIs',          name: 'XP',                    fn: () => get('/api/xp') },
    { cat: '⚡ APIs',          name: 'Settings',              fn: () => get('/api/settings') },
    { cat: '⚡ APIs',          name: 'Billing Credits',       fn: () => get('/api/billing-credits') },
    { cat: '⚡ APIs',          name: 'Applications',          fn: () => get('/api/applications') },
    { cat: '⚡ APIs',          name: 'Interview Plan',        fn: () => get('/api/interview-plan') },
    { cat: '⚡ APIs',          name: 'Freelance Gigs',        fn: () => get('/api/freelance') },
    { cat: '⚡ APIs',          name: 'Goal Stats',            fn: () => get('/api/goal-stats') },
    { cat: '⚡ APIs',          name: 'Progress',              fn: () => get('/api/progress') },

    // POST APIs
    { cat: '📮 POST APIs',    name: 'Search (POST)',          fn: () => post('/api/search', { q: 'linear algebra' }) },
    { cat: '📮 POST APIs',    name: 'Flashcards (POST)',      fn: () => post('/api/flashcards', { topicId: 'test' }) },
    { cat: '📮 POST APIs',    name: 'Goal Stats log',         fn: () => post('/api/goal-stats', { field: 'topicsStudied', value: 0 }) },
    { cat: '📮 POST APIs',    name: 'Freelance create',       fn: () => post('/api/freelance', { title: '__TEST__', platform: 'Upwork', amountINR: 0 }) },

    // Calendar APIs
    { cat: '📅 CALENDAR',     name: 'Calendar ICS',           fn: () => get('/api/calendar/ics') },
  ];

  const results = [];
  let lastCat = '';
  for (const t of tests) {
    if (t.cat !== lastCat) { console.log(`\n${t.cat}`); lastCat = t.cat; }
    const r = await t.fn();
    const icon = r.ok ? '✅' : '❌';
    const detail = r.ok
      ? (typeof r.body === 'object' ? Object.keys(r.body).slice(0, 5).join(', ') : 'OK')
      : `[${r.status}] ${JSON.stringify(r.body).slice(0, 50)}`;
    console.log(`  ${icon} ${t.name.padEnd(28)} ${detail}`);
    results.push({ name: t.name, ok: r.ok });
  }

  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  console.log('\n═══════════════════════════════════════════');
  console.log(`   ${passed}/${results.length} PASSED  |  ${failed} FAILED`);
  if (failed === 0) console.log('   🎉 ALL SYSTEMS FULLY OPERATIONAL!');
  else { console.log('\n   ❌ FAILING:'); results.filter(r=>!r.ok).forEach(r => console.log('    •', r.name)); }
  console.log('═══════════════════════════════════════════\n');
}
run();

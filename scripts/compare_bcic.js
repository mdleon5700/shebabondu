const fs = require('fs');
const store = JSON.parse(fs.readFileSync('src/db/local_store.json', 'utf8'));
const ai = store.jobs['job-ai-bcic-14936'];
const tt = store.jobs['job-teletalk-14936'];
console.log('AI BCIC:', { id: ai?.id, title: ai?.title, pub: ai?.publicationStatus, positions: ai?.positions?.length });
console.log('TT BCIC:', { id: tt?.id, title: tt?.title, pub: tt?.publicationStatus, positions: tt?.positions?.length });


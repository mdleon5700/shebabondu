const fs = require('fs');

let f = fs.readFileSync('src/app/dashboard/profile/page.tsx', 'utf8');
const target = "    const local = storage.getUser();\n    setProfile(local);";
const replacement = `    const local = storage.getUser();
    setProfile(local);
    if (typeof window !== 'undefined') {
      const searchTab = new URLSearchParams(window.location.search).get('tab');
      if (searchTab && ['personal', 'education', 'skills', 'experience', 'preferences', 'quota'].includes(searchTab)) {
        setActiveTab(searchTab as any);
      }
    }`;

f = f.replace(target, replacement);
fs.writeFileSync('src/app/dashboard/profile/page.tsx', f, 'utf8');
console.log('Fixed profile tab query param support');

const fs = require('fs');
const path = require('path');

const apiAdminDir = path.join(__dirname, '..', 'src', 'app', 'api', 'admin');

function scanApi(dir, routeBase = '/api/admin') {
  let list = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      list = list.concat(scanApi(full, `${routeBase}/${item.name}`));
    } else if (item.name === 'route.ts' || item.name === 'route.js') {
      const content = fs.readFileSync(full, 'utf8');
      const methods = [];
      if (/export\s+(async\s+)?function\s+GET/i.test(content)) methods.push('GET');
      if (/export\s+(async\s+)?function\s+POST/i.test(content)) methods.push('POST');
      if (/export\s+(async\s+)?function\s+PUT/i.test(content)) methods.push('PUT');
      if (/export\s+(async\s+)?function\s+PATCH/i.test(content)) methods.push('PATCH');
      if (/export\s+(async\s+)?function\s+DELETE/i.test(content)) methods.push('DELETE');
      
      // Check db method calls
      const dbCalls = [...content.matchAll(/serverDB\.([a-zA-Z0-9_]+)/g)].map(m => m[1]);
      
      list.push({
        route: routeBase,
        methods,
        dbCalls: [...new Set(dbCalls)],
        file: path.relative(path.join(__dirname, '..'), full)
      });
    }
  }
  return list;
}

const apis = scanApi(apiAdminDir);
fs.writeFileSync(path.join(__dirname, '..', 'api_admin_inventory.json'), JSON.stringify(apis, null, 2), 'utf8');
console.log(`Scanned ${apis.length} API routes`);


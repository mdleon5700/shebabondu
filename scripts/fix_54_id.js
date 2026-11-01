const fs = require('fs');

let s54 = fs.readFileSync('src/lib/testing/scenarios/54-application-status-notification-synchronization-audit.ts', 'utf8');
s54 = s54.replace("notificationId: appNotif.id,", "id: appNotif.id, notificationId: appNotif.id,");
fs.writeFileSync('src/lib/testing/scenarios/54-application-status-notification-synchronization-audit.ts', s54, 'utf8');

console.log('Fixed Scenario 54 body property to id.');

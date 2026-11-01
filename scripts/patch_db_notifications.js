const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'lib', 'db.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Function 1: getUserJobReminders
const r1 = /getUserJobReminders\(candidateId:\s*string\)[^{]*\{\s*const db = loadDB\(\);/s;
if (r1.test(content)) {
  content = content.replace(r1, `getUserJobReminders(candidateId: string): import('./deadlines/types').UserJobReminder[] {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.getUserJobReminders(candidateId);
    }
    const db = loadDB();`);
  console.log('Patched getUserJobReminders');
} else {
  console.error('Failed r1');
}

// Function 2: saveUserJobReminder
const r2 = /saveUserJobReminder\(reminder:[^{]*\{\s*const db = loadDB\(\);/s;
if (r2.test(content)) {
  content = content.replace(r2, `saveUserJobReminder(reminder: import('./deadlines/types').UserJobReminder): import('./deadlines/types').UserJobReminder {
    if (reminder.candidateId && reminder.candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.saveUserJobReminder(reminder);
    }
    const db = loadDB();`);
  console.log('Patched saveUserJobReminder');
} else {
  console.error('Failed r2');
}

// Function 3: deleteUserJobReminder
const r3 = /deleteUserJobReminder\(candidateId:\s*string,\s*jobId:\s*string\)[^{]*\{\s*const db = loadDB\(\);/s;
if (r3.test(content)) {
  content = content.replace(r3, `deleteUserJobReminder(candidateId: string, jobId: string): boolean {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.deleteUserJobReminder(candidateId, jobId);
    }
    const db = loadDB();`);
  console.log('Patched deleteUserJobReminder');
} else {
  console.error('Failed r3');
}

// Function 4: getAllUserJobReminders
const r4 = /for\s*\(const\s+list\s+of\s+Object\.values\(db\.userJobReminders\s*\|\|\s*\{\}\)\)\s*\{\s*if\s*\(Array\.isArray\(list\)\)\s*all\.push\(\.\.\.list\);\s*\}\s*return all;/s;
if (r4.test(content)) {
  content = content.replace(r4, `for (const list of Object.values(db.userJobReminders || {})) {
      if (Array.isArray(list)) all.push(...list);
    }
    const synthReminders = SyntheticUserManager.getAllUserJobReminders();
    return [...all, ...synthReminders];`);
  console.log('Patched getAllUserJobReminders');
} else {
  console.error('Failed r4');
}

// Function 5: getNotificationDeliveries
const r5 = /getNotificationDeliveries\(candidateId\?:\s*string\)[^{]*\{[^}]*return list\.slice\(\)\.sort[^}]*\};/s;
// Let's inspect getNotificationDeliveries specifically
const idx5 = content.indexOf('getNotificationDeliveries(candidateId?: string)');
if (idx5 !== -1) {
  const endIdx5 = content.indexOf('enqueueNotificationDelivery', idx5);
  const block = content.substring(idx5, endIdx5);
  const rep5 = `getNotificationDeliveries(candidateId?: string): import('./deadlines/types').NotificationDeliveryItem[] {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.getNotificationDeliveries(candidateId);
    }
    const db = loadDB();
    const list = db.notificationDeliveries || [];
    const synthList = SyntheticUserManager.getNotificationDeliveries();
    const combined = candidateId ? list.filter(n => n.candidateId === candidateId) : [...list, ...synthList];
    return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },\n\n  `;
  content = content.substring(0, idx5) + rep5 + content.substring(endIdx5);
  console.log('Patched getNotificationDeliveries');
} else {
  console.error('Failed idx5');
}

// Function 6: enqueueNotificationDelivery
const r6 = /enqueueNotificationDelivery\(item:[^{]*\{\s*const db = loadDB\(\);/s;
if (r6.test(content)) {
  content = content.replace(r6, `enqueueNotificationDelivery(item: import('./deadlines/types').NotificationDeliveryItem): import('./deadlines/types').NotificationDeliveryItem {
    if (item.candidateId && item.candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.enqueueNotificationDelivery(item);
    }
    const db = loadDB();`);
  console.log('Patched enqueueNotificationDelivery');
} else {
  console.error('Failed r6');
}

// Function 7: updateNotificationDelivery
const r7 = /updateNotificationDelivery\(id:\s*string,\s*updates:[^{]*\{\s*const db = loadDB\(\);/s;
if (r7.test(content)) {
  content = content.replace(r7, `updateNotificationDelivery(id: string, updates: Partial<import('./deadlines/types').NotificationDeliveryItem>): boolean {
    if (SyntheticUserManager.updateNotificationDelivery(id, updates)) {
      return true;
    }
    const db = loadDB();`);
  console.log('Patched updateNotificationDelivery');
} else {
  console.error('Failed r7');
}

// Function 8: markCandidateNotificationRead
const r8 = /markCandidateNotificationRead\(candidateId:\s*string,\s*notificationId:\s*string\)[^{]*\{\s*const db = loadDB\(\);/s;
if (r8.test(content)) {
  content = content.replace(r8, `markCandidateNotificationRead(candidateId: string, notificationId: string): boolean {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.markCandidateNotificationRead(candidateId, notificationId);
    }
    const db = loadDB();`);
  console.log('Patched markCandidateNotificationRead');
} else {
  console.error('Failed r8');
}

// Function 9: markAllCandidateNotificationsRead
const r9 = /markAllCandidateNotificationsRead\(candidateId:\s*string\)[^{]*\{\s*const db = loadDB\(\);/s;
if (r9.test(content)) {
  content = content.replace(r9, `markAllCandidateNotificationsRead(candidateId: string): boolean {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.markAllCandidateNotificationsRead(candidateId);
    }
    const db = loadDB();`);
  console.log('Patched markAllCandidateNotificationsRead');
} else {
  console.error('Failed r9');
}

// Function 10: deleteCandidateNotification
const r10 = /deleteCandidateNotification\(candidateId:\s*string,\s*notificationId:\s*string\)[^{]*\{\s*const db = loadDB\(\);/s;
if (r10.test(content)) {
  content = content.replace(r10, `deleteCandidateNotification(candidateId: string, notificationId: string): boolean {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.deleteCandidateNotification(candidateId, notificationId);
    }
    const db = loadDB();`);
  console.log('Patched deleteCandidateNotification');
} else {
  console.error('Failed r10');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done patching db.ts');

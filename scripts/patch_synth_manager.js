const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'lib', 'testing', 'synthetic', 'synthetic-user-manager.ts');
let content = fs.readFileSync(filePath, 'utf8');

const target = `  static markAllCandidateNotificationsRead(candidateId: string): boolean {
    const store = this.loadNotifsStore();
    if (!store[candidateId]) return false;
    store[candidateId].forEach((n: any) => { n.read = true; });
    this.inMemoryNotifs = store;
    this.persistNotifsStore();
    return true;
  }`;

const replacement = `  static markAllCandidateNotificationsRead(candidateId: string): boolean {
    const store = this.loadNotifsStore();
    if (!store[candidateId]) return false;
    store[candidateId].forEach((n: any) => { n.read = true; });
    this.inMemoryNotifs = store;
    this.persistNotifsStore();
    return true;
  }

  static markCandidateNotificationRead(candidateId: string, notificationId: string): boolean {
    const store = this.loadNotifsStore();
    if (!store[candidateId]) return false;
    const item = store[candidateId].find((n: any) => n.id === notificationId);
    if (item) {
      item.read = true;
      this.inMemoryNotifs = store;
      this.persistNotifsStore();
      return true;
    }
    return false;
  }

  static deleteCandidateNotification(candidateId: string, notificationId: string): boolean {
    const store = this.loadNotifsStore();
    if (!store[candidateId]) return false;
    const initialLen = store[candidateId].length;
    store[candidateId] = store[candidateId].filter((n: any) => n.id !== notificationId);
    if (store[candidateId].length < initialLen) {
      this.inMemoryNotifs = store;
      this.persistNotifsStore();
      return true;
    }
    return false;
  }

  private static synthReminders: Record<string, any[]> = {};
  private static synthDeliveries: any[] = [];

  static getUserJobReminders(candidateId: string): any[] {
    return this.synthReminders[candidateId] || [];
  }

  static getAllUserJobReminders(): any[] {
    const all: any[] = [];
    for (const list of Object.values(this.synthReminders)) {
      if (Array.isArray(list)) all.push(...list);
    }
    return all;
  }

  static saveUserJobReminder(reminder: any): any {
    if (!this.synthReminders[reminder.candidateId]) {
      this.synthReminders[reminder.candidateId] = [];
    }
    this.synthReminders[reminder.candidateId] = this.synthReminders[reminder.candidateId].filter(
      (r: any) => r.jobId !== reminder.jobId
    );
    this.synthReminders[reminder.candidateId].push(reminder);
    return reminder;
  }

  static deleteUserJobReminder(candidateId: string, jobId: string): boolean {
    if (!this.synthReminders[candidateId]) return false;
    const initLen = this.synthReminders[candidateId].length;
    this.synthReminders[candidateId] = this.synthReminders[candidateId].filter((r: any) => r.jobId !== jobId);
    return this.synthReminders[candidateId].length < initLen;
  }

  static getNotificationDeliveries(candidateId?: string): any[] {
    if (candidateId) {
      return this.synthDeliveries.filter((d: any) => d.candidateId === candidateId);
    }
    return this.synthDeliveries.slice();
  }

  static enqueueNotificationDelivery(item: any): any {
    const existing = this.synthDeliveries.find((d: any) => d.dedupeKey === item.dedupeKey);
    if (existing) return existing;
    this.synthDeliveries.unshift(item);
    if (this.synthDeliveries.length > 500) {
      this.synthDeliveries = this.synthDeliveries.slice(0, 500);
    }
    return item;
  }

  static updateNotificationDelivery(id: string, updates: any): boolean {
    const item = this.synthDeliveries.find((d: any) => d.id === id);
    if (item) {
      Object.assign(item, updates);
      return true;
    }
    return false;
  }`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully patched synthetic-user-manager.ts');
} else {
  console.error('Target block not found!');
  process.exit(1);
}

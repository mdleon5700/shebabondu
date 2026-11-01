const fs = require('fs');
const filePath = 'src/lib/testing/synthetic/synthetic-user-manager.ts';
let c = fs.readFileSync(filePath, 'utf8');

const appsStoreCode = `
  private static synthApplications: Record<string, any[]> = {};
  private static synthAppsStorePath = path.join(process.cwd(), 'src', 'db', 'synthetic_applications_store.json');
  private static lastAppsMtimeMs = 0;

  private static loadSynthApps(): Record<string, any[]> {
    if (fs.existsSync(this.synthAppsStorePath)) {
      try {
        const stat = fs.statSync(this.synthAppsStorePath);
        if (this.synthApplications && Object.keys(this.synthApplications).length > 0 && stat.mtimeMs === this.lastAppsMtimeMs) {
          return this.synthApplications;
        }
        const raw = fs.readFileSync(this.synthAppsStorePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.synthApplications = parsed;
          this.lastAppsMtimeMs = stat.mtimeMs;
          return this.synthApplications;
        }
      } catch (e) {
        return this.synthApplications || {};
      }
    }
    return this.synthApplications || {};
  }

  private static persistSynthApps() {
    try {
      fs.writeFileSync(this.synthAppsStorePath, JSON.stringify(this.synthApplications, null, 2), 'utf8');
      const stat = fs.statSync(this.synthAppsStorePath);
      this.lastAppsMtimeMs = stat.mtimeMs;
    } catch (e) {
      console.error('[SyntheticUserManager] Failed to persist synthetic applications:', e);
    }
  }

  static getApplications(candidateId: string): any[] {
    const store = this.loadSynthApps();
    return store[candidateId] || [];
  }

  static addApplication(candidateId: string, app: any): any[] {
    const store = this.loadSynthApps();
    const list = store[candidateId] || [];
    const updated = [app, ...list.filter(a => a.id !== app.id)];
    store[candidateId] = updated;
    this.synthApplications = store;
    this.persistSynthApps();
    return updated;
  }

  static updateAppStatus(
    candidateId: string,
    appId: string,
    status: any,
    verificationType?: any,
    notes?: string,
    isAdmin?: boolean,
    extra?: any
  ): any | null {
    const store = this.loadSynthApps();
    for (const cid of Object.keys(store)) {
      const list = store[cid] || [];
      const idx = list.findIndex(a => a.id === appId);
      if (idx !== -1) {
        const current = list[idx];
        const updatedHistory = current.statusHistory ? [...current.statusHistory] : [];
        if (extra?.statusHistory) {
          updatedHistory.push(...extra.statusHistory);
        } else {
          updatedHistory.push({
            status,
            date: new Date().toISOString(),
            notes: notes || ("Status updated to " + status)
          });
        }
        const updatedApp = {
          ...current,
          status,
          verificationType: verificationType || current.verificationType || 'officially_verified',
          notes: notes !== undefined ? notes : current.notes,
          ...(extra || {}),
          statusHistory: updatedHistory
        };
        list[idx] = updatedApp;
        store[cid] = list;
        this.synthApplications = store;
        this.persistSynthApps();

        const statusMessages: Record<string, string> = {
          completed: 'আপনার আবেদনটি সম্পন্ন হয়েছে এবং প্রাপ্তি স্বীকারপত্র তৈরি হয়েছে।',
          processing: 'আপনার আবেদনটি যাচাইকরণ প্রক্রিয়ায় রয়েছে।',
          rejected: 'আবেদন তথ্য অসম্পূর্ণ বা অসামঞ্জস্যের কারণে বাতিল হয়েছে।'
        };

        this.addCandidateNotification(cid, {
          title: "আবেদন স্ট্যাটাস: " + (status === 'completed' ? 'সম্পন্ন' : status === 'processing' ? 'প্রক্রিয়াধীন' : status === 'rejected' ? 'বাতিল' : status),
          message: (updatedApp.jobTitle || 'চাকরির আবেদন') + ": " + (statusMessages[status] || 'স্ট্যাটাস আপডেট করা হয়েছে।'),
          type: 'application',
          link: '/dashboard/applications'
        });

        return updatedApp;
      }
    }
    return null;
  }

  static getAllApplications(): any[] {
    const store = this.loadSynthApps();
    const all = [];
    for (const list of Object.values(store)) {
      if (Array.isArray(list)) all.push(...list);
    }
    return all;
  }

  static getApplicationById(appId: string): any | null {
    const store = this.loadSynthApps();
    for (const list of Object.values(store)) {
      const found = list.find((a: any) => a.id === appId);
      if (found) return found;
    }
    return null;
  }

  static saveApplication(app: any): any {
    const cid = app.candidateId || 'SYNTH-GUEST';
    this.addApplication(cid, app);
    return app;
  }
`;

// Replace old synthApplications block
const startIdx = c.indexOf('  private static synthApplications: Record');
const endIdx = c.indexOf('  // Strict isolation assertion verifying real database is 100% unpolluted');
if (startIdx !== -1 && endIdx !== -1) {
  c = c.substring(0, startIdx) + appsStoreCode + '\n' + c.substring(endIdx);
  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Successfully replaced synthApplications block in SyntheticUserManager.');
} else {
  console.log('Block boundaries not found.');
}

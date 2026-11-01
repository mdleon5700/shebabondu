const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'lib', 'testing', 'synthetic', 'synthetic-user-manager.ts');
let content = fs.readFileSync(filePath, 'utf8');

const insertion = `
  private static synthApplications: Record<string, any[]> = {};
  private static synthAppsStorePath = path.join(process.cwd(), 'src', 'db', 'synthetic_applications_store.json');

  private static ensureSynthAppsLoaded() {
    if (Object.keys(this.synthApplications).length === 0 && fs.existsSync(this.synthAppsStorePath)) {
      try {
        const raw = fs.readFileSync(this.synthAppsStorePath, 'utf8');
        this.synthApplications = JSON.parse(raw);
      } catch (e) {
        this.synthApplications = {};
      }
    }
  }

  private static persistSynthApps() {
    try {
      fs.writeFileSync(this.synthAppsStorePath, JSON.stringify(this.synthApplications, null, 2), 'utf8');
    } catch (e) {
      console.error('[SyntheticUserManager] Failed to persist synthetic applications:', e);
    }
  }

  static getApplications(candidateId: string): any[] {
    this.ensureSynthAppsLoaded();
    return this.synthApplications[candidateId] || [];
  }

  static addApplication(candidateId: string, app: any): any[] {
    this.ensureSynthAppsLoaded();
    const list = this.synthApplications[candidateId] || [];
    const updated = [app, ...list.filter(a => a.id !== app.id)];
    this.synthApplications[candidateId] = updated;
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
    this.ensureSynthAppsLoaded();
    for (const cid of Object.keys(this.synthApplications)) {
      const list = this.synthApplications[cid] || [];
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
        this.synthApplications[cid] = list;
        this.persistSynthApps();

        const statusMessages = {
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
    this.ensureSynthAppsLoaded();
    const all = [];
    for (const list of Object.values(this.synthApplications)) {
      if (Array.isArray(list)) all.push(...list);
    }
    return all;
  }

  static getApplicationById(appId: string): any | null {
    this.ensureSynthAppsLoaded();
    for (const list of Object.values(this.synthApplications)) {
      const found = list.find(a => a.id === appId);
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

const target = '  // Strict isolation assertion verifying real database is 100% unpolluted';
if (content.includes(target) && !content.includes('synthApplications: Record')) {
  content = content.replace(target, insertion + '\n' + target);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated SyntheticUserManager with application methods.');
} else {
  console.log('Target not found or already inserted.');
}

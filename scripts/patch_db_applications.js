const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'lib', 'db.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Patch getApplications
const getAppsTarget = '  getApplications(candidateId: string): ApplicationRequest[] {\n    const db = loadDB();';
const getAppsReplacement = `  getApplications(candidateId: string): ApplicationRequest[] {
    if (candidateId && candidateId.startsWith('SYNTH-')) {
      return SyntheticUserManager.getApplications(candidateId);
    }
    const db = loadDB();`;

if (content.includes(getAppsTarget)) {
  content = content.replace(getAppsTarget, getAppsReplacement);
  console.log('Patched getApplications.');
}

// 2. Patch addApplication
const addAppTarget = '  addApplication(candidateId: string, app: ApplicationRequest): ApplicationRequest[] {\n    const db = loadDB();';
const addAppReplacement = `  addApplication(candidateId: string, app: ApplicationRequest): ApplicationRequest[] {
    if ((candidateId && candidateId.startsWith('SYNTH-')) || app.id?.startsWith('SYNTH-') || (app as any).isSynthetic) {
      return SyntheticUserManager.addApplication(candidateId, app);
    }
    const db = loadDB();`;

if (content.includes(addAppTarget)) {
  content = content.replace(addAppTarget, addAppReplacement);
  console.log('Patched addApplication.');
}

// 3. Patch updateAppStatus
const updateAppTarget = '  updateAppStatus(\n    candidateId: string, \n    appId: string, \n    status: ApplicationRequest[\'status\'], \n    verificationType?: ApplicationRequest[\'verificationType\'], \n    notes?: string, \n    isAdmin?: boolean,\n    extra?: Partial<ApplicationRequest>\n  ): ApplicationRequest | null {\n    const db = loadDB();';
const updateAppReplacement = `  updateAppStatus(
    candidateId: string, 
    appId: string, 
    status: ApplicationRequest['status'], 
    verificationType?: ApplicationRequest['verificationType'], 
    notes?: string, 
    isAdmin?: boolean,
    extra?: Partial<ApplicationRequest>
  ): ApplicationRequest | null {
    if (candidateId?.startsWith('SYNTH-') || appId?.startsWith('SYNTH-') || SyntheticUserManager.getApplicationById(appId)) {
      return SyntheticUserManager.updateAppStatus(candidateId, appId, status, verificationType, notes, isAdmin, extra);
    }
    const db = loadDB();`;

if (content.includes(updateAppTarget)) {
  content = content.replace(updateAppTarget, updateAppReplacement);
  console.log('Patched updateAppStatus.');
}

// 4. Patch getAllApplications
const getAllAppsTarget = '    if (all.length === 0) return [...mockApplications];\n\n    return all.sort((a, b) => (b.id > a.id ? 1 : -1));';
const getAllAppsReplacement = `    const synthApps = SyntheticUserManager.getAllApplications();
    const combined = [...all, ...synthApps];
    if (combined.length === 0) return [...mockApplications];
    return combined.sort((a, b) => (b.id > a.id ? 1 : -1));`;

if (content.includes(getAllAppsTarget)) {
  content = content.replace(getAllAppsTarget, getAllAppsReplacement);
  console.log('Patched getAllApplications.');
}

// 5. Patch getApplicationById
const getAppByIdTarget = '  getApplicationById(id: string): ApplicationRequest | null {\n    const all = this.getAllApplications();\n    return all.find(a => a.id === id) || null;\n  },';
const getAppByIdReplacement = `  getApplicationById(id: string): ApplicationRequest | null {
    const synthApp = SyntheticUserManager.getApplicationById(id);
    if (synthApp) return synthApp;
    const all = this.getAllApplications();
    return all.find(a => a.id === id) || null;
  },`;

if (content.includes(getAppByIdTarget)) {
  content = content.replace(getAppByIdTarget, getAppByIdReplacement);
  console.log('Patched getApplicationById.');
}

// 6. Patch saveApplication
const saveAppTarget = '  saveApplication(app: ApplicationRequest): ApplicationRequest {\n    const db = loadDB();';
const saveAppReplacement = `  saveApplication(app: ApplicationRequest): ApplicationRequest {
    if (app.candidateId?.startsWith('SYNTH-') || app.id?.startsWith('SYNTH-') || (app as any).isSynthetic) {
      return SyntheticUserManager.saveApplication(app);
    }
    const db = loadDB();`;

if (content.includes(saveAppTarget)) {
  content = content.replace(saveAppTarget, saveAppReplacement);
  console.log('Patched saveApplication.');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('db.ts patch complete.');

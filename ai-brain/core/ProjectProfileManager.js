const fs = require('fs');
const path = require('path');

const FORBIDDEN_COMMAND_PATTERNS = [
  /rm\s+-rf\s+[\/\\]/i,
  /del\s+\/s/i,
  /format\s+[a-z]:/i,
  /shutdown/i,
  /drop\s+database/i,
  /truncate\s+table/i
];

class ProjectProfileManager {
  constructor(storageDir = path.join(__dirname, '..', 'storage', 'profiles')) {
    this.storageDir = storageDir;
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  createOrUpdateProfile(profileData) {
    if (!profileData.projectId) {
      throw new Error('projectId is required');
    }
    if (!profileData.workspacePath || !fs.existsSync(profileData.workspacePath)) {
      throw new Error(`Valid workspacePath is required: ${profileData.workspacePath}`);
    }

    const absWorkspace = path.resolve(profileData.workspacePath);
    const existing = this.getProfile(profileData.projectId) || {};

    const profile = {
      projectId: profileData.projectId,
      displayName: profileData.displayName || profileData.projectId,
      workspacePath: absWorkspace,
      framework: profileData.framework || 'Generic',
      language: profileData.language || 'JavaScript',
      mode: profileData.mode || 'MAINTENANCE',
      allowedFilesystemBoundary: absWorkspace,
      permissions: {
        canEditFiles: true,
        canRunBuild: true,
        canRunTests: true,
        canRunExternalCommands: false,
        canDeploy: false,
        requiresHumanApprovalForDestructive: true,
        ...(profileData.permissions || {})
      },
      allowedCommands: profileData.allowedCommands || [
        'npm run build',
        'npm run test',
        'npm run lint',
        'npm test',
        'npx tsc --noEmit',
        'node'
      ],
      acceptanceCriteria: profileData.acceptanceCriteria || [],
      knownIssues: existing.knownIssues || [],
      lastVerifiedRevision: existing.lastVerifiedRevision || null,
      createdAt: existing.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const filePath = path.join(this.storageDir, `${profile.projectId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(profile, null, 2), 'utf8');
    return profile;
  }

  getProfile(projectId) {
    const filePath = path.join(this.storageDir, `${projectId}.json`);
    if (!fs.existsSync(filePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      return null;
    }
  }

  listProfiles() {
    if (!fs.existsSync(this.storageDir)) return [];
    const files = fs.readdirSync(this.storageDir).filter(f => f.endsWith('.json'));
    return files.map(f => {
      try {
        return JSON.parse(fs.readFileSync(path.join(this.storageDir, f), 'utf8'));
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
  }

  validatePath(projectId, targetPath) {
    const profile = this.getProfile(projectId);
    if (!profile) throw new Error(`Project profile not found: ${projectId}`);
    
    const absTarget = path.resolve(targetPath);
    const absBoundary = path.resolve(profile.allowedFilesystemBoundary);

    const isInside = absTarget === absBoundary || absTarget.startsWith(absBoundary + path.sep);
    return {
      allowed: isInside,
      targetPath: absTarget,
      boundary: absBoundary,
      reason: isInside ? 'Path is within allowed project boundary' : 'ACCESS DENIED: Path is outside allowed workspace'
    };
  }

  validateCommand(projectId, commandLine) {
    const profile = this.getProfile(projectId);
    if (!profile) throw new Error(`Project profile not found: ${projectId}`);

    const trimmed = (commandLine || '').trim();

    // Check forbidden patterns
    for (const pattern of FORBIDDEN_COMMAND_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          allowed: false,
          reason: `SECURITY VIOLATION: Command matches forbidden pattern ${pattern}`
        };
      }
    }

    // Check if command starts with an allowed base or is registered
    const isExplicitlyAllowed = profile.allowedCommands.some(cmd => 
      trimmed === cmd || trimmed.startsWith(cmd + ' ') || trimmed.startsWith('node ')
    );

    if (!isExplicitlyAllowed && !profile.permissions.canRunExternalCommands) {
      return {
        allowed: false,
        reason: `Command '${trimmed}' is not in the allowlist for project ${projectId}`
      };
    }

    return { allowed: true, command: trimmed };
  }
}

module.exports = ProjectProfileManager;

import fs from 'fs';
import path from 'path';

export interface DiscoveredRoute {
  path: string;
  panel: 'public' | 'user' | 'admin';
  authRequired: boolean;
  requiredRole?: 'candidate' | 'admin';
  type: 'page' | 'api';
  testReadiness: 'READY' | 'REQUIRES_AUTH' | 'REQUIRES_ADMIN';
  description?: string;
}

export class PageDiscoveryEngine {
  private appDir: string;

  constructor(appDir?: string) {
    this.appDir = appDir || path.join(process.cwd(), 'src', 'app');
  }

  discoverAllRoutes(): DiscoveredRoute[] {
    const discovered: DiscoveredRoute[] = [];
    if (!fs.existsSync(this.appDir)) return discovered;

    const walk = (dir: string, currentPath = '') => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        const routePart = entry.name.startsWith('(') && entry.name.endsWith(')') ? '' : entry.name;
        const nextPath = currentPath ? `${currentPath}/${routePart}` : routePart;

        if (entry.isDirectory()) {
          walk(full, nextPath);
        } else if (entry.name === 'page.tsx') {
          const webPath = '/' + nextPath.replace(/\/page\.tsx$/, '').replace(/\/index$/, '').replace(/^[\\/]/, '');
          const cleanPath = webPath === '/page.tsx' || webPath === '/' ? '/' : webPath.replace(/\/page$/, '');
          
          let panel: 'public' | 'user' | 'admin' = 'public';
          let authRequired = false;
          let requiredRole: 'candidate' | 'admin' | undefined;
          let testReadiness: 'READY' | 'REQUIRES_AUTH' | 'REQUIRES_ADMIN' = 'READY';

          if (cleanPath.startsWith('/admin')) {
            panel = 'admin';
            authRequired = true;
            requiredRole = 'admin';
            testReadiness = 'REQUIRES_ADMIN';
          } else if (cleanPath.startsWith('/dashboard')) {
            panel = 'user';
            authRequired = true;
            requiredRole = 'candidate';
            testReadiness = 'REQUIRES_AUTH';
          }

          discovered.push({
            path: cleanPath,
            panel,
            authRequired,
            requiredRole,
            type: 'page',
            testReadiness
          });
        }
      }
    };

    walk(this.appDir);
    return discovered.sort((a, b) => a.path.localeCompare(b.path));
  }
}
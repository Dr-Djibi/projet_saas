import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { siteConfig } from '../../config/site';

const execAsync = promisify(exec);

export class InstanceOrchestrator {
  private baseDir = path.join(process.cwd(), 'menma-users-instances');

  constructor() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async deployInstance(userId: string, config: { botName: string; ownerNumber: string; sessionId: string }) {
    const userDir = path.join(this.baseDir, `user_${userId}`);
    
    // 1. Création dossier
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    // 2. Clone du repo
    await execAsync(`git clone ${siteConfig.botRepoUrl} .`, { cwd: userDir });

    // 3. Symlink node_modules (si prod)
    if (process.env.NODE_ENV === 'production') {
      const globalNodeModules = '/home/menma/global-dependencies/node_modules';
      const userNodeModules = path.join(userDir, 'node_modules');
      if (fs.existsSync(globalNodeModules) && !fs.existsSync(userNodeModules)) {
        fs.symlinkSync(globalNodeModules, userNodeModules, 'dir');
      }
    }

    // 4. Création config .env
    const envContent = `
SESSION_ID=${config.sessionId}
OWNER_NUMBER=${config.ownerNumber}
BOT_NAME=${config.botName}
DATABASE_PATH="./database.db"
`;
    fs.writeFileSync(path.join(userDir, '.env'), envContent);

    // 5. Lancement via PM2
    const processName = `bot-${userId}`;
    await execAsync(`pm2 start index.js --name "${processName}" --watch`, { cwd: userDir });
    
    return processName;
  }
}

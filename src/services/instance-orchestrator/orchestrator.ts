import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { SystemSettingsService } from '../settings/system-settings';
import { syncRepository } from '../git/sync';
import { EnvService } from '../env/env-service';

const execFileAsync = promisify(execFile);

export class InstanceOrchestrator {
  
  private async getBaseDir(): Promise<string> {
    const baseDir = await SystemSettingsService.getUserInstancesBaseDir();
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    return baseDir;
  }

  private async getUserDir(userId: string): Promise<string> {
    const baseDir = await this.getBaseDir();
    return path.join(baseDir, `user_${userId}`);
  }

  /**
   * Provisionne l'instance du bot et du site de session par clonage Git.
   */
  async provisionInstance(userId: string, botType: 'menma' | 'ovl'): Promise<{ botDir: string; sessionDir: string }> {
    const userDir = await this.getUserDir(userId);
    const botDir = path.join(userDir, 'bot');
    const sessionDir = path.join(userDir, 'session');
    const logsDir = path.join(userDir, 'logs');

    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    // 1. Cloner le Bot (Menma ou Ovl)
    const botRepoUrl = botType === 'menma' 
      ? await SystemSettingsService.getMenmaRepoUrl() 
      : await SystemSettingsService.getOvlRepoUrl();
    
    console.log(`[Orchestrator] Provisioning bot (${botType}) for user ${userId}...`);
    await syncRepository(botRepoUrl, botDir);

    // 2. Cloner le Site de Session
    const sessionRepoUrl = await SystemSettingsService.getSessionRepoUrl();
    console.log(`[Orchestrator] Provisioning session site for user ${userId}...`);
    await syncRepository(sessionRepoUrl, sessionDir);

    // 3. Liaison node_modules (Bot)
    await this.ensureNodeModules(botDir);
    
    // 4. Liaison node_modules (Session)
    await this.ensureNodeModules(sessionDir);

    return { botDir, sessionDir };
  }

  /**
   * Crée un lien symbolique vers le node_modules global pour économiser l'espace.
   */
  private async ensureNodeModules(targetDir: string) {
    const nodeModulesPath = path.join(targetDir, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      const globalPath = await SystemSettingsService.getGlobalNodeModulesPath();
      
      try {
        if (fs.existsSync(globalPath)) {
          fs.symlinkSync(globalPath, nodeModulesPath, 'dir');
        } else {
          // Fallback dev local
          const devPath = path.join(process.cwd(), 'node_modules');
          if (fs.existsSync(devPath)) {
            fs.symlinkSync(devPath, nodeModulesPath, 'dir');
          }
        }
      } catch (err: any) {
        console.warn(`[Orchestrator] Symlink failed for ${targetDir}: ${err.message}`);
      }
    }
  }

  /**
   * Configure le .env du bot à partir de .env.example et des valeurs de la base de données.
   */
  async configureBotEnv(userId: string, userConfig: Record<string, string>) {
    const userDir = await this.getUserDir(userId);
    const botDir = path.join(userDir, 'bot');
    const examplePath = path.join(botDir, '.env.example');
    const targetPath = path.join(botDir, '.env');

    // Valeurs par défaut injectées
    const finalConfig: Record<string, string> = {
      ...userConfig,
      PORT: (3000 + Math.floor(Math.random() * 1000)).toString(),
      DATABASE_PATH: "./database.db",
    };

    await EnvService.generateEnv(targetPath, examplePath, finalConfig);
  }

  /**
   * Démarre/Redémarre l'instance du bot via PM2.
   */
  async startBot(userId: string): Promise<string> {
    const userDir = await this.getUserDir(userId);
    const botDir = path.join(userDir, 'bot');
    const pm2Prefix = await SystemSettingsService.getPm2Prefix();
    const processName = `${pm2Prefix}${userId}`;
    const outLog = path.join(userDir, 'logs', 'bot-out.log');
    const errLog = path.join(userDir, 'logs', 'bot-err.log');

    try {
      await execFileAsync('pm2', ['describe', processName]);
      await execFileAsync('pm2', ['restart', processName]);
    } catch {
      await execFileAsync('pm2', ['start', 'index.js', '--name', processName, '--output', outLog, '--error', errLog], { cwd: botDir });
    }

    return processName;
  }

  /**
   * Démarre l'instance de session via PM2 avec un port spécifique.
   */
  async startSessionSite(userId: string): Promise<number> {
    const userDir = await this.getUserDir(userId);
    const sessionDir = path.join(userDir, 'session');
    const pm2Prefix = await SystemSettingsService.getPm2Prefix();
    const processName = `session-${pm2Prefix}${userId}`;
    
    // Attribution de port (à perfectionner avec une table de ports en DB)
    const port = 4000 + Math.floor(Math.random() * 1000);
    
    // Injecter le port dans le .env du site de session
    await EnvService.writeEnv(path.join(sessionDir, '.env'), { PORT: port.toString(), USER_ID: userId });

    try {
      await execFileAsync('pm2', ['describe', processName]);
      await execFileAsync('pm2', ['restart', processName]);
    } catch {
      await execFileAsync('pm2', ['start', 'index.js', '--name', processName], { cwd: sessionDir });
    }

    return port;
  }

  /**
   * Arrête toutes les instances liées à un utilisateur.
   */
  async stopAll(userId: string) {
    const pm2Prefix = await SystemSettingsService.getPm2Prefix();
    try { await execFileAsync('pm2', ['stop', `${pm2Prefix}${userId}`]); } catch {}
    try { await execFileAsync('pm2', ['stop', `session-${pm2Prefix}${userId}`]); } catch {}
  }

  /**
   * Supprime l'instance PM2 et les fichiers de l'utilisateur.
   */
  async destroyInstance(userId: string) {
    const pm2Prefix = await SystemSettingsService.getPm2Prefix();
    try { await execFileAsync('pm2', ['delete', `${pm2Prefix}${userId}`]); } catch {}
    try { await execFileAsync('pm2', ['delete', `session-${pm2Prefix}${userId}`]); } catch {}

    const userDir = await this.getUserDir(userId);
    if (fs.existsSync(userDir)) {
      fs.rmSync(userDir, { recursive: true, force: true });
      console.log(`[Orchestrator] Instance destroyed for user ${userId}`);
    }
  }
}

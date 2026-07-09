import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { SystemSettingsService } from '../settings/system-settings';
import { syncRepository } from '../git/sync';
import { EnvService } from '../env/env-service';
import { WhatsappBot } from '../../lib/models';
import { Op } from 'sequelize';

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
   * Trouve le premier port disponible dans la plage 3000-5000.
   */
  private async findAvailablePort(): Promise<number> {
    const startPort = 3000;
    const endPort = 5000;

    // Récupérer tous les ports déjà utilisés
    const usedBots = await WhatsappBot.findAll({
      attributes: ['port'],
      where: {
        port: {
          [Op.not]: null
        }
      }
    });

    const usedPorts = new Set(usedBots.map(b => b.port as number));

    for (let port = startPort; port <= endPort; port++) {
      if (!usedPorts.has(port)) {
        return port;
      }
    }

    throw new Error("Aucun port disponible dans la plage 3000-5000");
  }

  /**
   * Provisionne l'instance du bot en copiant depuis un dossier "template".
   * Le site de session est centralisé sur Koyeb — aucun clonage nécessaire.
   */
  async provisionInstance(userId: string, botType: 'menma' | 'ovl'): Promise<{ botDir: string }> {
    const baseDir = await this.getBaseDir();
    const userDir = await this.getUserDir(userId);
    const botDir = path.join(userDir, 'bot');
    const logsDir = path.join(userDir, 'logs');
    const templateDir = path.join(baseDir, 'templates', botType);

    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    // 1. Mettre à jour (ou cloner) le template global une seule fois
    const botRepoUrl = botType === 'menma' 
      ? await SystemSettingsService.getMenmaRepoUrl() 
      : await SystemSettingsService.getOvlRepoUrl();
    
    console.log(`[Orchestrator] Syncing global template for ${botType}...`);
    await syncRepository(botRepoUrl, templateDir);

    // 2. Copier le contenu du template vers le dossier utilisateur (sans le dossier .git)
    console.log(`[Orchestrator] Provisioning bot (${botType}) for user ${userId} from template...`);
    fs.cpSync(templateDir, botDir, { 
      recursive: true, 
      force: true,
      filter: (src) => !src.endsWith('.git') && !src.includes(`${path.sep}.git${path.sep}`)
    });

    // 3. Liaison node_modules (Bot) pour partager les dépendances globalement
    await this.ensureNodeModules(botDir);

    return { botDir };
  }

  /**
   * Crée un lien symbolique vers le node_modules global pour économiser l'espace.
   */
  private async ensureNodeModules(targetDir: string) {
    const nodeModulesPath = path.join(targetDir, 'node_modules');
    
    // Supprimer si c'est un lien mort ou un fichier
    if (fs.existsSync(nodeModulesPath) || fs.lstatSync(nodeModulesPath, { throwIfNoEntry: false })) {
       try {
         const stats = fs.lstatSync(nodeModulesPath);
         if (stats.isSymbolicLink()) {
           // On laisse tel quel si c'est déjà un symlink
           return;
         } else {
           // Si c'est un dossier réel (peu probable avec notre flow), on le garde ou on le supprime ?
           // Pour la robustesse on le supprime pour mettre le symlink
           fs.rmSync(nodeModulesPath, { recursive: true, force: true });
         }
       } catch {
         // Ignore errors during lstatSync
       }
    }

    const globalPath = await SystemSettingsService.getGlobalNodeModulesPath();
    
    try {
      if (fs.existsSync(globalPath)) {
        fs.symlinkSync(globalPath, nodeModulesPath, 'dir');
      } else {
        // Fallback dev local
        const devPath = path.join(process.cwd(), 'node_modules');
        if (fs.existsSync(devPath)) {
          fs.symlinkSync(devPath, nodeModulesPath, 'dir');
        } else {
           console.error(`[Orchestrator] global node_modules not found at ${globalPath}`);
        }
      }
    } catch (err) {
      console.warn(`[Orchestrator] Symlink failed for ${targetDir}: ${(err as Error).message}`);
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

    // Récupérer ou attribuer un port
    const bot = await WhatsappBot.findOne({ where: { userId } });
    if (!bot) throw new Error(`Bot not found for user ${userId}`);

    let port = bot.port;
    if (!port) {
      port = await this.findAvailablePort();
      bot.port = port;
      await bot.save();
    }

    // Valeurs par défaut injectées
    const finalConfig: Record<string, string> = {
      ...userConfig,
      PORT: port.toString(),
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
      // Vérifier si le processus existe déjà
      await execFileAsync('pm2', ['describe', processName]);
      console.log(`[Orchestrator] Restarting bot for user ${userId}...`);
      await execFileAsync('pm2', ['restart', processName]);
    } catch {
      console.log(`[Orchestrator] Starting new bot instance for user ${userId}...`);
      // L'instance n'existe pas, on la crée
      await execFileAsync('pm2', [
        'start', 'index.js', 
        '--name', processName, 
        '--output', outLog, 
        '--error', errLog,
        '--interpreter', 'node'
      ], { cwd: botDir });
    }

    return processName;
  }

  /**
   * Sauvegarde les identifiants Baileys (creds.json) pour le bot.
   */
  async saveBotCredentials(userId: string, creds: unknown) {
    const userDir = await this.getUserDir(userId);
    const botDir = path.join(userDir, 'bot');
    const authDir = path.join(botDir, 'auth');

    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    const credsPath = path.join(authDir, 'creds.json');
    fs.writeFileSync(credsPath, JSON.stringify(creds, null, 2));
    console.log(`[Orchestrator] Credentials saved for user ${userId}`);
  }

  /**
   * Arrête l'instance du bot.
   */
  async stopBot(userId: string) {
    const pm2Prefix = await SystemSettingsService.getPm2Prefix();
    const processName = `${pm2Prefix}${userId}`;
    try {
      await execFileAsync('pm2', ['stop', processName]);
    } catch (err) {
      console.warn(`[Orchestrator] Failed to stop bot ${processName}:`, (err as Error).message);
    }
  }

  /**
   * Alias pour startBot utilisé par l'API.
   */
  async startInstance(userId: string) {
    return this.startBot(userId);
  }

  /**
   * Alias pour stopBot utilisé par l'API.
   */
  async stopInstance(userId: string) {
    return this.stopBot(userId);
  }

  /**
   * Vérifie le statut réel du processus PM2 en direct.
   */
  async getLiveStatus(userId: string): Promise<'online' | 'stopped' | 'errored' | 'unknown'> {
    const pm2Prefix = await SystemSettingsService.getPm2Prefix();
    const processName = `${pm2Prefix}${userId}`;

    try {
      const { stdout } = await execFileAsync('pm2', ['jlist']);
      const list = JSON.parse(stdout);
      const processInfo = list.find((p: any) => p.name === processName);
      
      if (!processInfo) {
        return 'stopped';
      }

      const status = processInfo.pm2_env?.status;
      if (status === 'online') return 'online';
      if (status === 'stopped' || status === 'stopping') return 'stopped';
      if (status === 'errored') return 'errored';
      
      return 'unknown';
    } catch (err) {
      console.warn(`[Orchestrator] Failed to get live status for ${processName}:`, (err as Error).message);
      return 'unknown';
    }
  }

  /**
   * Récupère les logs de l'instance.
   */
  async getLogs(userId: string, type: 'out' | 'err' = 'out'): Promise<string> {
    const userDir = await this.getUserDir(userId);
    const logFile = path.join(userDir, 'logs', `bot-${type}.log`);
    
    if (!fs.existsSync(logFile)) {
      return "Aucun log trouvé.";
    }

    try {
      const content = fs.readFileSync(logFile, 'utf8');
      // Retourner les 200 dernières lignes
      const lines = content.split('\n');
      return lines.slice(-200).join('\n');
    } catch (error) {
      return `Erreur lors de la lecture des logs: ${(error as Error).message}`;
    }
  }

  /**
   * Construit l'URL du site de session centralisé (Koyeb) avec le userId en paramètre.
   * Le site de session est un service partagé — plus de clonage par utilisateur.
   */
  async startSessionSite(userId: string, botType: 'menma' | 'ovl'): Promise<string> {
    const menmaUrl = await SystemSettingsService.getSessionSiteUrl(); // On garde celui existant pour Menma
    // Pour OVL, on peut définir une URL en dur ou utiliser les settings. Par défaut: https://ovl-web.koyeb.app
    // Pour l'instant, disons qu'on utilise l'URL Koyeb en fonction du botType
    const baseUrl = botType === 'menma' ? menmaUrl : (process.env.OVL_SESSION_URL || 'https://ovl-web.koyeb.app');
    
    // On construit l'URL de la page de couplage avec l'identifiant de l'utilisateur
    const connectionUrl = `${baseUrl}/pair?userId=${encodeURIComponent(userId)}`;
    console.log(`[Orchestrator] Session URL (${botType}) generated for user ${userId}: ${connectionUrl}`);
    return connectionUrl;
  }

  /**
   * Arrête toutes les instances liées à un utilisateur.
   */
  async stopAll(userId: string) {
    const pm2Prefix = await SystemSettingsService.getPm2Prefix();
    try { await execFileAsync('pm2', ['stop', `${pm2Prefix}${userId}`]); } catch {}
  }

  /**
   * Supprime l'instance PM2 et les fichiers de l'utilisateur.
   */
  async destroyInstance(userId: string) {
    const pm2Prefix = await SystemSettingsService.getPm2Prefix();
    
    // 1. Arrêt et suppression PM2
    try { await execFileAsync('pm2', ['delete', `${pm2Prefix}${userId}`]); } catch {}

    // 2. Suppression des fichiers
    const userDir = await this.getUserDir(userId);
    if (fs.existsSync(userDir)) {
      try {
        fs.rmSync(userDir, { recursive: true, force: true });
        console.log(`[Orchestrator] Instance directory deleted for user ${userId}`);
      } catch (err) {
        console.error(`[Orchestrator] Failed to delete directory ${userDir}:`, (err as Error).message);
      }
    }
    
    // 3. Libération du port en DB
    const bot = await WhatsappBot.findOne({ where: { userId } });
    if (bot) {
      bot.port = null;
      await bot.save();
    }

    
    console.log(`[Orchestrator] Instance fully destroyed for user ${userId}`);
  }
}


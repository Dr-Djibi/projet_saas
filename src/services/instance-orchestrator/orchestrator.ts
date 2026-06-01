import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { SystemSettingsService } from '../settings/system-settings';

const execFileAsync = promisify(execFile);

export class InstanceOrchestrator {
  constructor() {
    // Les répertoires de base seront créés à la volée de manière dynamique.
  }

  /**
   * Résout dynamiquement le dossier de base des instances
   */
  private async getBaseDir(): Promise<string> {
    const baseDir = await SystemSettingsService.getUserInstancesBaseDir();
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    return baseDir;
  }

  /**
   * Résout le dossier d'un utilisateur
   */
  private async getUserDir(userId: string): Promise<string> {
    const baseDir = await this.getBaseDir();
    const userDir = path.join(baseDir, `user_${userId}`);
    // Sécurité: s'assurer que le répertoire de l'utilisateur est bien enfant de baseDir
    if (!userDir.startsWith(baseDir)) {
      throw new Error("Invalid user directory");
    }
    return userDir;
  }

  /**
   * Trouve récursivement tous les fichiers SQLite (.db, .sqlite, .sqlite3) dans un répertoire
   * Permet de localiser la base du bot peu importe son nom ou son emplacement (sous-dossiers).
   */
  private findSqliteDbFiles(dir: string, baseDir: string): string[] {
    const results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    
    // Ignorer les dossiers système et de build pour accélérer la recherche et éviter les boucles de symlinks
    const ignoredDirs = new Set(['node_modules', '.git', '.next', 'temp', 'logs', '.cache', 'dist', 'build', '.npm', '__pycache__', 'venv', '.venv', '.idea', '.vscode', 'coverage']);

    for (const file of list) {
      if (ignoredDirs.has(file)) {
        continue;
      }

      const filePath = path.join(dir, file);
      
      try {
        const stat = fs.lstatSync(filePath);
        if (stat.isSymbolicLink()) {
          continue;
        }

        if (stat.isDirectory()) {
          results.push(...this.findSqliteDbFiles(filePath, baseDir));
        } else if (
          (file.endsWith('.db') || 
          file.endsWith('.sqlite') || 
          file.endsWith('.sqlite3')) &&
          filePath.startsWith(baseDir)
        ) {
          results.push(filePath);
        }
      } catch (e) {
        // Ignorer en cas d'erreur de lecture de permissions
      }
    }

    return results;
  }

  /**
   * Crée l'arborescence physique pour le bot de l'utilisateur si elle n'existe pas
   */
  async provisionInstance(userId: string): Promise<string> {
    console.log(`[Orchestrator][Provisioning] Début du provisionnement pour l'utilisateur ${userId}...`);
    const userDir = await this.getUserDir(userId);

    // 1. Créer le répertoire utilisateur s'il n'existe pas
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    // 2. Créer le sous-dossier auth et logs s'ils n'existent pas
    const authDir = path.join(userDir, 'auth');
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    const logsDir = path.join(userDir, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // 3. Cloner le dépôt Git configuré si le point d'entrée index.js n'existe pas
    const indexPath = path.join(userDir, 'index.js');
    if (!fs.existsSync(indexPath)) {
      const gitRepoUrl = await SystemSettingsService.getBotRepoUrl();
      console.log(`[Orchestrator][Provisioning] Clonage du dépôt (${gitRepoUrl}) pour l'utilisateur ${userId}...`);
      await execFileAsync('git', ['clone', gitRepoUrl, '.'], { cwd: userDir });
    }

    // 4. Créer le lien symbolique (Symlink) pour node_modules
    const userNodeModules = path.join(userDir, 'node_modules');
    if (!fs.existsSync(userNodeModules)) {
      const globalNodeModules = await SystemSettingsService.getGlobalNodeModulesPath();
      console.log(`[Orchestrator][Provisioning] Liaison symbolique de node_modules (${globalNodeModules}) pour ${userId}...`);
      
      if (fs.existsSync(globalNodeModules)) {
        fs.symlinkSync(globalNodeModules, userNodeModules, 'dir');
      } else {
        // En développement local, on peut pointer vers le node_modules du SaaS
        const devGlobalModules = path.join(process.cwd(), 'node_modules');
        if (fs.existsSync(devGlobalModules)) {
          fs.symlinkSync(devGlobalModules, userNodeModules, 'dir');
        }
      }
    }

    return userDir;
  }

  /**
   * Écrit la configuration locale du bot (.env)
   */
  async configureInstance(userId: string, config: { botName: string; ownerNumber: string; prefix: string }) {
    const userDir = await this.getUserDir(userId);
    const appName = await SystemSettingsService.getAppName();

    console.log(`[Orchestrator][Configuration] Génération du fichier .env pour l'utilisateur ${userId}...`);

    const envContent = `
# CONFIGURATION GENERATED BY ${appName.toUpperCase()}
DEV=false
PORT=3000
BOT_NAME="${config.botName.replace(/"/g, '\\"')}"
PREFIX="${config.prefix}"
OWNER_NUMBER="${config.ownerNumber}"
DATABASE_PATH="./database.db"
`;
    await fs.promises.writeFile(path.join(userDir, '.env'), envContent.trim(), 'utf-8');
  }

  /**
   * Injecte le fichier de session WhatsApp (creds.json) directement dans le dossier du bot
   */
  async writeSessionCredentials(userId: string, credsJson: object) {
    const userDir = await this.getUserDir(userId);
    const credsPath = path.join(userDir, 'auth', 'creds.json');
    console.log(`[Orchestrator][Session] Injection des identifiants de session pour l'utilisateur ${userId}...`);
    await fs.promises.writeFile(credsPath, JSON.stringify(credsJson, null, 2), 'utf-8');
  }

  /**
   * Nettoie les sessions résiduelles dans TOUTES les bases SQLite trouvées dans le répertoire du bot.
   * Cela évite de dépendre d'un nom de base fixe et nettoie les fichiers dans les sous-dossiers.
   */
  async clearLocalSessionDb(userId: string) {
    const userDir = await this.getUserDir(userId);
    if (!fs.existsSync(userDir)) return;

    try {
      const dbFiles = this.findSqliteDbFiles(userDir, userDir);
      
      if (dbFiles.length === 0) {
        console.log(`[Orchestrator][Database] Aucune base SQLite trouvée pour le nettoyage de l'utilisateur ${userId}.`);
        return;
      }

      console.log(`[Orchestrator][Database] Nettoyage des bases SQLite (${dbFiles.length} fichiers) pour l'utilisateur ${userId}...`);

      const sqlite3 = require('sqlite3').verbose();

      const cleanupTasks = dbFiles.map(async (dbPath) => {
        try {
          await new Promise<void>((resolve, reject) => {
            const db = new sqlite3.Database(dbPath, (err: any) => {
              if (err) return reject(err);
            });

            // Vider la table Session
            db.run("DELETE FROM Session;", function(err: any) {
              // On ferme la base dans tous les cas
              db.close((closeErr: any) => {
                if (closeErr) console.warn(`[Orchestrator][Database] Erreur lors de la fermeture de ${dbPath}:`, closeErr.message);
              });

              if (err) {
                // Si la table n'existe pas dans cette DB locale, on l'ignore simplement
                if (err.message.includes("no such table")) {
                  return resolve();
                }
                return reject(err);
              }
              console.log(`[Orchestrator][Database] Table 'Session' vidée avec succès dans : ${dbPath}`);
              resolve();
            });
          });
        } catch (dbErr: any) {
          console.warn(`[Orchestrator][Database] Impossible de nettoyer la base SQLite ${dbPath} :`, dbErr.message);
        }
      });

      await Promise.allSettled(cleanupTasks);
    } catch (err: any) {
      console.error(`[Orchestrator][Database] Échec général du nettoyage SQLite pour ${userId} :`, err.message);
    }
  }

  /**
   * Lance l'instance du bot avec PM2
   */
  async startInstance(userId: string): Promise<string> {
    const userDir = await this.getUserDir(userId);
    const pm2Prefix = await SystemSettingsService.getPm2Prefix();
    const processName = `${pm2Prefix}${userId}`;
    const outLog = path.join(userDir, 'logs', 'out.log');
    const errLog = path.join(userDir, 'logs', 'err.log');

    console.log(`[Orchestrator][PM2] Démarrage de l'instance PM2 '${processName}'...`);

    try {
      // Vérifier si le processus PM2 existe déjà
      await execFileAsync('pm2', ['describe', processName]);
      console.log(`[Orchestrator][PM2] Processus existant. Redémarrage...`);
      await execFileAsync('pm2', ['start', processName]);
    } catch {
      // Sinon, lancer le nouveau processus
      await execFileAsync('pm2', ['start', 'index.js', '--name', processName, '--output', outLog, '--error', errLog, '--max-memory-restart', '200M', '--restart-delay', '5000'], { cwd: userDir });
    }

    return processName;
  }

  /**
   * Arrête l'instance du bot avec PM2
   */
  async stopInstance(userId: string): Promise<void> {
    const pm2Prefix = await SystemSettingsService.getPm2Prefix();
    const processName = `${pm2Prefix}${userId}`;
    console.log(`[Orchestrator][PM2] Arrêt de l'instance PM2 '${processName}'...`);

    try {
      await execFileAsync('pm2', ['stop', processName]);
    } catch (err: any) {
      console.warn(`[Orchestrator][PM2] Arrêt échoué pour ${processName} (peut-être déjà inactif) :`, err.message);
    }
  }

  /**
   * Redémarre l'instance du bot
   */
  async restartInstance(userId: string): Promise<void> {
    const pm2Prefix = await SystemSettingsService.getPm2Prefix();
    const processName = `${pm2Prefix}${userId}`;
    console.log(`[Orchestrator][PM2] Redémarrage de l'instance PM2 '${processName}'...`);
    await execFileAsync('pm2', ['restart', processName]);
  }

  /**
   * Supprime l'instance PM2
   */
  async deleteInstance(userId: string): Promise<void> {
    const pm2Prefix = await SystemSettingsService.getPm2Prefix();
    const processName = `${pm2Prefix}${userId}`;
    console.log(`[Orchestrator][PM2] Suppression PM2 de l'instance '${processName}'...`);

    try {
      await execFileAsync('pm2', ['delete', processName]);
    } catch (err: any) {
      console.warn(`[Orchestrator][PM2] Suppression échouée pour PM2 ${processName} :`, err.message);
    }
  }

  /**
   * Met à jour le code du bot via git pull dans son répertoire
   */
  async updateInstanceCode(userId: string): Promise<string> {
    const userDir = await this.getUserDir(userId);
    console.log(`[Orchestrator][Provisioning] Git Pull dans le dossier de l'utilisateur ${userId}...`);

    const { stdout } = await execFileAsync('git', ['pull', 'origin', 'main'], { cwd: userDir });
    
    // Redémarrage automatique si l'instance tournait
    try {
      await this.restartInstance(userId);
    } catch {}

    return stdout;
  }
}

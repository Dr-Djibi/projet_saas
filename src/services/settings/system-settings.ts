import { SystemSetting } from '@/lib/models';

/**
 * Service de gestion des configurations système dynamiques.
 * Permet à l'administrateur de modifier les valeurs via la base de données globale (PostgreSQL).
 */
export class SystemSettingsService {
  private static cache: Map<string, string> = new Map();

  // Valeurs par défaut et fallbacks environnementaux
  private static fallbacks: Record<string, string> = {
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'OVL & MENMA',
    APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Hébergement de bots WhatsApp',
    BOT_REPO_URL: process.env.BOT_REPO_URL || 'https://github.com/Dr-Djibi/menma-bot.git',
    SESSION_SITE_URL: process.env.SESSION_SITE_URL || 'http://localhost:3000',
    SAAS_WEBHOOK_SECRET: process.env.SAAS_WEBHOOK_SECRET || 'secret-partage-session',
    PM2_PROCESS_PREFIX: process.env.PM2_PROCESS_PREFIX || 'bot-user-',
    GLOBAL_NODE_MODULES_PATH: process.env.GLOBAL_NODE_MODULES_PATH || '/var/www/global_node_modules/node_modules',
    USER_INSTANCES_BASE_DIR: process.env.USER_INSTANCES_BASE_DIR || '/var/www/menma-users',
    DEFAULT_REMAINING_HOURS: process.env.DEFAULT_REMAINING_HOURS || '72.00',
  };

  /**
   * Récupère une configuration système dynamique
   * @param key Clé de configuration
   */
  static async getSetting(key: string): Promise<string> {
    // 1. Essayer le cache en mémoire pour éviter d'inonder la DB de requêtes
    if (this.cache.has(key)) {
      return this.cache.get(key) as string;
    }

    try {
      // 2. Essayer de lire depuis la table PostgreSQL SystemSettings
      const setting = await SystemSetting.findByPk(key);
      if (setting) {
        this.cache.set(key, setting.value);
        return setting.value;
      }
    } catch (err: any) {
      console.warn(`[SystemSettings] Table SystemSetting non accessible, utilisation du fallback pour ${key} :`, err.message);
    }

    // 3. Fallback sur la variable d'environnement ou la constante par défaut
    return this.fallbacks[key] || '';
  }

  /**
   * Met à jour une configuration système dynamique et rafraîchit le cache
   */
  static async setSetting(key: string, value: string, description?: string): Promise<void> {
    await SystemSetting.upsert({
      key,
      value,
      description: description || null,
    });
    this.cache.set(key, value);
    console.log(`[SystemSettings] Clé '${key}' mise à jour avec la valeur : '${value}'`);
  }

  /**
   * Recharge le cache complet (utile après des modifications en bloc)
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Helpers pour obtenir directement les valeurs typées
   */
  static async getAppName(): Promise<string> {
    return this.getSetting('APP_NAME');
  }

  static async getBotRepoUrl(): Promise<string> {
    return this.getSetting('BOT_REPO_URL');
  }

  static async getSessionSiteUrl(): Promise<string> {
    return this.getSetting('SESSION_SITE_URL');
  }

  static async getWebhookSecret(): Promise<string> {
    return this.getSetting('SAAS_WEBHOOK_SECRET');
  }

  static async getPm2Prefix(): Promise<string> {
    return this.getSetting('PM2_PROCESS_PREFIX');
  }

  static async getGlobalNodeModulesPath(): Promise<string> {
    return this.getSetting('GLOBAL_NODE_MODULES_PATH');
  }

  static async getUserInstancesBaseDir(): Promise<string> {
    return this.getSetting('USER_INSTANCES_BASE_DIR');
  }

  static async getDefaultRemainingHours(): Promise<number> {
    const hours = await this.getSetting('DEFAULT_REMAINING_HOURS');
    return parseFloat(hours) || 72.00;
  }
}

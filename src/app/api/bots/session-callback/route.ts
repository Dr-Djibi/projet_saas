import { NextResponse } from 'next/server';
import { InstanceOrchestrator } from '@/services/instance-orchestrator/orchestrator';
import { SystemSettingsService } from '@/services/settings/system-settings';
import { WhatsappBot } from '@/lib/models';

export async function POST(req: Request) {
  const authHeader = req.headers.get('Authorization');
  const systemSecret = await SystemSettingsService.getWebhookSecret();

  // 1. Validation de l'authentification partagée
  if (!authHeader || authHeader !== `Bearer ${systemSecret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { userId, sessionId } = await req.json();

    if (!userId || !sessionId) {
      return NextResponse.json({ error: 'Données incomplètes (userId ou sessionId manquants)' }, { status: 400 });
    }

    // 2. Récupérer le bot lié à l'utilisateur
    const bot = await WhatsappBot.findOne({ where: { userId } }) as any;
    if (!bot) {
      return NextResponse.json({ error: 'Aucun bot enregistré pour cet utilisateur' }, { status: 404 });
    }

    const orchestrator = new InstanceOrchestrator();

    // 3. Provisionner le dossier (Bot + Session)
    await orchestrator.provisionInstance(userId, bot.botType as 'menma' | 'ovl');

    // 4. Configurer les variables d'environnement locales (.env) du bot
    await orchestrator.configureBotEnv(userId, {
      BOT_NAME: bot.botName || 'Menma',
      PREFIX: bot.prefix || '.',
      OWNER_NUMBER: bot.ownerNumber || '',
      SESSION_ID: sessionId // Injecter le Session ID ici
    });

    // 7. Lancer ou redémarrer le bot sur le serveur avec PM2
    await orchestrator.startBot(userId);

    // 8. Mettre à jour l'état de la base de données globale
    await WhatsappBot.update({
      isActive: true,
      status: 'active',
      lastCalculated: new Date()
    }, {
      where: { userId }
    });

    console.log(`[SaaS API] Instance démarrée et couplée avec succès pour l'utilisateur ${userId}`);
    return NextResponse.json({ message: 'Session configurée et bot lancé avec succès' }, { status: 200 });

  } catch (error: any) {
    console.error('[SaaS API] Erreur lors du session-callback :', error);
    return NextResponse.json({ error: 'Erreur interne de traitement', details: error.message }, { status: 500 });
  }
}

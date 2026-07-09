import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { WhatsappBot } from '@/lib/models';
import { InstanceOrchestrator } from '@/services/instance-orchestrator/orchestrator';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { sessionId } = await req.json();
    const userId = (session.user as any).id;

    if (!sessionId) {
      return NextResponse.json({ message: 'Session ID manquant' }, { status: 400 });
    }

    const bot = await WhatsappBot.findOne({ where: { userId } }) as any;
    if (!bot) {
      return NextResponse.json({ message: 'Aucun bot trouvé pour cet utilisateur' }, { status: 404 });
    }

    const orchestrator = new InstanceOrchestrator();

    // 1. Configurer les variables d'environnement locales (.env) du bot avec le SESSION_ID
    await orchestrator.configureBotEnv(userId, {
      BOT_NAME: bot.botName || 'Menma',
      PREFIX: bot.prefix || '.',
      OWNER_NUMBER: bot.ownerNumber || '',
      SESSION_ID: sessionId
    });

    // 2. Lancer ou redémarrer le bot sur le serveur avec PM2
    await orchestrator.startBot(userId);

    // 3. Mettre à jour l'état de la base de données globale
    await WhatsappBot.update({
      isActive: true,
      status: 'active',
      lastCalculated: new Date()
    }, {
      where: { userId }
    });

    return NextResponse.json({ message: 'Bot configuré et lancé avec succès' }, { status: 200 });

  } catch (error: any) {
    console.error('[Manual Session API] Erreur:', error);
    return NextResponse.json({ message: 'Erreur lors de l\'enregistrement de la session', details: error.message }, { status: 500 });
  }
}

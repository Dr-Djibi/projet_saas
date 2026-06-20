import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { InstanceOrchestrator } from '@/services/instance-orchestrator/orchestrator';
import { WhatsappBot } from '@/lib/models';

/**
 * Webhook route to receive Baileys session credentials from the session site.
 * This route is called after a successful QR code scan.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, creds } = body;

    if (!token || !creds) {
      return NextResponse.json(
        { error: 'Missing token or credentials' }, 
        { status: 400 }
      );
    }

    // 1. Verify JWT
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' }, 
        { status: 401 }
      );
    }

    const { userId, botId } = decoded;
    console.log(`[Webhook] Received session for user ${userId}, bot ${botId}`);

    const orchestrator = new InstanceOrchestrator();

    // 2. Update bot status in database
    const bot = await WhatsappBot.findByPk(botId);
    if (!bot) {
      console.warn(`[Webhook] Bot with ID ${botId} not found in database.`);
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // 3. Configure bot local environment (.env)
    await orchestrator.configureBotEnv(userId, {
      BOT_NAME: bot.botName || 'Menma',
      PREFIX: bot.prefix || '.',
      OWNER_NUMBER: bot.ownerNumber || ''
    });

    // 4. Save credentials (creds.json) to the bot directory
    await orchestrator.saveBotCredentials(userId, creds);

    // 5. Start or restart the bot via PM2
    await orchestrator.startBot(userId);

    // 6. Mark bot active
    bot.isActive = true;
    bot.status = 'active';
    await bot.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Bot session received and instance started' 
    });

  } catch (error: unknown) {
    console.error('[Webhook] Error processing session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
}

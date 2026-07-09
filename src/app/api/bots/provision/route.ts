import { NextResponse } from "next/server";
import { WhatsappBot } from "@/lib/models";
import { SystemSettingsService } from "@/services/settings/system-settings";
import { InstanceOrchestrator } from "@/services/instance-orchestrator/orchestrator";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const orchestrator = new InstanceOrchestrator();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  try {
    const userId = (session.user as any).id;
    const body = await req.json().catch(() => ({}));
    const { botType = "menma", botName = "Menma Bot", prefix = ".", ownerNumber = "" } = body;

    // Check if user already has a bot
    const existingBot = await WhatsappBot.findOne({
      where: { userId },
    });

    if (existingBot) {
      return NextResponse.json(
        { message: "Vous avez déjà un bot configuré" },
        { status: 400 }
      );
    }

    // Generate a dynamic PM2 process name
    const pm2Prefix = await SystemSettingsService.getPm2Prefix();
    const pm2ProcessName = `${pm2Prefix}${userId.slice(0, 8)}-${Date.now()}`;
    const defaultHours = await SystemSettingsService.getDefaultRemainingHours();

    // 1. Create bot record in database
    const bot = await WhatsappBot.create({
      userId,
      botType: botType as 'menma' | 'ovl',
      pm2ProcessName,
      botName,
      prefix,
      ownerNumber,
      isActive: false,
      status: 'paused',
      remainingHours: defaultHours,
    });

    try {
      // 2. Clone Git repositories and prepare directories immediately
      console.log(`[Provision API] Starting Git clone/provisioning for user ${userId} (${botType})...`);
      await orchestrator.provisionInstance(userId, botType as 'menma' | 'ovl');
      console.log(`[Provision API] Git provisioning finished for user ${userId}`);
    } catch (provisionError: any) {
      // Rollback database record if provisioning (cloning) fails
      console.error(`[Provision API] Git clone failed, rolling back DB creation for user ${userId}:`, provisionError.message);
      await bot.destroy();
      throw provisionError;
    }

    return NextResponse.json({ bot }, { status: 201 });
  } catch (error: any) {
    console.error("Bot provision error:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du bot", details: error.message },
      { status: 500 }
    );
  }
}


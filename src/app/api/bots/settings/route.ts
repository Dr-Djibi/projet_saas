import { NextResponse } from "next/server";
import { WhatsappBot } from "@/lib/models";
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
    const { botName, prefix, ownerNumber, botType } = body;

    const bot = await WhatsappBot.findOne({
      where: { userId },
    });

    if (!bot) {
      return NextResponse.json(
        { message: "Aucun bot provisionné" },
        { status: 404 }
      );
    }

    // Update DB
    if (botName !== undefined) bot.botName = botName;
    if (prefix !== undefined) bot.prefix = prefix;
    if (ownerNumber !== undefined) bot.ownerNumber = ownerNumber;
    
    // If botType changes, we need to reprovision the directory (re-clone correct repository)
    let typeChanged = false;
    if (botType !== undefined && botType !== bot.botType) {
      bot.botType = botType as 'menma' | 'ovl';
      typeChanged = true;
    }

    await bot.save();

    // Regenerate .env and restart bot if provisioned/active
    try {
      if (typeChanged) {
        console.log(`[Settings API] Bot type changed to ${bot.botType}. Re-provisioning...`);
        await orchestrator.provisionInstance(userId, bot.botType);
      }
      
      await orchestrator.configureBotEnv(userId, {
        BOT_NAME: bot.botName,
        PREFIX: bot.prefix,
        OWNER_NUMBER: bot.ownerNumber || "",
      });

      if (bot.isActive && bot.status === 'active') {
        console.log(`[Settings API] Bot is active. Restarting process with new configuration...`);
        await orchestrator.startBot(userId);
      }
    } catch (orchestratorError: any) {
      console.warn("[Settings API] Warning: Failed to apply settings to file system/process:", orchestratorError.message);
    }

    return NextResponse.json({ bot }, { status: 200 });
  } catch (error: any) {
    console.error("Bot settings update error:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour des paramètres", details: error.message },
      { status: 500 }
    );
  }
}

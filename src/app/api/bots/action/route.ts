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
    const { action, botId } = await req.json();
    const userId = (session.user as any).id;

    const bot = await WhatsappBot.findOne({ where: { userId, id: botId } });
    if (!bot) {
      return NextResponse.json({ message: "Bot non trouvé" }, { status: 404 });
    }

    if (action === "start") {
      if (bot.remainingHours <= 0) {
        return NextResponse.json({ message: "Crédit insuffisant" }, { status: 400 });
      }
      await orchestrator.startInstance(userId);
      await bot.update({ isActive: true, status: 'active' });
    } else if (action === "stop") {
      await orchestrator.stopInstance(userId);
      await bot.update({ isActive: false, status: 'paused' });
    } else if (action === "delete") {
      await orchestrator.destroyInstance(userId);
      await bot.destroy();
      return NextResponse.json({ message: "Instance supprimée" }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Action invalide" }, { status: 400 });
    }

    const liveStatus = await orchestrator.getLiveStatus(userId);
    return NextResponse.json({ bot: { ...bot.toJSON(), liveStatus } }, { status: 200 });
  } catch (error) {
    console.error("Bot action error:", error);
    return NextResponse.json(
      { message: "Erreur lors de l'exécution de l'action" },
      { status: 500 }
    );
  }
}

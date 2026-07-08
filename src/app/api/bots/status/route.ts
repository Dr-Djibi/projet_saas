import { NextResponse } from "next/server";
import { WhatsappBot } from "@/lib/models";
import { InstanceOrchestrator } from "@/services/instance-orchestrator/orchestrator";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const orchestrator = new InstanceOrchestrator();

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  try {
    const userId = (session.user as any).id;
    const bot = await WhatsappBot.findOne({ where: { userId } });

    if (!bot) {
      return NextResponse.json({ liveStatus: "stopped", isActive: false }, { status: 200 });
    }

    const liveStatus = await orchestrator.getLiveStatus(userId);
    
    // Si l'état PM2 diffère de l'état enregistré, on synchronise la DB en arrière-plan
    const isActuallyRunning = liveStatus === "online";
    if (bot.isActive !== isActuallyRunning) {
      await bot.update({ isActive: isActuallyRunning });
    }

    return NextResponse.json({
      liveStatus,
      isActive: bot.isActive,
      remainingHours: bot.remainingHours,
      status: bot.status
    }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch live status:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

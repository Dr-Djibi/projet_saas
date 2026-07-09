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

    // Vérifier que le bot existe
    const bot = await WhatsappBot.findOne({ where: { userId } });
    if (!bot) {
      return NextResponse.json(
        { message: "Aucun bot provisionné pour cet utilisateur" },
        { status: 404 }
      );
    }

    // 1. Construire l'URL du site de session centralisé (Koyeb)
    //    - Menma → https://menma-md-web.koyeb.app/pair?userId=...
    //    - OVL   → https://ovl-web.koyeb.app/pair?userId=...
    const connectionUrl = await orchestrator.startSessionSite(userId, bot.botType as 'menma' | 'ovl');

    return NextResponse.json({
      success: true,
      connectionUrl,
    });
  } catch (error: any) {
    console.error("Session start error:", error);
    return NextResponse.json(
      { message: "Erreur lors de la génération de l'URL de session", details: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { WhatsappBot } from "@/lib/models";
import { SystemSettingsService } from "@/services/settings/system-settings";
import { InstanceOrchestrator } from "@/services/instance-orchestrator/orchestrator";
import { signToken } from "@/lib/jwt";
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

    // Find the user's bot
    const bot = await WhatsappBot.findOne({
      where: { userId },
    });

    if (!bot) {
      return NextResponse.json(
        { message: "Aucun bot provisionné pour cet utilisateur" },
        { status: 404 }
      );
    }

    // 1. Provision the instance (ensure session site folder is ready)
    await orchestrator.provisionInstance(userId, bot.botType as 'menma' | 'ovl');

    // 2. Start the session web server process via PM2 and get its port
    const port = await orchestrator.startSessionSite(userId);

    // 3. Generate token for authentication between session web and SaaS
    const token = signToken({
      userId,
      botId: bot.id,
    });

    // 4. Construct pairing URL
    const sessionBaseUrl = await SystemSettingsService.getSessionSiteUrl();
    let connectionUrl = "";
    if (sessionBaseUrl.includes("localhost") || sessionBaseUrl.includes("127.0.0.1")) {
      // Development mode: connect directly to the session site on its dynamic port
      const urlObj = new URL(sessionBaseUrl);
      connectionUrl = `http://${urlObj.hostname}:${port}/?token=${token}`;
    } else {
      // Production mode: use reverse proxy routing
      connectionUrl = `${sessionBaseUrl}/${userId}/?token=${token}`;
    }

    return NextResponse.json({
      success: true,
      port,
      token,
      connectionUrl,
    });
  } catch (error: any) {
    console.error("Session start error:", error);
    return NextResponse.json(
      { message: "Erreur lors du démarrage du site de session", details: error.message },
      { status: 500 }
    );
  }
}

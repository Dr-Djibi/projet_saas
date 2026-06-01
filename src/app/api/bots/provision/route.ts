import { NextResponse } from "next/server";
import { WhatsappBot } from "@/lib/models";
import { SystemSettingsService } from "@/services/settings/system-settings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  try {
    const userId = (session.user as any).id;

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

    const bot = await WhatsappBot.create({
      userId,
      pm2ProcessName,
      isActive: false,
      status: 'paused',
      remainingHours: defaultHours,
    });

    return NextResponse.json({ bot }, { status: 201 });
  } catch (error) {
    console.error("Bot provision error:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du bot" },
      { status: 500 }
    );
  }
}

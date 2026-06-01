import { NextResponse } from "next/server";
import { WhatsappBot } from "@/lib/models";
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

    // Generate a unique process name
    const pm2ProcessName = `bot-${userId.slice(0, 8)}-${Date.now()}`;

    const bot = await WhatsappBot.create({
      userId,
      pm2ProcessName,
      isActive: false,
      status: 'paused',
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

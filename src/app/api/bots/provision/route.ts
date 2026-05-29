import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
    const existingBot = await prisma.whatsappBot.findUnique({
      where: { userId },
    });

    if (existingBot) {
      return NextResponse.json(
        { message: "Vous avez déjà un bot configuré" },
        { status: 400 }
      );
    }

    const { phoneNumber } = await req.json();

    const bot = await prisma.whatsappBot.create({
      data: {
        userId,
        phoneNumber,
        isActive: false,
      },
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

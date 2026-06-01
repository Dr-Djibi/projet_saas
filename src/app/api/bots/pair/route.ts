import { NextResponse } from "next/server";
import { generatePairingCode } from "@/lib/whatsapp/pairing";
import { WhatsappBot } from "@/lib/models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { phoneNumber } = await req.json();
  const userId = (session.user as any).id;

  const bot = await WhatsappBot.findOne({ where: { userId } }) as any;
  if (!bot) return NextResponse.json({ error: "Bot non trouvé" }, { status: 404 });

  try {
    const code = await generatePairingCode(bot.id, phoneNumber);
    return NextResponse.json({ code });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la génération du code" }, { status: 500 });
  }
}

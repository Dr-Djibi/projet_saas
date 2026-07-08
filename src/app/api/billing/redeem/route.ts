import { NextResponse } from 'next/server';
import { redeemTicket } from '@/services/billing/billing';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * API pour utiliser un ticket d'abonnement.
 * Prend un code de ticket et ajoute les heures correspondantes au bot de l'utilisateur connecté.
 */
export async function POST(req: Request) {
  // --- Rate limiting : max 5 tentatives / IP / minute ---
  const ip = getClientIp(req);
  const rl = rateLimit(`redeem:${ip}`, { limit: 5, windowMs: 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Veuillez réessayer plus tard.' },
      { status: 429 }
    );
  }

  // --- Authentification ---
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const userId = (session.user as any).id;
    const body = await req.json();
    const { code } = body;

    const trimmedCode = code?.trim();

    if (!trimmedCode) {
      return NextResponse.json(
        { error: 'Le code du ticket est requis.' },
        { status: 400 }
      );
    }

    const result = await redeemTicket(userId, trimmedCode);

    return NextResponse.json({
      success: true,
      message: 'Ticket utilisé avec succès. Heures ajoutées.',
      remainingHours: result.remainingHours,
      hoursAdded: result.hoursAdded
    });
  } catch (error: any) {
    console.error('[Redeem API Error]:', error);
    
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de l\'utilisation du ticket.' },
      { status: 400 }
    );
  }
}

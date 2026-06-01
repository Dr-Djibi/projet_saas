import { NextResponse } from 'next/server';
import { redeemTicket } from '@/services/billing/billing';

// Basic in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS = 5;

/**
 * API pour utiliser un ticket d'abonnement.
 * Prend un code de ticket et un userId, et ajoute les heures correspondantes au bot de l'utilisateur.
 */
export async function POST(req: Request) {
  // Simple rate limiting by IP (assuming X-Forwarded-For if behind proxy, or just client IP)
  // Since we don't have access to request headers easily in this context, we'll use a placeholder IP
  const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const limit = rateLimitMap.get(clientIp) || { count: 0, lastReset: now };

  if (now - limit.lastReset > RATE_LIMIT_WINDOW_MS) {
    limit.count = 1;
    limit.lastReset = now;
  } else {
    limit.count++;
  }
  rateLimitMap.set(clientIp, limit);

  if (limit.count > MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Veuillez réessayer plus tard.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { code, userId } = body;

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Le code du ticket et l\'ID utilisateur sont requis.' },
        { status: 400 }
      );
    }

    const result = await redeemTicket(userId, code);

    return NextResponse.json({
      success: true,
      message: 'Ticket utilisé avec succès. Heures ajoutées.',
      remainingHours: result.remainingHours,
      hoursAdded: result.hoursAdded
    });
  } catch (error: any) {
    console.error('[Redeem API Error]:', error);
    
    // On retourne une erreur explicite si possible
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de l\'utilisation du ticket.' },
      { status: 400 }
    );
  }
}

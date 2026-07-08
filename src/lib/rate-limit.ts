/**
 * Rate limiter simple basé sur une Map en mémoire (fenêtre glissante).
 * Fonctionne en single-process (Next.js dev/prod standard).
 * Pour multi-process (cluster), utiliser Redis à la place.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Nettoyage périodique pour éviter les fuites mémoire
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 60_000); // toutes les 60s

export interface RateLimitOptions {
  /** Nombre max de requêtes dans la fenêtre */
  limit: number;
  /** Durée de la fenêtre en millisecondes */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Vérifie et incrémente le compteur pour une clé donnée.
 * @param key  Identifiant unique (ex: "verify:user@email.com" ou "register:1.2.3.4")
 */
export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt < now) {
    // Nouvelle fenêtre
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { success: true, remaining: options.limit - 1, resetAt: now + options.windowMs };
  }

  if (existing.count >= options.limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: options.limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Récupère l'IP du client depuis les headers Next.js (compatible Vercel/VPS).
 */
export function getClientIp(req: Request): string {
  const headers = (req as any).headers;
  return (
    headers.get?.("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get?.("x-real-ip") ||
    "unknown"
  );
}

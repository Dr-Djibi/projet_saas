import { NextResponse } from "next/server";
import { User } from "@/lib/models";
import { Op } from "sequelize";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // --- Rate limiting : max 10 tentatives / IP / 15 min ---
    // Empêche le bruteforce des 900 000 combinaisons possibles
    const ip = getClientIp(req);
    const rl = rateLimit(`verify:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json(
        { message: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const { email, code } = await req.json();

    // --- Validation des champs ---
    if (!email || !code) {
      return NextResponse.json({ message: "Email et code requis" }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    if (!/^\d{6}$/.test(trimmedCode)) {
      return NextResponse.json({ message: "Le code doit contenir exactement 6 chiffres" }, { status: 400 });
    }

    // --- Trouver l'utilisateur ---
    const user = await User.findOne({
      where: {
        email: trimmedEmail,
        verificationCode: trimmedCode,
        verificationExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Code invalide ou expiré" }, { status: 400 });
    }

    // --- Valider l'utilisateur ---
    await user.update({
      isVerified: true,
      verificationCode: null,
      verificationExpires: null,
    });

    return NextResponse.json({ message: "Compte vérifié avec succès" }, { status: 200 });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

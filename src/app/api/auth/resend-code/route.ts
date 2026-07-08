import { NextResponse } from "next/server";
import { User } from "@/lib/models";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    // --- Rate limiting : max 3 renvois / email / 15 min ---
    const ip = getClientIp(req);
    const ipLimit = rateLimit(`resend-ip:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
    if (!ipLimit.success) {
      return NextResponse.json(
        { message: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429 }
      );
    }

    const { email: rawEmail } = await req.json();
    const email = rawEmail?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ message: "Email manquant" }, { status: 400 });
    }

    // Rate limit par email aussi
    const emailLimit = rateLimit(`resend-email:${email}`, { limit: 3, windowMs: 15 * 60 * 1000 });
    if (!emailLimit.success) {
      return NextResponse.json(
        { message: "Trop de codes envoyés pour cet email. Attendez 15 minutes." },
        { status: 429 }
      );
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      // On répond 200 même si l'user n'existe pas (anti-enumération d'emails)
      return NextResponse.json({ message: "Si cet email est enregistré, un nouveau code a été envoyé." }, { status: 200 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: "Ce compte est déjà vérifié." }, { status: 400 });
    }

    // Générer un nouveau code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await user.update({ verificationCode, verificationExpires });
    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json({ message: "Un nouveau code a été envoyé." }, { status: 200 });
  } catch (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

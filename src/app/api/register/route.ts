import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/lib/models";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validatePassword, validateEmail } from "@/lib/validation";
import crypto from "crypto";
import { Op } from "sequelize";

export async function POST(req: Request) {
  try {
    // --- Rate limiting : max 5 inscriptions / IP / 15 min ---
    const ip = getClientIp(req);
    const rl = rateLimit(`register:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json(
        { message: "Trop de tentatives. Réessayez dans quelques minutes." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const { email: rawEmail, password, username } = await req.json();
    const email = rawEmail?.trim().toLowerCase();

    // --- Validation des champs ---
    if (!email || !password || !username) {
      return NextResponse.json({ message: "Tous les champs sont requis" }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ message: "Format d'email invalide" }, { status: 400 });
    }

    const pwValidation = validatePassword(password);
    if (!pwValidation.valid) {
      return NextResponse.json({ message: pwValidation.errors[0] }, { status: 400 });
    }

    if (username.trim().length < 2) {
      return NextResponse.json({ message: "Le nom doit contenir au moins 2 caractères" }, { status: 400 });
    }

    // --- Vérifier existence ---
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      // Si le compte existe mais n'est pas vérifié et le code a expiré → on le supprime et on laisse réinscrire
      if (!existingUser.isVerified) {
        const codeExpired =
          !existingUser.verificationExpires ||
          existingUser.verificationExpires < new Date();

        if (codeExpired) {
          // Supprimer l'ancien compte fantôme
          await existingUser.destroy();
          // On continue pour recréer
        } else {
          // Code encore valide → renvoyer vers la vérification
          return NextResponse.json(
            { message: "Un compte avec cet email est en attente de vérification. Vérifiez votre boite mail." },
            { status: 409 }
          );
        }
      } else {
        return NextResponse.json({ message: "Un compte avec cet email existe déjà" }, { status: 409 });
      }
    }

    // --- Hashage ---
    const hashedPassword = await bcrypt.hash(password, 12);

    // --- Génération code vérification ---
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // --- Création utilisateur ---
    const newUser = await User.create({
      username: username.trim(),
      email,
      password: hashedPassword,
      verificationCode,
      verificationExpires,
      isVerified: false,
    });

    // --- Envoi email ---
    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json(
      { message: "Inscription réussie, vérifiez votre email" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

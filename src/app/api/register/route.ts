import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/lib/models";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json();

    // 1. Vérifier existence
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return NextResponse.json({ message: "Utilisateur déjà existant" }, { status: 400 });

    // 2. Hashage
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Génération code vérification
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // 4. Création avec Sequelize
    await User.create({
      username,
      email,
      password: hashedPassword,
      verificationCode,
      verificationExpires,
      isVerified: false
    });

    // 5. Envoi email
    await sendVerificationEmail(email, verificationCode);
    
    return NextResponse.json({ message: "Inscription réussie, vérifiez votre email" }, { status: 201 });
  } catch (error) {
    console.error("Reg error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

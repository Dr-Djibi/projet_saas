import { NextResponse } from "next/server";
import { User } from "@/lib/models";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email manquant" }, { status: 400 });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: "Compte déjà vérifié" }, { status: 400 });
    }

    // Générer un nouveau code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await user.update({
      verificationCode,
      verificationExpires,
    });

    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json({ message: "Nouveau code envoyé" }, { status: 200 });
  } catch (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

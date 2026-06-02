import { NextResponse } from "next/server";
import { User } from "@/lib/models";
import { Op } from "sequelize";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    // 1. Trouver l'utilisateur
    const user = await User.findOne({ 
      where: { 
        email,
        verificationCode: code,
        verificationExpires: { [Op.gt]: new Date() } // Vérifie si pas expiré
      } 
    });

    if (!user) {
      return NextResponse.json({ message: "Code invalide ou expiré" }, { status: 400 });
    }

    // 2. Valider l'utilisateur
    console.log('Verifying user:', user.email, 'Current isVerified:', user.isVerified);
    await user.update({
      isVerified: true,
      verificationCode: null,
      verificationExpires: null
    });
    console.log('User verified successfully');

    return NextResponse.json({ message: "Compte vérifié avec succès" }, { status: 200 });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

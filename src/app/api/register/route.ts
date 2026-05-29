import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/lib/models"; // Importation des modèles Sequelize
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    // Vérifier si l'utilisateur existe avec Sequelize
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return NextResponse.json({ message: "Utilisateur déjà existant" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Création via Sequelize
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    } as any);

    // Note : La gestion du token de vérification et de l'abonnement 
    // nécessitera la création des modèles Sequelize correspondants (VerificationToken, Subscription) 
    // si vous voulez conserver cette fonctionnalité exacte.
    
    // Pour l'instant, on se concentre sur l'inscription fonctionnelle :
    return NextResponse.json({ message: "Inscription réussie" }, { status: 201 });
  } catch (error) {
    console.error("Reg error:", error);
    return NextResponse.json({ message: "Erreur serveur : " + (error as Error).message }, { status: 500 });
  }
}

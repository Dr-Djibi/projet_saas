import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/lib/models";
import { Op } from "sequelize";

export async function POST(req: Request) {
  try {
    const { email, code, password } = await req.json();
    const user = await User.findOne({ 
      where: { 
        email, 
        verificationCode: code,
        verificationExpires: { [Op.gt]: new Date() } 
      } 
    });

    if (!user) return NextResponse.json({ message: "Code invalide ou expiré" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({
      password: hashedPassword,
      verificationCode: null,
      verificationExpires: null
    });

    return NextResponse.json({ message: "Mot de passe mis à jour" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

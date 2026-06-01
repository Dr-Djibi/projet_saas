import { NextResponse } from "next/server";
import { User } from "@/lib/models";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";
import { Op } from "sequelize";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const user = await User.findOne({ where: { email } });

    if (!user) return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });

    const resetCode = crypto.randomInt(100000, 999999).toString();
    await user.update({
      verificationCode: resetCode,
      verificationExpires: new Date(Date.now() + 15 * 60 * 1000)
    });

    await sendVerificationEmail(email, resetCode);
    return NextResponse.json({ message: "Code envoyé" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

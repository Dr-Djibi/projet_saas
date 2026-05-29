import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ message: "Utilisateur déjà existant" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        subscription: { create: { planName: "Free", status: "INACTIVE" } },
      },
    });

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    });

    await sendVerificationEmail(email, token);

    return NextResponse.json({ message: "Inscription réussie, vérifiez vos emails" }, { status: 201 });
  } catch (error) {
    console.error("Reg error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

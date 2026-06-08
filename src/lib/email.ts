import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { siteConfig } from "@/config/site";
dotenv.config();

export const sendVerificationEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    requireTLS: process.env.SMTP_PORT !== "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"${siteConfig.name}" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `Votre code de vérification - ${siteConfig.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Vérification de votre compte</h1>
        <p>Merci de vous être inscrit. Utilisez le code ci-dessous pour vérifier votre adresse email :</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
          ${token}
        </div>
        <p>Ce code expirera dans 15 minutes.</p>
      </div>
    `,
  });
};

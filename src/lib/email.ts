import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const url = `${process.env.APP_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"${process.env.APP_NAME}" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `Vérification de votre compte ${process.env.APP_NAME}`,
    html: `<h1>Bienvenue sur ${process.env.APP_NAME}</h1>
           <p>Cliquez sur le lien ci-dessous pour valider votre compte :</p>
           <a href="${url}">${url}</a>`,
  });
};

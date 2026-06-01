import nodemailer from 'nodemailer';

async function testEmail() {
  console.log("Tentative d'envoi d'email de test...");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Test Service" <${process.env.SMTP_FROM}>`,
      to: 'djibrilsc222@gmail.com',
      subject: 'Test SMTP',
      text: 'Ceci est un email de test depuis le serveur.',
      html: '<h1>Test SMTP réussi !</h1>',
    });
    console.log("Email envoyé avec succès :", info.messageId);
  } catch (error) {
    console.error("Erreur lors de l'envoi :", error);
  }
}

testEmail();

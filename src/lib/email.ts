import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { siteConfig } from "@/config/site";
dotenv.config();

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    requireTLS: process.env.SMTP_PORT !== "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export const sendVerificationEmail = async (email: string, code: string) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"${siteConfig.name}" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `${code} — Votre code de vérification`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="font-size:28px;font-weight:900;color:#7c3aed;letter-spacing:-1px;">${siteConfig.name}</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:24px;padding:48px 40px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              
              <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:900;color:#111827;text-align:center;">
                Vérifiez votre adresse email
              </h1>
              <p style="margin:0 0 32px 0;font-size:15px;color:#6b7280;text-align:center;line-height:1.6;">
                Utilisez le code ci-dessous pour activer votre compte.<br>
                Ce code expire dans <strong>15 minutes</strong>.
              </p>

              <!-- Code block -->
              <div style="background:#f5f3ff;border:2px dashed #7c3aed;border-radius:16px;padding:28px;text-align:center;margin-bottom:32px;">
                <span style="font-size:42px;font-weight:900;letter-spacing:12px;color:#7c3aed;font-variant-numeric:tabular-nums;">
                  ${code}
                </span>
              </div>

              <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.6;">
                Si vous n'avez pas créé de compte sur ${siteConfig.name}, ignorez cet email.<br>
                Vérifiez vos <strong>spams</strong> si vous ne retrouvez pas cet email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} ${siteConfig.name} · Tous droits réservés
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"${siteConfig.name}" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `Réinitialisation de votre mot de passe — ${siteConfig.name}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="font-size:28px;font-weight:900;color:#7c3aed;letter-spacing:-1px;">${siteConfig.name}</span>
            </td>
          </tr>

          <tr>
            <td style="background:#ffffff;border-radius:24px;padding:48px 40px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              
              <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:900;color:#111827;text-align:center;">
                Réinitialisation du mot de passe
              </h1>
              <p style="margin:0 0 32px 0;font-size:15px;color:#6b7280;text-align:center;line-height:1.6;">
                Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe.<br>
                Ce lien expire dans <strong>30 minutes</strong>.
              </p>

              <div style="text-align:center;margin-bottom:32px;">
                <a href="${resetUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;font-size:16px;font-weight:900;text-decoration:none;padding:16px 40px;border-radius:12px;border-bottom:4px solid rgba(0,0,0,0.2);">
                  Réinitialiser mon mot de passe
                </a>
              </div>

              <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.6;">
                Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.<br>
                Votre mot de passe ne sera pas modifié.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} ${siteConfig.name} · Tous droits réservés
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });
};

export const sendExpirationWarningEmail = async (email: string, botName: string, remainingHours: number) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"${siteConfig.name}" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `⚠️ Expiration imminente de votre bot ${botName}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="font-size:28px;font-weight:900;color:#7c3aed;letter-spacing:-1px;">${siteConfig.name}</span>
            </td>
          </tr>

          <tr>
            <td style="background:#ffffff;border-radius:24px;padding:48px 40px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              
              <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:900;color:#dc2626;text-align:center;">
                Expiration imminente !
              </h1>
              <p style="margin:0 0 32px 0;font-size:15px;color:#6b7280;text-align:center;line-height:1.6;">
                L'abonnement de votre bot <strong>${botName}</strong> va bientôt expirer.<br>
                Il vous reste moins de <strong>${remainingHours.toFixed(1)} heures</strong> d'activité.
              </p>

              <div style="background:#fef2f2;border:2px dashed #dc2626;border-radius:16px;padding:24px;text-align:center;margin-bottom:32px;">
                <p style="margin:0;font-size:14px;color:#991b1b;font-weight:bold;">
                  Une fois le crédit épuisé, l'instance du bot s'arrêtera automatiquement.
                </p>
              </div>

              <div style="text-align:center;margin-bottom:32px;">
                <a href="${siteConfig.url}/dashboard/billing" style="display:inline-block;background:#7c3aed;color:#ffffff;font-size:16px;font-weight:900;text-decoration:none;padding:16px 40px;border-radius:12px;border-bottom:4px solid rgba(0,0,0,0.2);">
                  Recharger mon compte
                </a>
              </div>

              <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.6;">
                Merci de faire confiance à ${siteConfig.name} pour l'hébergement de vos services.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} ${siteConfig.name} · Tous droits réservés
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });
};

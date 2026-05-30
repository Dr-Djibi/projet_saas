export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "SaaS Bot",
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Hébergement de bots WhatsApp",
  url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  botRepoUrl: process.env.BOT_REPO_URL || "https://github.com/votre-profil/menma-bot.git",
  contactEmail: process.env.CONTACT_EMAIL || "contact@example.com",
};

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Menma App",
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Menma App",
  url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  botRepoUrl: process.env.BOT_REPO_URL,
  contactEmail: process.env.CONTACT_EMAIL,
};

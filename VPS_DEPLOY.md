# Guide de Déploiement VPS - Menma SaaS

Ce document résume les étapes pour déployer votre plateforme sur un serveur VPS.

## 1. Prérequis sur le VPS
- Installer Docker et Docker Compose.
- Cloner le dépôt : `git clone https://github.com/Dr-Djibi/menma_vps`
- Se placer dans le dossier : `cd menma_vps`

## 2. Configuration
Créez un fichier `.env` à partir du modèle :
```bash
cp .env.example .env
nano .env
```
Remplissez les variables suivantes :
- `DATABASE_URL`: URL de votre base PostgreSQL distante (ex: Supabase, Railway, ou VPS).
- `NEXTAUTH_SECRET`: Une clé générée via `openssl rand -base64 32`.
- `NEXTAUTH_URL`: L'adresse IP ou le nom de domaine de votre serveur.
- `ENCRYPTION_KEY`: Clé hexadécimale de 32 octets pour chiffrer les sessions WhatsApp.

## 3. Lancement
```bash
# Construire l'image Docker
docker build -t menma-saas .

# Lancer le conteneur
docker run -d -p 3000:3000 --name menma-saas --env-file .env menma-saas
```

## 4. Maintenance
- Pour mettre à jour : `git pull` puis reconstruire l'image.
- Les logs : `docker logs -f menma-saas`

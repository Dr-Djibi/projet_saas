# Guide de Déploiement VPS — Menma SaaS

Ce document résume les étapes pour déployer votre plateforme sur un VPS sans Docker.

---

## 1. Prérequis sur le VPS

```bash
# Node.js 20+ (via nvm recommandé)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20 && nvm use 20

# PM2 (gestionnaire de processus)
npm install -g pm2

# Git
sudo apt-get install -y git
```

---

## 2. Cloner le dépôt

```bash
git clone https://github.com/Dr-Djibi/menma_vps
cd menma_vps
npm install
```

---

## 3. Créer le dossier de stockage (EN DEHORS du projet)

> ⚠️ Ce dossier contient les instances et credentials des bots.
> Il doit être **en dehors** de `/home/menma/menma_vps` pour ne jamais être écrasé par `git pull`.

```bash
mkdir -p /home/menma/menma-users
```

---

## 4. Configurer l'environnement

```bash
cp .env.example .env
nano .env   # ou vim .env
```

Variables **obligatoires** à remplir :

| Variable | Description |
|---|---|
| `NEXTAUTH_SECRET` | Clé aléatoire : `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL publique du dashboard (ex: `https://tondomaine.com`) |
| `ENCRYPTION_KEY` | Clé hex 64 chars : `openssl rand -hex 32` |
| `USER_INSTANCES_BASE_DIR` | Dossier de stockage des bots, ex: `/home/menma/menma-users` |
| `SAAS_WEBHOOK_SECRET` | Secret partagé avec le site de session WhatsApp |
| `SMTP_*` | Vos identifiants email pour les notifications |

---

## 5. Lancer le build et démarrer avec PM2

```bash
# Build de production
npm run build

# Démarrer via PM2
pm2 start npm --name "menma-dashboard" -- run start

# Activer le démarrage automatique au reboot
pm2 startup
pm2 save
```

---

## 6. Mise à jour (sans perte de données)

Grâce à `USER_INSTANCES_BASE_DIR` défini en dehors du projet, un `git pull` ne touche jamais les bots ni leurs credentials.

```bash
cd /home/menma/menma_vps
git pull
npm install
npm run build
pm2 restart menma-dashboard
```

---

## 7. Commandes utiles

```bash
# Voir les logs du dashboard
pm2 logs menma-dashboard

# Statut des processus (dashboard + bots)
pm2 list

# Relancer après crash
pm2 restart menma-dashboard
```

---

## 8. Architecture des dossiers

```
/home/menma/
├── menma_vps/          ← Code source (git pull ici)
│   ├── .env            ← Configuration
│   ├── src/
│   └── ...
│
└── menma-users/        ← Stockage persistant (JAMAIS écrasé par git)
    ├── user-1/
    │   ├── bot/        ← Code du bot cloné
    │   │   ├── .env    ← Variables injectées par EnvService
    │   │   └── ...
    │   └── session/    ← Site de session WhatsApp
    └── user-2/
        └── ...
```

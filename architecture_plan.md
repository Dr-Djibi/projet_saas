# 🗺️ MASTER PLAN : SAAS MULTI-BOTS (MENMA & OVL)

Ce document sert de référence ultime pour l'architecture technique et le déploiement du SaaS. Il remplace toutes les versions précédentes et détaille la logique de "Future Plan".

---

## 1. 🏗️ ARCHITECTURE DU SYSTÈME DE FICHIERS (VPS)

L'isolation est la priorité. Chaque utilisateur dispose d'un environnement hermétique.

```plaintext
/var/www/menma-saas/
├── core/                        # Dashboard Next.js (Ce projet)
├── global_node_modules/         # node_modules partagé (Baileys, etc.)
├── session/         # Clone Git du Site de Session (Pairing/QR) mais juste cloner une seule fois peut gere plusieur parainage
│   ├── .env         # Config avec PORT dynamique
│   └── node_modules # Symlink vers global_node_modules
└── storage/                     # Stockage persistant des instances
    └── users/
        └── [user_uuid]/         # Racine utilisateur
            ├── bot/             # Clone Git du Bot (Menma-MD ou Ovl-MD)
            │   ├── .env         # Config automatique via EnvService
            │   └── node_modules # Symlink vers global_node_modules
            └── logs/            # Fichiers de sortie PM2
                ├── bot.out.log
                ├── bot.err.log
        
```

---

## 2. 🤖 LOGIQUE D'ORCHESTRATION (ORCHESTRATOR)

Le service `InstanceOrchestrator` gère le cycle de vie complet des instances via PM2 et Git.

### A. Provisionnement
- **Clone Automatique** : Utilisation de `GitService` pour cloner le bot choisi et le site de session.
- **Symlink node_modules** : Pour éviter d'installer 500Mo par utilisateur, un lien symbolique est créé vers un dossier central.
- **Port Dynamique** : Attribution automatique d'un port (ex: 4000-5000) pour le site de session de l'utilisateur.

### B. Configuration (.env)
- **Extraction** : Le `EnvService` lit le `.env.example` du bot cloné.
- **Injection** : Il remplit les variables (DATABASE_URL, BOT_NAME, OWNER, etc.) dynamiquement.
- **Persistence** : Les variables sont sauvegardées en base de données pour permettre l'édition via l'interface.

### C. Gestion PM2
- **Bot Process** : Nommé `bot-[user_id]`.
- **Session Process** : Nommé `session-[user_id]`.
- **Autostart** : Redémarrage automatique en cas de crash ou reboot VPS.

---

## 3. 🔐 FLUX DE CONNEXION DÉCENTRALISÉ

1. **Dashboard** : L'utilisateur clique sur "Connecter WhatsApp".
2. **Instance Locale** : Le SaaS démarre (si éteint) l'instance `session` de l'utilisateur.
3. **Redirection** : L'utilisateur est envoyé sur `https://session.votre-saas.com/[user_id]` (proxy vers le port interne).
4. **Appairage** : L'utilisateur obtient son `session_id`.
5. **Webhook** : Le site de session envoie les `creds.json` au Dashboard qui les injecte dans le dossier `bot/auth/`.
6. **Auto-Déploiement** : Le bot démarre automatiquement une fois la session reçue.

---

## 4. 💳 PAIEMENTS & ABONNEMENTS (CINETPAY & CHARIOT)

Le système de monétisation est basé sur le temps d'instance (`remainingHours`).

- **Passerelles** : Intégration de CinetPay (Mobile Money) et Chariot (Alternative locale).
- **Tickets** : Possibilité de générer/vendre des codes de recharge.
- **Expiration** : Un cron job (`billing-cron.ts`) décrémente les heures chaque heure et coupe l'instance à 0h.

---

## 5. 📧 COMMUNICATION & SÉCURITÉ (SMTP)

- **SMTP** : Utilisation de `nodemailer` pour :
  - Validation d'email (OTP).
  - Alertes de fin d'abonnement.
  - Confirmation de paiement.
- **Sécurité** : Chiffrement des tokens de session et secrets webhook.

---

## 6. 🎨 DESIGN & UX : RESPONSIVE SYSTEM (MAESTRO + UI/UX PRO MAX)

L'interface doit offrir une expérience fluide de 350px (mobile) à grand écran (desktop).

### Approche
- **Framework** : Vanilla CSS + composants React.
- **Outils** : Maestro (orchestration) et `ui-ux-pro-max` (design patterns) pour garantir une cohérence visuelle.
- **Responsive** :
  - `Mobile First` (350px+) : Navigation simplifiée, menus tactiles, lisibilité optimale.
  - `Desktop` : Exploitation de l'espace pour des tableaux de bord riches.
- **Composants** : Design System standardisé via `src/components/ui/`.

---

## 📅 ROADMAP D'IMPLÉMENTATION

1. [ ] Finalisation de l' `InstanceOrchestrator` (PM2 & Symlinks).
2. [ ] Création de l'API Webhook pour la réception des sessions.
3. [ ] Intégration des gateways de paiement.
4. [ ] Interface Dashboard pour la configuration des variables.
5. [ ] **UI/UX Design & Implémentation** : Responsive System via `ui-ux-pro-max` et Maestro.

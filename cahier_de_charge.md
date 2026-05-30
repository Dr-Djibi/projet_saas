📑 SPÉCIFICATIONS TECHNIQUES ET FONCTIONNELLES CONFLICTUELLES : PROJET SaaS

Système SaaS Multi-Utilisateurs d'Hébergement de Bots WhatsApp à Consommation de Temps Réel
1. ARCHITECTURE ET CARTOGRAPHIE SYSTÈME

Le projet est conçu pour s'exécuter dans deux environnements distincts via la configuration de la variable d'environnement NODE_ENV. Pour optimiser l'espace disque du VPS en production, le système utilise le concept de liaisons symboliques (Symlinks), évitant la duplication du dossier node_modules.
A. Arborescence des Fichiers en Production (NODE_ENV=production)
Plaintext

/home/menma/
├── menma-saas-core/             # Projet principal Next.js (Dashboard + API Express)
│   ├── package.json
│   ├── server.js                # Point d'entrée Express + Socket.io
│   └── node_modules/            # Dépendances du SaaS (Sequelize, PG, Express, etc.)
│
├── global-dependencies/         # Stockage partagé des modules lourds
│   └── node_modules/            # Contient Baileys, Axios, et toutes les dépendances du bot
│
└── menma-users-instances/       # Répertoire d'isolation des clients
    ├── user_3bc984fa/           # Dossier exclusif basé sur l'UUID de l'utilisateur
    │   ├── index.js             # Code exécutable du bot (Cloné depuis GitHub)
    │   ├── package.json
    │   ├── database.db          # Base SQLite locale propre à ce bot (données utilisateur) 
    │   ├── session/             # Identifiants de connexion WhatsApp gérés par Baileys
    │   └── node_modules -> /home/menma/global-dependencies/node_modules  [LIEN SYMBOLIQUE]
    │
    └── user_f284da10/
        ├── index.js
        ├── database.db
        ├── session/
        └── node_modules -> /home/menma/global-dependencies/node_modules  [LIEN SYMBOLIQUE]
        je precise que le database.db n'est pas forcement de ce nom et peut meme etre parfois dans un sous dossier donc il faut que l'api le trouve peu importe ou il se trouve

B. Arborescence en Mode Développement (NODE_ENV=development)

    Emplacement : Les instances de test sont créées directement à la racine du projet backend dans un dossier instances_test/user_[id].

    Comportement : Le système ignore les liens symboliques système pour éviter les conflits de permissions sur machine locale (Windows/macOS). Les processus de test s'exécutent de manière standard en exploitant le node_modules racine ou global de l'environnement de développement.

2. MODÈLES DE DONNÉES ET SCHÉMAS (SEQUELIZE / POSTGRESQL)

Toutes les relations sont gérées par Sequelize. La base de données centrale est PostgreSQL en production.
Plaintext

+-------------------+         1:1         +---------------------+
|       User        | ------------------> |     BotInstance     |
+-------------------+                     +---------------------+
| - id (UUID)       |                     | - id (UUID)         |
| - email (Unique)  |                     | - userId (FK)       |
| - isVerified      |                     | - remainingHours    |
+-------------------+                     | - status (Enum)     |
          |                               +---------------------+
          | 1:N
          v
+-------------------+
|SubscriptionTicket |
+-------------------+
| - id (UUID)       |
| - userId (FK)     |
| - code (Unique)   |
| - isUsed (Bool)   |
+-------------------+

A. Modèle User
JavaScript

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    verificationCode: { type: DataTypes.STRING, allowNull: true },
    verificationExpires: { type: DataTypes.DATE, allowNull: true }
  });
};

B. Modèle BotInstance
JavaScript

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('BotInstance', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, unique: true },
    pm2ProcessName: { type: DataTypes.STRING, allowNull: false, unique: true },
    whatsappNumber: { type: DataTypes.STRING, allowNull: true },
    botName: { type: DataTypes.STRING, defaultValue: 'Menma Bot' },
    prefix: { type: DataTypes.STRING, defaultValue: '.' },
    ownerNumber: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM('active', 'paused', 'expired'), defaultValue: 'paused' },
    remainingHours: { type: DataTypes.FLOAT, defaultValue: 72.00 }, // 72h d'essai gratuit offertes
    lastCalculated: { type: DataTypes.DATE, allowNull: true }
  });
};

C. Modèle SubscriptionTicket
JavaScript

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('SubscriptionTicket', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    hoursAmount: { type: DataTypes.INTEGER, allowNull: false }, // 168 (1 semaine) ou 720 (1 mois)
    userId: { type: DataTypes.UUID, allowNull: false }, // Verrouillage strict à l'acheteur
    isUsed: { type: DataTypes.BOOLEAN, defaultValue: false },
    usedAt: { type: DataTypes.DATE, allowNull: true }
  });
};

3. CORE LOGIC : ALGORITHMES ET ROUTINES BACKEND
A. Routine d'Inscription et Système de Nettoyage Automatique (Cron Job)

    Inscription : Sauvegarde de l'utilisateur avec isVerified: false. Génération d'un code numérique de 6 chiffres inséré dans verificationCode avec verificationExpires = Date.now() + 15 * 60 * 1000 (15 minutes). Envoi immédiat du mail via le protocole SMTP.

    Cron de Nettoyage (Toutes les 24h) :
    JavaScript

    // Pseudo-code de la routine de nettoyage
    const expiredUsers = await User.findAll({
      where: { isVerified: false, createdAt: { [Op.lt]: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } }
    });
    // Boucle de suppression définitive des comptes fantômes
    for (let user of expiredUsers) { await user.destroy(); }

B. Script de Déploiement et Injection de Lien Symbolique (VPS)

Lors du premier clic sur "Déployer" après la génération de la session :

    L'API crée le dossier /home/menma/menma-users-instances/user_[userId].

    L'API exécute la commande système : git clone https://github.com/votre-profil/menma-bot.git . à l'intérieur du dossier utilisateur créé.

    L'API applique la liaison du module via une commande système de script :
    JavaScript

    const fs = require('fs');
    if (process.env.NODE_ENV === 'production') {
      fs.symlinkSync('/home/menma/global-dependencies/node_modules', `./menma-users-instances/user_${userId}/node_modules`, 'dir');
    }

    L'API initialise la base de données SQLite locale propre au bot de l'utilisateur.

C. Algorithme Mathématique du "Forfait Compteur" (Gestion du Temps Réel)

Le calcul de la consommation d'énergie temporelle du bot est géré à la milliseconde près, converti en décimales d'heures.

    Interrupteur ON (Démarrage) :

        Exécution de la commande : pm2 start ./menma-users-instances/user_[id]/index.js --name menma-bot-[id]

        Mise à jour BDD : status = 'active', lastCalculated = Date.now()

    Interrupteur OFF (Pause Manuelle) :

        Exécution de la commande : pm2 stop menma-bot-[id]

        Calcul de la consommation :
        Δt=3600000Date.now()−lastCalculated​

        Mise à jour BDD : remainingHours = remainingHours - \Delta t, status = 'paused', lastCalculated = null

    Routine de Tâche de Fond (Vérification et décompte global toutes les 10 minutes) :
    JavaScript

    const activeBots = await BotInstance.findAll({ where: { status: 'active' } });
    const now = new Date();

    for (let bot of activeBots) {
      const deltaHours = (now - new Date(bot.lastCalculated)) / 3600000;
      bot.remainingHours -= deltaHours;

      if (bot.remainingHours <= 0) {
        bot.remainingHours = 0;
        bot.status = 'expired';
        bot.lastCalculated = null;
        exec(`pm2 stop ${bot.pm2ProcessName}`);
        sendNotificationEmail(bot.userId, "Votre crédit de temps est épuisé. Bot mis en veille.");
      } else {
        bot.lastCalculated = now;
      }
      await bot.save();
    }

D. Processus de Rétention et de Purge des Données des Instances

    Période de grâce : Si une instance tombe en état expired, le processus est arrêté mais l'intégralité du dossier utilisateur (contenant database.db SQLite et les tokens de session WhatsApp de Baileys) est conservé pendant 30 jours.

    Purge de stockage : Un script s'exécute chaque jour. Si la différence entre now et le updatedAt d'un bot au statut expired dépasse 30 jours, le dossier de stockage de l'instance est supprimé du disque dur du VPS (rm -rf).

4. INTÉGRATION EXTÉRIEURE (API PAIEMENT & ENVOI MAILS)
A. Service Passerelle de Paiement Mobile Money (Structure Modulaire)

Le controlleur de paiement implémente une interface abstraite pour permuter facilement entre Chariot API (recommandé pour Orange Money / MTN MoMo en Guinée) et CinetPay.

    Sécurisation Transactionnelle : Chaque demande d'initialisation de paiement envoie l'identifiant de l'utilisateur (userId) dans les métadonnées de la transaction.

    Webhook Sécurisé :

        L'API reçoit la notification de succès depuis les serveurs de la passerelle.

        Vérification de l'authenticité de la requête.

        Extraction du userId et du montant.

        Génération d'un code alphanumérique unique de 16 caractères (ex: MENMA-X9B2-L1K0-78PZ).

        Création de l'enregistrement dans la table SubscriptionTicket lié à l'ID utilisateur, prêt à être activé par le client.

B. Configuration du Service de Messagerie (SMTP)

    Utilisation de la bibliothèque nodemailer.

    Authentification sécurisée par variable d'environnement via mot de passe d'application.

    Événements déclencheurs de mails :

        Création de compte (Code de validation à 6 chiffres).

        Validation de paiement (Envoi officiel du code du ticket d'abonnement).

        Coupure automatique du bot pour cause d'expiration de crédit de temps.

        Procédure de réinitialisation de mot de passe oublié.

5. SPÉCIFICATIONS FONCTIONNELLES DES INTERFACES FRONTEND (NEXT.JS)
A. Console Utilisateur (Espace Client sécurisé)

    Système d'Authentification : Écrans d'inscription, de validation de code, de connexion et de réinitialisation de mot de passe (gestion des jetons d'accès JWT ou Sessions NextAuth).

    Module de Jumelage WhatsApp :

        Champ de saisie du numéro de téléphone au format international.

        Bouton d'envoi déclenchant l'écoute Socket.io.

        Affichage en temps réel du Pairing Code à 8 caractères envoyé par le serveur backend.

        Indicateur visuel d'état de connexion (Déconnecté en rouge, Connexion en cours en orange, Connecté en vert).

    Panneau Principal de Gestion du Bot (Dashboard) :

        Visualisation du Temps Réel : Un compteur dynamique affiche les heures restantes (remainingHours) converties au format textuel lisible (Ex: 124 heures et 42 minutes de fonctionnement restantes).

        Bouton Switch d'Action : Permet de basculer instantanément l'état du bot. Déclenche une requête vers l'API (/api/bot/start ou /api/bot/pause).

        Formulaire de Variables de Configuration : Inputs permettant de configurer les données enregistrées dans la base SQLite de l'instance (botName, prefix, ownerNumber).

        Zone d'activation de ticket : Input de saisie du code secret de recharge reçu par paiement ou email. Un clic sur "Activer" incrémente instantanément la valeur de remainingHours selon la valeur du ticket.

B. Console d'Administration (Espace Propriétaire sécurisé)

    Protection d'accès de Niveau 1 : Middleware applicatif Next.js/Express vérifiant le rôle admin dans la session de l'utilisateur connecté.

    Protection d'accès de Niveau 2 (Sécurité Réseau) : Middleware de restriction d'adresse IP. Le serveur Express intercepte l'adresse IP d'origine de la requête (req.ip) et rejette systématiquement l'accès si elle ne correspond pas scrupuleusement à l'adresse IP de l'administrateur configurée sur le VPS.

    Indicateurs d'Activité Globaux (KPI) :

        Nombre total d'utilisateurs enregistrés en base de données.

        Nombre total d'instances de bots actuellement en état de fonctionnement actif ('active') sur le processus PM2 du VPS.

        Graphique/Tableau financier récapitulant les transactions réussies (Filtre par jour, par mois et vue globale de la semaine passée).

    Outil de Support Technique Universel : Un panneau dédié permet à l'administrateur de rechercher n'importe quel utilisateur par son e-mail et de générer un ticket de crédit de temps manuel injecté directement sur son profil pour résoudre les cas d'assistance client.

    4.F INFRASTRUCTURE : RECONVERSION ET FLUX DES SOURCES (GITHUB TO VPS)

Pour que le SaaS fonctionne, le VPS doit gérer deux codes sources distincts provenant de GitHub : le Générateur de Session ID et le Core du Bot (Menma-MD).
1. Le Générateur de Session ID (Déploiement Unique)

Le site qui génère la session ne doit pas être cloné pour chaque utilisateur. Il est installé une seule fois sur le VPS et sert de micro-service interne.

    Chemin sur le VPS : /home/menma/session-service/

    Fonctionnement : C’est un serveur Express indépendant (ou intégré au SaaS core) connecté à un sous-domaine (ex: session.menma-saas.com). Il tourne en permanence sous PM2 (pm2 start server.js --name session-manager).

    Flux de données : Lorsque l'utilisateur fait son appairage (Pairing Code), ce service génère la chaîne SESSION_ID en mémoire, puis l'envoie via une requête HTTP POST ou un événement WebSockets (Socket.io) à l'API principale du SaaS.

2. Le Core du Bot WhatsApp (Clonage Dynamique Multi-Instances)

C'est ici que se joue l'automatisation. Le code du bot se trouve sur ton dépôt GitHub public ou privé (accessible via un Token d'accès GitHub).

Lorsque l'utilisateur clique sur "Déployer mon Bot" depuis son Dashboard Next.js, l'API Express exécute la routine automatisée suivante :
Plaintext

[Utilisateur clique sur Déployer]
       │
       ▼
1. Création du dossier physique : /home/menma/menma-users-instances/user_[UUID]
       │
       ▼
2. API exécute en tâche de fond (via child_process.exec) :
   git clone https://github.com/ton-profil/menma-bot-repo.git .
       │
       ▼
3. Injection automatique du Lien Symbolique (Symlink) :
   ln -s /home/menma/global-dependencies/node_modules ./node_modules
       │
       ▼
4. Création du fichier de configuration : .env ou config.json contenant :
   - SESSION_ID = [Reçue du service de session]
   - OWNER_NUMBER = [Numéro de l'utilisateur]
   - BOT_NAME = [Nom choisi par l'utilisateur]
   - DATABASE_PATH = "./database.db" (Pointe sur sa base SQLite locale)
       │
       ▼
5. Lancement par PM2 :
   pm2 start index.js --name "menma-bot-[UUID]" --watch

4.G LOGIQUE DE MISE A JOUR (GIT UPDATE MANUEL)

Comme spécifié, les mises à jour ne sont pas globales ni forcées par le SaaS pour éviter de couper les bots en plein fonctionnement. Elles sont gérées à la demande de l'utilisateur.
Option A : Mise à jour depuis WhatsApp (Via le Bot)

Le code source de ton bot sur GitHub intègre déjà une commande (ex: .update).

    Lorsque l'utilisateur tape cette commande sur WhatsApp, le processus du bot (qui s'exécute dans /home/menma/menma-users-instances/user_[UUID]) exécute un git pull local.

    Comme le dossier est un dépôt Git propre, il télécharge uniquement les fichiers modifiés (index.js, commandes), sans toucher à sa base SQLite database.db ni à son dossier session/.

    Le bot utilise un script d'auto-redémarrage ou PM2 relance l'instance grâce à l'option --watch.

Option B : Mise à jour depuis le Dashboard Next.js (Via l'API)

Si l'utilisateur clique sur un bouton "Mettre à jour mon bot" sur le site :

    L'API Express reçoit la demande sécurisée avec l'ID de l'utilisateur.

    L'API change de répertoire vers le dossier du client : cd /home/menma/menma-users-instances/user_[UUID].

    L'API exécute la commande système : git pull origin main.

    L'API redémarre proprement le processus PM2 spécifique : pm2 restart menma-bot-[UUID].
    
les liens git de session de du repo du bot sont a mettre dans le .env de production du site  et aussi le nom de l'app en production
sache ue le nema c'est paslui seul qui va creer donc le site sera deployer apres par moi meme et par ainz qui vas utiliser un autre nom d'app que menma-saas donc il faut que le site soit modifiable c'est a dire changer le nom du site les liens d'image etc juste lui et moi donc le fais des nom et autres sera un peu different 


4.H ANALYSE DE COÛT ET RENTABILITÉ (BUSINESS MODEL)
une semain sois 168h d'activité du bot coute 1.5 euro d'apres mes calculs 
un mois sois 720h a 6 euro donc je crois pas trop chere pour un public jeune 
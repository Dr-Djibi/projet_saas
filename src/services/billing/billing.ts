import { WhatsappBot, SubscriptionTicket, User, sequelize } from '../../lib/models';
import { InstanceOrchestrator } from '../instance-orchestrator/orchestrator';
import { Transaction, Op, literal } from 'sequelize';
import { sendExpirationWarningEmail } from '../../lib/email';

/**
 * Routine de facturation en temps réel.
 * Calcule le temps d'activité écoulé pour chaque bot actif et déduit les heures correspondantes.
 * Si le crédit d'heures d'un utilisateur est épuisé, l'instance du bot est arrêtée via PM2.
 */
export async function runBillingCron() {
  const orchestrator = new InstanceOrchestrator();
  const now = new Date();

  console.log(`[Billing Cron] Début du décompte des heures d'activité : ${now.toISOString()}`);

  try {
    // 1. Récupérer tous les bots actuellement actifs
    const activeBots = await WhatsappBot.findAll({
      where: { status: 'active', isActive: true }
    });

    console.log(`[Billing Cron] Nombre de bots actifs à traiter : ${activeBots.length}`);

    for (const bot of activeBots) {
      try {
        // Si le calcul initial n'a pas été défini, on l'initialise à maintenant
        if (!bot.lastCalculated) {
          bot.lastCalculated = now;
          await bot.save();
          continue;
        }

        // 2. Calculer le delta de temps écoulé en heures (décimales)
        const lastCalcTime = new Date(bot.lastCalculated).getTime();
        const deltaMs = now.getTime() - lastCalcTime;
        const deltaHours = deltaMs / (1000 * 60 * 60);

        // 3. Mettre à jour les heures restantes
        bot.remainingHours = Math.max(0, bot.remainingHours - deltaHours);
        bot.lastCalculated = now;

        // 4. Avertissement d'expiration imminente (<= 24h)
        if (bot.remainingHours > 0 && bot.remainingHours <= 24 && !bot.expiryAlertSent) {
          const user = await User.findByPk(bot.userId);
          if (user && user.email) {
            console.log(`[Billing Cron] Envoi email d'expiration imminente à ${user.email} pour le bot ${bot.botName}`);
            try {
              await sendExpirationWarningEmail(user.email, bot.botName || 'Menma Bot', bot.remainingHours);
              bot.expiryAlertSent = true;
            } catch (emailErr) {
              console.error(`[Billing Cron] Erreur lors de l'envoi de l'email d'expiration pour ${bot.pm2ProcessName}:`, emailErr);
            }
          }
        }

        // 5. Si le crédit est épuisé, suspendre l'instance
        if (bot.remainingHours <= 0) {
          bot.status = 'expired';
          bot.isActive = false;
          bot.lastCalculated = null;

          console.log(`[Billing Cron] Crédit épuisé pour le bot ${bot.pm2ProcessName}. Arrêt PM2.`);
          
          // Arrêter le bot et le site de session via PM2
          await orchestrator.stopAll(bot.userId);
        }

        await bot.save();
      } catch (botErr) {
        console.error(`[Billing Cron] Erreur lors du traitement du bot ${bot.pm2ProcessName} :`, botErr);
      }
    }

    console.log(`[Billing Cron] Fin du décompte.`);
  } catch (error) {
    console.error(`[Billing Cron] Erreur critique lors de l'exécution de la routine :`, error);
  }
}

/**
 * Décrémente d'une heure fixe tous les bots actifs.
 * Utilisé par le script de cron horaire.
 */
export async function decrementActiveBotsHourly() {
  const orchestrator = new InstanceOrchestrator();
  
  try {
    // Mise à jour atomique : on décrémente d'une heure
    // Utilisation de double quotes pour PostgreSQL
    const isPostgres = sequelize.getDialect() === 'postgres';
    const field = isPostgres ? '"remainingHours"' : 'remainingHours';
    
    await WhatsappBot.update(
      { 
        remainingHours: literal(`${field} - 1`),
        lastCalculated: new Date()
      },
      { 
        where: { 
          isActive: true, 
          status: 'active' 
        } 
      }
    );

    // Vérifier les bots qui viennent d'expirer
    const expiredBots = await WhatsappBot.findAll({
      where: {
        isActive: true,
        status: 'active',
        remainingHours: {
          [Op.lte]: 0
        }
      }
    });

    for (const bot of expiredBots) {
      console.log(`[Billing Cron] Bot ${bot.id} expiré. Arrêt de l'instance.`);
      bot.isActive = false;
      bot.status = 'expired';
      await bot.save();
      
      try {
        await orchestrator.stopAll(bot.userId);
      } catch (err) {
        console.error(`[Billing Cron] Erreur lors de l'arrêt de l'instance ${bot.userId}:`, err);
      }
    }
  } catch (error) {
    console.error(`[Billing Cron] Erreur lors du décompte horaire :`, error);
    throw error;
  }
}

/**
 * Rédime un ticket d'abonnement pour un utilisateur.
 */
export async function redeemTicket(userId: string, code: string) {
  return await sequelize.transaction(async (t) => {
    const ticket = await SubscriptionTicket.findOne({
      where: { code, isUsed: false },
      transaction: t,
      lock: Transaction.LOCK.UPDATE
    });

    if (!ticket) {
      throw new Error('Ticket invalide ou déjà utilisé');
    }

    const bot = await WhatsappBot.findOne({
      where: { userId },
      transaction: t,
      lock: Transaction.LOCK.UPDATE
    });

    if (!bot) {
      throw new Error('Bot introuvable pour cet utilisateur');
    }

    // Ajouter les heures
    bot.remainingHours += ticket.hoursAmount;
    
    // Si le bot était expiré, il redevient 'paused' pour que l'utilisateur puisse le relancer
    if (bot.status === 'expired') {
      bot.status = 'paused';
    }

    // Réinitialiser le flag d'alerte email si le solde remonte au-dessus de 24h
    if (bot.remainingHours > 24) {
      bot.expiryAlertSent = false;
    }
    
    await bot.save({ transaction: t });

    // Marquer le ticket comme utilisé
    ticket.isUsed = true;
    ticket.usedAt = new Date();
    ticket.userId = userId;
    await ticket.save({ transaction: t });

    return {
      remainingHours: bot.remainingHours,
      hoursAdded: ticket.hoursAmount
    };
  });
}

// Lancement automatique de la routine toutes les 10 minutes si ce module est importé/exécuté
let billingInterval: NodeJS.Timeout | null = null;

export function startBillingScheduler() {
  if (billingInterval) return;
  
  // Démarrer la routine immédiatement au lancement
  runBillingCron();
  
  // Programmer l'exécution toutes les 10 minutes (600 000 ms)
  billingInterval = setInterval(runBillingCron, 10 * 60 * 1000);
  console.log('[Billing Cron] Planificateur de facturation activé (intervalle : 10 minutes).');
}

export function stopBillingScheduler() {
  if (billingInterval) {
    clearInterval(billingInterval);
    billingInterval = null;
    console.log('[Billing Cron] Planificateur de facturation désactivé.');
  }
}

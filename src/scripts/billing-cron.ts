import { decrementActiveBotsHourly } from '../services/billing/billing';

/**
 * Script standalone pour le décompte horaire des bots.
 * Ce script est destiné à être appelé par une tâche CRON système toutes les heures.
 * Exemple: 0 * * * * cd /home/menma/menma_vps && npx tsx src/scripts/billing-cron.ts
 */
async function main() {
  const start = new Date();
  console.log(`[Billing Cron] Starting hourly decrement at ${start.toISOString()}...`);
  
  try {
    await decrementActiveBotsHourly();
    const end = new Date();
    const duration = end.getTime() - start.getTime();
    console.log(`[Billing Cron] Successfully completed in ${duration}ms.`);
    process.exit(0);
  } catch (error) {
    console.error('[Billing Cron] Critical error during execution:', error);
    process.exit(1);
  }
}

main();

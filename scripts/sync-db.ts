import { sequelize } from "../src/lib/models";

async function syncDb() {
  try {
    await sequelize.sync({ alter: true });
    console.log("Base de données synchronisée avec succès !");
  } catch (error) {
    console.error("Erreur lors de la synchro :", error);
  } finally {
    process.exit();
  }
}

syncDb();

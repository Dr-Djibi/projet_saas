import { sequelize } from '../src/lib/models.js';

async function init() {
  try {
    console.log('Synchronizing database...');
    await sequelize.sync();
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
}

init();

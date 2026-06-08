const { sequelize } = require('../src/lib/models');

async function init() {
  try {
    console.log('Synchronizing database...');
    // Sync all defined models to the db.
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  } finally {
    process.exit();
  }
}

init();

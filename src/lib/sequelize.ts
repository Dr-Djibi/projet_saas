import { Sequelize } from 'sequelize';
import path from 'path';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(process.cwd(), 'dev.db'),
  logging: false, // Passer à true pour voir les requêtes SQL
});

export default sequelize;

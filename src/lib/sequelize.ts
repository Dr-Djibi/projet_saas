import { Sequelize } from 'sequelize';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

const isPostgres = databaseUrl?.startsWith('postgres://') || databaseUrl?.startsWith('postgresql://');

const sequelize = isPostgres
  ? (console.log('Initializing Sequelize with postgres', databaseUrl), new Sequelize(databaseUrl!, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: isProduction
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
    }))
  : (console.log('Initializing Sequelize with sqlite'), new Sequelize({
      dialect: 'sqlite',
      storage: databaseUrl?.startsWith('file:') 
        ? databaseUrl.replace('file:', '') 
        : path.join(process.cwd(), 'dev.db'),
      logging: false,
    }));

export default sequelize;

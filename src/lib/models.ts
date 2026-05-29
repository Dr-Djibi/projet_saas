import { DataTypes, Model } from 'sequelize';
import sequelize from './sequelize';

export class User extends Model {}
User.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING },
  role: { type: DataTypes.ENUM('USER', 'ADMIN'), defaultValue: 'USER' },
}, { sequelize, modelName: 'user' });

export class WhatsappBot extends Model {}
WhatsappBot.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  phoneNumber: { type: DataTypes.STRING, unique: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
  welcomeMessage: { type: DataTypes.STRING, defaultValue: "Bonjour ! Comment puis-je vous aider ?" },
  fallbackMessage: { type: DataTypes.STRING, defaultValue: "Désolé, je ne comprends pas votre demande." },
}, { sequelize, modelName: 'whatsappBot' });

export class WhatsappSession extends Model {}
WhatsappSession.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  creds: { type: DataTypes.TEXT, allowNull: false },
  keys: { type: DataTypes.TEXT, allowNull: false },
}, { sequelize, modelName: 'whatsappSession' });

// Relations
User.hasOne(WhatsappBot);
WhatsappBot.belongsTo(User);
WhatsappBot.hasOne(WhatsappSession);
WhatsappSession.belongsTo(WhatsappBot);

export { sequelize };

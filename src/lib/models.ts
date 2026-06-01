import { DataTypes, Model, Sequelize } from 'sequelize';
import sequelize from './sequelize';

export class User extends Model {
  public id!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  public role!: 'user' | 'admin';
  public isVerified!: boolean;
  public verificationCode!: string | null;
  public verificationExpires!: Date | null;
}

User.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  username: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verificationCode: { type: DataTypes.STRING, allowNull: true },
  verificationExpires: { type: DataTypes.DATE, allowNull: true }
}, { sequelize, modelName: 'User' });

export class WhatsappBot extends Model {
  public id!: string;
  public userId!: string;
  public pm2ProcessName!: string;
  public whatsappNumber!: string | null;
  public botName!: string;
  public prefix!: string;
  public ownerNumber!: string | null;
  public status!: 'active' | 'paused' | 'expired';
  public isActive!: boolean;
  public remainingHours!: number;
  public lastCalculated!: Date | null;
}

WhatsappBot.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, unique: true },
  pm2ProcessName: { type: DataTypes.STRING, allowNull: false, unique: true },
  whatsappNumber: { type: DataTypes.STRING, allowNull: true },
  botName: { type: DataTypes.STRING, defaultValue: 'Menma Bot' },
  prefix: { type: DataTypes.STRING, defaultValue: '.' },
  ownerNumber: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM('active', 'paused', 'expired'), defaultValue: 'paused' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
  remainingHours: { type: DataTypes.DOUBLE, defaultValue: 72.00 },
  lastCalculated: { type: DataTypes.DATE, allowNull: true }
}, { sequelize, modelName: 'WhatsappBot' });

export class WhatsappSession extends Model {
  public id!: string;
  public botId!: string;
  public creds!: string | null;
  public keys!: string | null;
}

WhatsappSession.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  botId: { type: DataTypes.UUID, allowNull: false, unique: true },
  creds: { type: DataTypes.TEXT, allowNull: true },
  keys: { type: DataTypes.TEXT, allowNull: true }
}, { sequelize, modelName: 'WhatsappSession' });

export class SubscriptionTicket extends Model {
  public id!: string;
  public code!: string;
  public hoursAmount!: number;
  public userId!: string;
  public transactionId!: string | null;
  public isUsed!: boolean;
  public usedAt!: Date | null;
}

SubscriptionTicket.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  hoursAmount: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  transactionId: { type: DataTypes.UUID, allowNull: true },
  isUsed: { type: DataTypes.BOOLEAN, defaultValue: false },
  usedAt: { type: DataTypes.DATE, allowNull: true }
}, { sequelize, modelName: 'SubscriptionTicket' });

export class PaymentTransaction extends Model {
  public id!: string;
  public userId!: string;
  public amount!: number;
  public currency!: string;
  public status!: 'pending' | 'success' | 'failed';
  public type!: 'ticket' | 'direct';
  public metadata!: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PaymentTransaction.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  amount: { type: DataTypes.DOUBLE, allowNull: false },
  currency: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'success', 'failed'), defaultValue: 'pending' },
  type: { type: DataTypes.ENUM('ticket', 'direct'), allowNull: false },
  metadata: { type: DataTypes.JSONB, allowNull: true }
}, { sequelize, modelName: 'PaymentTransaction' });

export class SystemSetting extends Model {
  public key!: string;
  public value!: string;
  public description!: string | null;
}

SystemSetting.init({
  key: { type: DataTypes.STRING, primaryKey: true },
  value: { type: DataTypes.TEXT, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: true }
}, { sequelize, modelName: 'SystemSetting' });

// Relations
User.hasOne(WhatsappBot, { foreignKey: 'userId' });
WhatsappBot.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(SubscriptionTicket, { foreignKey: 'userId' });
SubscriptionTicket.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(PaymentTransaction, { foreignKey: 'userId' });
PaymentTransaction.belongsTo(User, { foreignKey: 'userId' });

PaymentTransaction.hasOne(SubscriptionTicket, { foreignKey: 'transactionId' });
SubscriptionTicket.belongsTo(PaymentTransaction, { foreignKey: 'transactionId' });

WhatsappBot.hasOne(WhatsappSession, { foreignKey: 'botId' });
WhatsappSession.belongsTo(WhatsappBot, { foreignKey: 'botId' });

export { sequelize };

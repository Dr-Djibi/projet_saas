import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from './sequelize';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare username: string;
  declare email: string;
  declare password: string;
  declare role: CreationOptional<'user' | 'admin'>;
  declare isVerified: CreationOptional<boolean>;
  declare verificationCode: string | null;
  declare verificationExpires: Date | null;
  declare encryptedName: string | null;
  declare encryptedEmail: string | null;
}

User.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  username: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verificationCode: { type: DataTypes.STRING, allowNull: true },
  verificationExpires: { type: DataTypes.DATE, allowNull: true },
  encryptedName: { type: DataTypes.STRING, allowNull: true },
  encryptedEmail: { type: DataTypes.STRING, allowNull: true }
}, { sequelize, modelName: 'User' });

export class WhatsappBot extends Model<InferAttributes<WhatsappBot>, InferCreationAttributes<WhatsappBot>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare botType: CreationOptional<'menma' | 'ovl'>;
  declare pm2ProcessName: string;
  declare whatsappNumber: CreationOptional<string | null>;
  declare botName: CreationOptional<string>;
  declare prefix: CreationOptional<string>;
  declare ownerNumber: CreationOptional<string | null>;
  declare status: CreationOptional<'active' | 'paused' | 'expired'>;
  declare isActive: CreationOptional<boolean>;
  declare remainingHours: CreationOptional<number>;
  declare lastCalculated: CreationOptional<Date | null>;
  declare port: CreationOptional<number | null>;
  declare expiryAlertSent: CreationOptional<boolean>;
}


WhatsappBot.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, unique: true },
  botType: { type: DataTypes.ENUM('menma', 'ovl'), defaultValue: 'menma' },
  pm2ProcessName: { type: DataTypes.STRING, allowNull: false, unique: true },
  whatsappNumber: { type: DataTypes.STRING, allowNull: true },
  botName: { type: DataTypes.STRING, defaultValue: 'Menma Bot' },
  prefix: { type: DataTypes.STRING, defaultValue: '.' },
  ownerNumber: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM('active', 'paused', 'expired'), defaultValue: 'paused' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
  remainingHours: { type: DataTypes.DOUBLE, defaultValue: 72.00 },
  lastCalculated: { type: DataTypes.DATE, allowNull: true },
  port: { type: DataTypes.INTEGER, allowNull: true, unique: true },
  expiryAlertSent: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { sequelize, modelName: 'WhatsappBot' });

export class WhatsappSession extends Model<InferAttributes<WhatsappSession>, InferCreationAttributes<WhatsappSession>> {
  declare id: CreationOptional<string>;
  declare botId: string;
  declare creds: CreationOptional<string | null>;
  declare keys: CreationOptional<string | null>;
}

WhatsappSession.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  botId: { type: DataTypes.UUID, allowNull: false, unique: true },
  creds: { type: DataTypes.TEXT, allowNull: true },
  keys: { type: DataTypes.TEXT, allowNull: true }
}, { sequelize, modelName: 'WhatsappSession' });

export class SubscriptionTicket extends Model<InferAttributes<SubscriptionTicket>, InferCreationAttributes<SubscriptionTicket>> {
  declare id: CreationOptional<string>;
  declare code: string;
  declare hoursAmount: number;
  declare userId: string;
  declare transactionId: CreationOptional<string | null>;
  declare isUsed: CreationOptional<boolean>;
  declare usedAt: CreationOptional<Date | null>;
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

export class PaymentTransaction extends Model<InferAttributes<PaymentTransaction>, InferCreationAttributes<PaymentTransaction>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare amount: number;
  declare currency: string;
  declare status: CreationOptional<'pending' | 'success' | 'failed'>;
  declare type: 'ticket' | 'direct';
  declare metadata: CreationOptional<Record<string, unknown> | null>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

PaymentTransaction.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  amount: { type: DataTypes.DOUBLE, allowNull: false },
  currency: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'success', 'failed'), defaultValue: 'pending' },
  type: { type: DataTypes.ENUM('ticket', 'direct'), allowNull: false },
  metadata: { type: DataTypes.JSONB, allowNull: true },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, { sequelize, modelName: 'PaymentTransaction', timestamps: true });

export class PaymentLog extends Model<InferAttributes<PaymentLog>, InferCreationAttributes<PaymentLog>> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare transactionId: string;
  declare provider: 'cinetpay' | 'chariot';
  declare amount: number;
  declare status: string;
  declare metadata: CreationOptional<Record<string, unknown> | null>;
}

PaymentLog.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  transactionId: { type: DataTypes.STRING, allowNull: false, unique: true },
  provider: { type: DataTypes.ENUM('cinetpay', 'chariot'), allowNull: false },
  amount: { type: DataTypes.DOUBLE, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  metadata: { type: DataTypes.JSONB, allowNull: true }
}, { sequelize, modelName: 'PaymentLog' });

export class SystemSetting extends Model<InferAttributes<SystemSetting>, InferCreationAttributes<SystemSetting>> {
  declare key: string;
  declare value: string;
  declare description: CreationOptional<string | null>;
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

User.hasMany(PaymentLog, { foreignKey: 'userId' });
PaymentLog.belongsTo(User, { foreignKey: 'userId' });

PaymentTransaction.hasOne(SubscriptionTicket, { foreignKey: 'transactionId' });
SubscriptionTicket.belongsTo(PaymentTransaction, { foreignKey: 'transactionId' });

WhatsappBot.hasOne(WhatsappSession, { foreignKey: 'botId' });
WhatsappSession.belongsTo(WhatsappBot, { foreignKey: 'botId' });

export { sequelize };

import { WhatsappBot } from './src/lib/models';
import sequelize from './src/lib/db';

async function main() {
  await sequelize.sync();
  const deleted = await WhatsappBot.destroy({
    where: { userId: '79b9c50e-ac1a-4e69-b421-50be6b987806' }
  });
  console.log('Deleted bots:', deleted);
}

main().catch(console.error);

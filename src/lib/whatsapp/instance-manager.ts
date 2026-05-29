import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { getSequelizeAuthState } from "./sequelize-auth";
import { WhatsappBot } from "../models";

class WhatsAppInstanceManager {
  private instances: Map<string, WASocket> = new Map();

  async initInstance(botId: string) {
    if (this.instances.has(botId)) {
      return this.instances.get(botId);
    }

    const state = await getSequelizeAuthState(botId);
    const { saveCreds } = state;
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      printQRInTerminal: false,
      auth: state,
      browser: ["Menma VPS", "Chrome", "1.0.0"],
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;

        if (shouldReconnect) {
          this.initInstance(botId);
        } else {
          this.instances.delete(botId);
          await WhatsappBot.update({ isActive: false }, { where: { id: botId } });
        }
      } else if (connection === "open") {
        this.instances.set(botId, sock);
        await WhatsappBot.update({ isActive: true }, { where: { id: botId } });
      }

      if (qr) {
        console.log(`New QR for ${botId}: ${qr}`);
      }
    });

    sock.ev.on("messages.upsert", async (m) => {
      if (m.type === "notify") {
        for (const msg of m.messages) {
          if (!msg.key.fromMe && msg.message) {
            await this.handleIncomingMessage(botId, sock, msg);
          }
        }
      }
    });

    return sock;
  }

  private async handleIncomingMessage(botId: string, sock: WASocket, msg: any) {
    const bot = await WhatsappBot.findByPk(botId) as any;
    if (!bot) return;

    const jid = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

    if (text?.toLowerCase() === "hi" || text?.toLowerCase() === "bonjour") {
      await sock.sendMessage(jid, { text: bot.welcomeMessage || "Bonjour !" });
    }
  }

  getInstance(botId: string) {
    return this.instances.get(botId);
  }
}

export const instanceManager = new WhatsAppInstanceManager();

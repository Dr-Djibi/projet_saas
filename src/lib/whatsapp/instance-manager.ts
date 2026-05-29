import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { getPrismaAuthState } from "./prisma-auth";
import { prisma } from "../prisma";

class WhatsAppInstanceManager {
  private instances: Map<string, WASocket> = new Map();

  async initInstance(botId: string) {
    if (this.instances.has(botId)) {
      return this.instances.get(botId);
    }

    const state = await getPrismaAuthState(botId);
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

        console.log(
          "connection closed due to ",
          lastDisconnect?.error,
          ", reconnecting ",
          shouldReconnect
        );

        if (shouldReconnect) {
          this.initInstance(botId);
        } else {
          this.instances.delete(botId);
          await prisma.whatsappBot.update({
            where: { id: botId },
            data: { isActive: false },
          });
        }
      } else if (connection === "open") {
        console.log("opened connection");
        this.instances.set(botId, sock);
        await prisma.whatsappBot.update({
          where: { id: botId },
          data: { isActive: true },
        });
      }

      // Handle QR code event (can be sent via websocket or stored for polling)
      if (qr) {
        // Emit QR to frontend (to be implemented via Socket.io or similar)
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
    const bot = await prisma.whatsappBot.findUnique({
      where: { id: botId },
    });

    if (!bot) return;

    const jid = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

    // Basic logic: welcome message for first interaction or simple command
    // This can be expanded based on user's bot requirements
    if (text?.toLowerCase() === "hi" || text?.toLowerCase() === "bonjour") {
      await sock.sendMessage(jid, { text: bot.welcomeMessage || "Bonjour !" });
    } else {
      // await sock.sendMessage(jid, { text: bot.fallbackMessage || "Désolé, je ne comprends pas." });
    }
  }

  getInstance(botId: string) {
    return this.instances.get(botId);
  }
}

export const instanceManager = new WhatsAppInstanceManager();

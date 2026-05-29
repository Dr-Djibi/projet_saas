import makeWASocket, {
    fetchLatestBaileysVersion,
    Browsers,
} from "@whiskeysockets/baileys";
import pino from "pino";
import { getSequelizeAuthState } from "@/lib/whatsapp/sequelize-auth";

export async function generatePairingCode(botId: string, phoneNumber: string) {
    const state = await getSequelizeAuthState(botId);
    const { saveCreds } = state;
    
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: Browsers.macOS("Chrome"),
    });

    sock.ev.on("creds.update", saveCreds);

    if (!sock.authState.creds.registered) {
        const code = await sock.requestPairingCode(phoneNumber);
        return code;
    }
    
    return null;
}

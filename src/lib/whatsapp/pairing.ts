import makeWASocket, {
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers,
} from "@whiskeysockets/baileys";
import { prisma } from "@/lib/prisma";
import pino from "pino";
import { getPrismaAuthState } from "@/lib/whatsapp/prisma-auth";

export async function generatePairingCode(botId: string, phoneNumber: string) {
    const state = await getPrismaAuthState(botId);
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

import { proto } from "@whiskeysockets/baileys";
import { AuthenticationCreds, AuthenticationState } from "@whiskeysockets/baileys";
import { BufferJSON, initAuthCreds } from "@whiskeysockets/baileys";
import { WhatsappSession } from "../models";
import { encrypt, decrypt } from "../encryption";

export const getSequelizeAuthState = async (botId: string): Promise<AuthenticationState & { saveCreds: () => Promise<void> }> => {
  const writeData = async (data: any, type: string) => {
    const encryptedData = encrypt(JSON.stringify(data, BufferJSON.replacer));
    
    await WhatsappSession.upsert({
      botId,
      [type]: encryptedData,
    } as any);
  };

  const readData = async (type: string) => {
    try {
      const session = await WhatsappSession.findOne({ where: { botId } }) as any;

      if (!session || !session[type]) {
        return null;
      }

      const decryptedData = decrypt(session[type]);
      return JSON.parse(decryptedData, BufferJSON.reviver);
    } catch (error) {
      console.error(`Error reading ${type} from DB:`, error);
      return null;
    }
  };

  const creds: AuthenticationCreds = (await readData("creds")) || initAuthCreds();
  let keys: any = (await readData("keys")) || {};

  return {
    creds,
    keys: {
      get: (type, ids) => {
        const data: any = {};
        for (const id of ids) {
          let value = keys[`${type}-${id}`];
          if (value) {
            if (type === "app-state-sync-key") {
              value = proto.Message.AppStateSyncKeyData.fromObject(value);
            }
            data[id] = value;
          }
        }
        return data;
      },
      set: async (data: any) => {
        for (const category in data) {
          for (const id in data[category]) {
            const value = data[category][id];
            const key = `${category}-${id}`;
            if (value) {
              keys[key] = value;
            } else {
              delete keys[key];
            }
          }
        }
        await writeData(keys, "keys");
      },
    },
    saveCreds: () => writeData(creds, "creds"),
  };
};

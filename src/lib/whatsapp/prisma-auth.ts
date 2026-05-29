import { proto } from "@whiskeysockets/baileys";
import { AuthenticationCreds, AuthenticationState, SignalDataTypeMap } from "@whiskeysockets/baileys";
import { BufferJSON, initAuthCreds } from "@whiskeysockets/baileys";
import { prisma } from "../prisma";
import { encrypt, decrypt } from "../encryption";

export const getPrismaAuthState = async (botId: string): Promise<AuthenticationState & { saveCreds: () => Promise<void> }> => {
  const writeData = async (data: any, type: string) => {
    const encryptedData = encrypt(JSON.stringify(data, BufferJSON.replacer));
    
    await prisma.whatsappSession.upsert({
      where: { botId },
      update: { [type]: encryptedData },
      create: { 
        botId,
        creds: type === "creds" ? encryptedData : "",
        keys: type === "keys" ? encryptedData : "{}"
      },
    });
  };

  const readData = async (type: string) => {
    try {
      const session = await prisma.whatsappSession.findUnique({
        where: { botId },
      });

      if (!session || !session[type as keyof typeof session]) {
        return null;
      }

      const decryptedData = decrypt(session[type as keyof typeof session] as string);
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

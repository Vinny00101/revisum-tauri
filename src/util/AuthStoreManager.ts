import { User } from "@/types/models";
import { load } from "@tauri-apps/plugin-store";

interface AuthData {
  user: User;
  expiresAt: number;
  savedAt: number;
}

// Defer auth storage until StorageGate has released the normal application.
const getStore = () => load('store.json');

export default class AuthStoreManager {

  static async set(user: User, days: number = 7) {
    const store = await getStore();
    const now = Date.now();

    const data: AuthData = {
      user,
      savedAt: now,
      expiresAt: now + days * 864e5,
    };

    await store.set("auth", data);
    await store.save();
  }

  static async get(): Promise<AuthData | null> {
    const store = await getStore();
    const data = await store.get<AuthData>("auth");

    if (!data) return null;

    if (Date.now() > data.expiresAt) {
      await this.remove();
      return null;
    }

    return data;
  }

  static async remove() {
    const store = await getStore();
    await store.delete("auth");
    await store.save();
  }
}

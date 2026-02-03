import User from "@/types/User";
import { load } from "@tauri-apps/plugin-store";

interface AuthData {
  user: User;
  expiresAt: number;
  savedAt: number;
}

const store = await load('store.json');

export default class AuthStoreManager {

  static async set(user: User, days: number = 7) {
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
    const data = await store.get<AuthData>("auth");

    if (!data) return null;

    if (Date.now() > data.expiresAt) {
      await this.remove();
      return null;
    }

    return data;
  }

  static async remove() {
    await store.delete("auth");
    await store.save();
  }
}

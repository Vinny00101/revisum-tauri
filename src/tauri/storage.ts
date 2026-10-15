import { invoke } from "@tauri-apps/api/core";

export interface StorageStatus {
  state: "ready" | "recovery_required" | "restart_required";
  message: string;
  data_directory: string;
  app_version: string;
  schema_version: number | null;
  automatic_backup: string | null;
}

export interface StorageBackup {
  id: string;
  created_at: string;
  app_version: string;
  schema_version: number;
  reason: string;
  tables: Record<string, number>;
  files: { path: string; bytes: number; sha256: string }[];
}

export const getStorageStatus = () => invoke<StorageStatus>("get_storage_status");
export const listStorageBackups = () => invoke<StorageBackup[]>("list_storage_backups");
export const createStorageBackup = () => invoke<StorageBackup>("create_storage_backup");
export const restoreStorageBackup = (backupId: string) => invoke<void>("restore_storage_backup", { backup_id: backupId });

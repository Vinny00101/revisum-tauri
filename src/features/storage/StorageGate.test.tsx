import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StorageGate from "./StorageGate";
import { createStorageBackup, getStorageStatus, listStorageBackups, restoreStorageBackup, StorageBackup, StorageStatus } from "@/tauri/storage";

vi.mock("@/tauri/storage", () => ({
  createStorageBackup: vi.fn(), getStorageStatus: vi.fn(),
  listStorageBackups: vi.fn(), restoreStorageBackup: vi.fn(),
}));

const ready: StorageStatus = {
  state: "ready", message: "", data_directory: "C:/test/Revisum",
  app_version: "0.4.0-alpha.1", schema_version: 4, automatic_backup: null,
};
const saved: StorageBackup = {
  id: "11111111-1111-4111-8111-111111111111", created_at: "2026-10-15T12:00:00Z",
  app_version: "0.3.0", schema_version: 3, reason: "before-migration",
  tables: { discipline: 2, studyitem: 4 }, files: [],
};
const mount = () => render(<StorageGate><p>Conteúdo dos estudos</p></StorageGate>);

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getStorageStatus).mockResolvedValue(ready);
  vi.mocked(listStorageBackups).mockResolvedValue([saved]);
  vi.mocked(createStorageBackup).mockResolvedValue(saved);
  vi.mocked(restoreStorageBackup).mockResolvedValue(undefined);
});
afterEach(cleanup);

describe("storage protection boundary", () => {
  it("does not mount study screens until the native preflight is ready", async () => {
    let release!: (value: StorageStatus) => void;
    vi.mocked(getStorageStatus).mockReturnValue(new Promise(resolve => { release = resolve; }));
    mount();
    expect(screen.queryByText("Conteúdo dos estudos")).toBeNull();
    expect(screen.getByText("Verificando seus dados…")).toBeTruthy();
    await act(async () => { release(ready); });
    expect(await screen.findByText("Conteúdo dos estudos")).toBeTruthy();
  });

  it("offers recovery instead of login or studies for a blocked database", async () => {
    vi.mocked(getStorageStatus).mockResolvedValue({ ...ready, state: "recovery_required", schema_version: null, message: "Checksum desconhecido; dados preservados." });
    mount();
    expect(await screen.findByRole("heading", { name: "Seus dados precisam de atenção" })).toBeTruthy();
    expect(screen.queryByText("Conteúdo dos estudos")).toBeNull();
    expect(screen.queryByRole("button", { name: "Criar backup agora" })).toBeNull();
    expect(screen.getByRole("button", { name: "Selecionar para restaurar" })).toBeTruthy();
  });

  it("does not bypass protection when the native status command fails", async () => {
    vi.mocked(getStorageStatus).mockRejectedValue(new Error("Native bridge unavailable"));
    mount();
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.queryByText("Conteúdo dos estudos")).toBeNull();
  });

  it("creates a verified backup through the native command and keeps studies available", async () => {
    const user = userEvent.setup();
    mount();
    await user.click(await screen.findByRole("button", { name: "Dados e backups" }));
    expect(await screen.findByRole("dialog", { name: "Proteção dos dados" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Criar backup agora" }));
    expect(await screen.findByText(/Backup criado e verificado/)).toBeTruthy();
    expect(createStorageBackup).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Conteúdo dos estudos")).toBeTruthy();
  });

  it("requires explicit confirmation of the selected backup and blocks studies after restoration", async () => {
    const user = userEvent.setup();
    vi.mocked(restoreStorageBackup).mockImplementation(async () => {
      vi.mocked(getStorageStatus).mockResolvedValue({ ...ready, state: "restart_required", message: "Feche e reabra o Revisum." });
    });
    mount();
    await user.click(await screen.findByRole("button", { name: "Dados e backups" }));
    await user.click(await screen.findByRole("button", { name: "Selecionar para restaurar" }));
    const restore = screen.getByRole("button", { name: "Restaurar esta cópia" }) as HTMLButtonElement;
    expect(restore.disabled).toBe(true);
    expect(restoreStorageBackup).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText("Digite RESTAURAR para confirmar"), "RESTAURAR");
    await user.click(restore);
    expect(await screen.findByRole("heading", { name: "Reabra o Revisum" })).toBeTruthy();
    expect(restoreStorageBackup).toHaveBeenCalledWith(saved.id);
    expect(screen.queryByText("Conteúdo dos estudos")).toBeNull();
  });

  it("uses the native state after a failed restore instead of reopening a closed pool", async () => {
    const user = userEvent.setup();
    vi.mocked(restoreStorageBackup).mockImplementation(async () => {
      vi.mocked(getStorageStatus).mockResolvedValue({ ...ready, state: "recovery_required", message: "Recuperação pendente." });
      throw new Error("Restore interrupted");
    });
    mount();
    await user.click(await screen.findByRole("button", { name: "Dados e backups" }));
    await user.click(await screen.findByRole("button", { name: "Selecionar para restaurar" }));
    await user.type(screen.getByLabelText("Digite RESTAURAR para confirmar"), "RESTAURAR");
    await user.click(screen.getByRole("button", { name: "Restaurar esta cópia" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.queryByText("Conteúdo dos estudos")).toBeNull();
    expect(screen.getByRole("heading", { name: "Seus dados precisam de atenção" })).toBeTruthy();
  });

  it("keeps keyboard focus in the dialog and returns it when Escape closes it", async () => {
    const user = userEvent.setup();
    mount();
    const trigger = await screen.findByRole("button", { name: "Dados e backups" });
    await user.click(trigger);
    const dialog = await screen.findByRole("dialog");
    expect(document.activeElement).toBe(dialog);
    await user.tab({ shift: true });
    expect(dialog.contains(document.activeElement)).toBe(true);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Dados e backups" }));
  });
});

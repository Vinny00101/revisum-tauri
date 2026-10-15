import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, DatabaseBackup, LoaderCircle, ShieldCheck, X } from "lucide-react";
import { createStorageBackup, getStorageStatus, listStorageBackups, restoreStorageBackup, StorageBackup, StorageStatus } from "@/tauri/storage";

function reasonLabel(reason: string) {
  return ({ manual: "Criado por você", "before-migration": "Antes de atualizar o banco", "before-restore": "Antes de uma restauração" } as Record<string, string>)[reason] ?? reason;
}

export default function StorageGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<StorageStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [backups, setBackups] = useState<StorageBackup[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState<"backup" | "restore" | null>(null);
  const operation = useRef(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const refresh = useCallback(async () => {
    try {
      const current = await getStorageStatus();
      setStatus(current);
      setError("");
      setBackups(await listStorageBackups());
    } catch (cause) { setError(String(cause)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (loading || (!open && status?.state === "ready" && busy !== "restore")) return;
    const panel = panelRef.current;
    const previous = document.activeElement;
    panel?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape" && status?.state === "ready" && busy === null) {
        setOpen(false); setSelected(null); setConfirmation("");
      }
      if (event.key !== "Tab" || !panel) return;
      const controls = [...panel.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), [tabindex="0"]')];
      const first = controls[0], last = controls[controls.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel)) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => {
      document.removeEventListener("keydown", keyboard);
      if (triggerRef.current) triggerRef.current.focus();
      else if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [loading, open, status?.state, busy]);

  const backup = async () => {
    if (operation.current) return;
    operation.current = true;
    setBusy("backup"); setError(""); setNotice("");
    try {
      await createStorageBackup();
      await refresh();
      setNotice("Backup criado e verificado. Ele inclui seus estudos e as imagens armazenadas pelo Revisum.");
    } catch (cause) { setError(String(cause)); }
    finally { operation.current = false; setBusy(null); }
  };

  const restore = async () => {
    if (!selected || confirmation !== "RESTAURAR" || operation.current) return;
    operation.current = true;
    setBusy("restore"); setError(""); setNotice("");
    try {
      await restoreStorageBackup(selected);
      setSelected(null); setConfirmation("");
      await refresh();
    } catch (cause) {
      // Restoration may have closed the pool even when it could not finish.
      // Read the authoritative state before allowing study screens again.
      try { setStatus(await getStorageStatus()); } catch { setStatus(null); }
      setError(String(cause));
    } finally { operation.current = false; setBusy(null); }
  };

  if (loading) return <main className="min-h-screen flex items-center justify-center gap-3 bg-slate-50" aria-busy="true"><LoaderCircle className="animate-spin" aria-hidden="true" /> Verificando seus dados…</main>;

  const ready = status?.state === "ready";
  const panel = open || !ready || busy === "restore";
  const selectedBackup = backups.find(item => item.id === selected);

  return <>
    {ready && busy !== "restore" && children}
    {ready && !panel && <button ref={triggerRef} type="button" onClick={() => { setOpen(true); void refresh(); }} className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-lg focus-visible:outline-2 focus-visible:outline-blue-600"><DatabaseBackup size={18} aria-hidden="true" /> Dados e backups</button>}
    {panel && <div className={ready ? "fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 sm:p-8" : "min-h-screen bg-slate-100 p-4 sm:p-8"}>
      <section ref={panelRef} tabIndex={-1} role={ready ? "dialog" : "region"} aria-modal={ready ? true : undefined} aria-label="Proteção dos dados" className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-xl outline-none sm:p-8" aria-busy={busy !== null}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            {ready ? <ShieldCheck className="mt-1 shrink-0 text-emerald-600" aria-hidden="true" /> : <AlertTriangle className="mt-1 shrink-0 text-amber-600" aria-hidden="true" />}
            <div><h1 className="text-xl font-semibold text-slate-900">{ready ? "Seus dados e backups" : status?.state === "restart_required" ? "Reabra o Revisum" : "Seus dados precisam de atenção"}</h1>
              <p className="mt-2 text-sm text-slate-600">{ready ? "Crie uma cópia dos seus estudos ou recupere uma cópia anterior." : status?.message || "Não foi possível verificar o armazenamento. O acesso aos estudos está bloqueado até a verificação."}</p>
            </div>
          </div>
          {ready && !busy && <button type="button" aria-label="Fechar proteção dos dados" onClick={() => { setOpen(false); setSelected(null); setConfirmation(""); }} className="rounded p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>}
        </div>
        {status && <div className="mt-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-600"><p>Revisum {status.app_version}{status.schema_version !== null && ` · Banco ${status.schema_version}`}</p><p className="mt-1 break-all">Pasta de dados: {status.data_directory}</p></div>}
        {status?.message && ready && <p role="status" className="mt-4 text-sm text-amber-800">{status.message}</p>}
        {error && <p role="alert" className="mt-4 break-words rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {notice && <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
        {busy && <p role="status" className="mt-4 flex items-center gap-2 text-sm text-blue-800"><LoaderCircle size={18} className="animate-spin" aria-hidden="true" />{busy === "backup" ? "Criando e verificando a cópia. Aguarde…" : "Verificando e restaurando a cópia. Aguarde…"}</p>}
        <div className="mt-5 flex flex-wrap gap-3">
          {ready && <button type="button" disabled={busy !== null} onClick={() => void backup()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Criar backup agora</button>}
          <button type="button" disabled={busy !== null} onClick={() => void refresh()} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 disabled:opacity-50">Atualizar informações</button>
        </div>
        <h2 className="mt-7 text-base font-semibold text-slate-900">Cópias locais disponíveis</h2>
        <p className="mt-1 text-sm text-slate-600">A integridade do banco e dos arquivos é verificada antes de restaurar. Cópias incompletas não são usadas.</p>
        {backups.length === 0 ? <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">Nenhum backup completo encontrado nesta pasta de dados.</p> : <ul className="mt-4 space-y-3">{backups.map(item => <li key={item.id} className="rounded-lg border border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium text-slate-800">{new Date(item.created_at).toLocaleString("pt-BR")}</p><p className="mt-1 text-sm text-slate-500">{reasonLabel(item.reason)} · Revisum {item.app_version} · Banco {item.schema_version}</p><p className="mt-1 text-xs text-slate-500">{item.files.length} arquivo(s) · {item.tables.discipline ?? 0} disciplina(s) · {item.tables.studyitem ?? 0} item(ns)</p></div>
            <button type="button" disabled={busy !== null || status?.state === "restart_required"} onClick={() => { setSelected(item.id); setConfirmation(""); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">Selecionar para restaurar</button>
          </div>
        </li>)}</ul>}
        {selectedBackup && <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <h3 className="font-semibold text-amber-950">Restaurar a cópia de {new Date(selectedBackup.created_at).toLocaleString("pt-BR")}?</h3>
          <p className="mt-2 text-sm text-amber-950">Isso substituirá os estudos e as imagens atuais pelos desta cópia. Os arquivos anteriores serão preservados para recuperação. Finalize suas atividades antes de continuar; depois será necessário fechar e reabrir o aplicativo.</p>
          <label htmlFor="restore-confirmation" className="mt-4 block text-sm font-medium text-amber-950">Digite RESTAURAR para confirmar</label>
          <input id="restore-confirmation" autoComplete="off" value={confirmation} onChange={event => setConfirmation(event.target.value)} disabled={busy !== null} className="mt-2 w-full rounded-lg border border-amber-400 bg-white px-3 py-2" />
          <div className="mt-3 flex gap-3"><button type="button" disabled={confirmation !== "RESTAURAR" || busy !== null} onClick={() => void restore()} className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Restaurar esta cópia</button><button type="button" disabled={busy !== null} onClick={() => { setSelected(null); setConfirmation(""); }} className="rounded-lg px-3 py-2 text-sm text-amber-950">Cancelar</button></div>
        </div>}
        <p className="mt-6 text-xs leading-relaxed text-slate-500">As cópias ficam no mesmo dispositivo, dentro da pasta backups. Guarde também uma cópia dessa pasta em outro local para se proteger contra falha do disco. Nenhum backup é excluído automaticamente nesta versão.</p>
      </section>
    </div>}
  </>;
}

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastCtx = { notify: (mensagem: string) => void };

const Ctx = createContext<ToastCtx>({ notify: () => undefined });

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [mensagem, setMensagem] = useState<string | null>(null);

  const notify = useCallback((texto: string) => {
    setMensagem(texto);
    window.setTimeout(() => setMensagem(null), 3200);
  }, []);

  const valor = useMemo(() => ({ notify }), [notify]);

  return (
    <Ctx.Provider value={valor}>
      {children}
      {mensagem ? (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 shadow-xl shadow-black/40"
        >
          {mensagem}
        </div>
      ) : null}
    </Ctx.Provider>
  );
}

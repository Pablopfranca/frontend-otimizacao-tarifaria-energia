import { Link } from "react-router-dom";
import { rotuloClasse } from "../lib/format";

type Props = {
  to: string;
  titulo: string;
  numero: string;
  status?: string | null;
  extra?: string | null;
  classe?: string | null;
};

export function EntityCard({ to, titulo, numero, status, extra, classe }: Props) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 transition hover:border-zinc-700 hover:bg-zinc-900/80"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-zinc-100">{titulo}</p>
        <p className="mt-0.5 font-mono text-xs text-zinc-500">{numero}</p>
        {extra ? <p className="mt-1 truncate text-xs text-zinc-500">{extra}</p> : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {status ? (
          <span className="rounded-full border border-zinc-800 px-2 py-0.5 text-[11px] uppercase tracking-wide text-zinc-400">
            {status}
          </span>
        ) : null}
        {classe ? (
          <span className="text-[11px] text-zinc-500">{rotuloClasse(classe)}</span>
        ) : null}
      </div>
    </Link>
  );
}

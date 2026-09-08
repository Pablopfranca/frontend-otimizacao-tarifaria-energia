import { useEffect, useMemo, useState } from "react";
import { listarColetivas, listarUnidades } from "../api/client";
import { EntityCard } from "../components/EntityCard";
import { SearchBar } from "../components/SearchBar";
import type { ContaColetivaLista, UnidadeLista } from "../types";

type Aba = "unidades" | "coletivas";

function coincide(texto: string, busca: string): boolean {
  return texto.toLowerCase().includes(busca);
}

export function Home() {
  const [aba, setAba] = useState<Aba>("unidades");
  const [busca, setBusca] = useState("");
  const [unidades, setUnidades] = useState<UnidadeLista[]>([]);
  const [coletivas, setColetivas] = useState<ContaColetivaLista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);

    const carga =
      aba === "unidades" ? listarUnidades() : listarColetivas();

    carga
      .then((dados) => {
        if (!ativo) return;
        if (aba === "unidades") setUnidades(dados as UnidadeLista[]);
        else setColetivas(dados as ContaColetivaLista[]);
      })
      .catch((e: Error) => {
        if (ativo) setErro(e.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [aba]);

  const termo = busca.trim().toLowerCase();

  const unidadesFiltradas = useMemo(() => {
    if (!termo) return unidades;
    return unidades.filter(
      (u) =>
        coincide(u.nome ?? "", termo) ||
        coincide(u.numero ?? "", termo) ||
        coincide(u.id ?? "", termo),
    );
  }, [unidades, termo]);

  const coletivasFiltradas = useMemo(() => {
    if (!termo) return coletivas;
    return coletivas.filter(
      (c) =>
        coincide(c.nome ?? "", termo) ||
        coincide(c.numero ?? "", termo) ||
        coincide(c.id ?? "", termo),
    );
  }, [coletivas, termo]);

  const lista = aba === "unidades" ? unidadesFiltradas : coletivasFiltradas;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-500/80">
          Otimização tarifária
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
          Selecionar unidade
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Escolha uma unidade consumidora ou uma conta coletiva para consultar
          o histórico e disparar os estudos.
        </p>
      </header>

      <div className="mb-6 flex gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
        <button
          type="button"
          onClick={() => {
            setAba("unidades");
            setBusca("");
          }}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
            aba === "unidades"
              ? "bg-zinc-800 text-zinc-50"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Unidades consumidoras
        </button>
        <button
          type="button"
          onClick={() => {
            setAba("coletivas");
            setBusca("");
          }}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
            aba === "coletivas"
              ? "bg-zinc-800 text-zinc-50"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Contas coletivas
        </button>
      </div>

      <SearchBar
        valor={busca}
        onChange={setBusca}
        placeholder={
          aba === "unidades"
            ? "Buscar UC por nome ou número…"
            : "Buscar conta coletiva por nome ou número…"
        }
      />

      <p className="mt-4 mb-3 text-xs text-zinc-500">
        {carregando
          ? "Carregando…"
          : `${lista.length.toLocaleString("pt-BR")} resultado(s)`}
      </p>

      {erro ? (
        <div className="rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {erro}
        </div>
      ) : null}

      {carregando ? (
        <p className="py-16 text-center text-sm text-zinc-500">Carregando…</p>
      ) : lista.length === 0 && !erro ? (
        <p className="py-16 text-center text-sm text-zinc-500">
          Nenhum registro encontrado.
        </p>
      ) : (
        <div className="flex max-h-[min(70vh,720px)] flex-col gap-2 overflow-y-auto pr-1">
          {aba === "unidades"
            ? unidadesFiltradas.map((u) => (
                <EntityCard
                  key={u.id}
                  to={`/unidades/${encodeURIComponent(u.id)}`}
                  titulo={u.nome || "Sem nome"}
                  numero={u.numero || u.id}
                  status={u.status}
                  classe={u.classe_tarifaria}
                  extra={[u.municipio, u.uf].filter(Boolean).join(" · ") || null}
                />
              ))
            : coletivasFiltradas.map((c) => (
                <EntityCard
                  key={c.id}
                  to={`/coletivas/${encodeURIComponent(c.id)}`}
                  titulo={c.nome || "Conta coletiva"}
                  numero={c.numero || c.id}
                  extra={`${c.n_unidades.toLocaleString("pt-BR")} UC(s)${
                    c.municipio ? ` · ${c.municipio}` : ""
                  }`}
                />
              ))}
        </div>
      )}
    </div>
  );
}

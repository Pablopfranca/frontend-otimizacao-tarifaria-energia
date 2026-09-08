import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obterColetiva, obterHistoricoUnidade, obterUnidade } from "../api/client";
import { EntityCard } from "../components/EntityCard";
import { HistoricoGrafico } from "../components/HistoricoGrafico";
import { HistoricoMensal } from "../components/HistoricoMensal";
import { useToast } from "../components/Toast";
import { formatarNumero, rotuloClasse } from "../lib/format";
import type { ContaColetivaDetalhe, MesHistorico, UnidadeDetalhe } from "../types";

function MetricaDestaque({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div
      className={`rounded-xl border px-4 py-4 ${
        destaque
          ? "border-violet-800/60 bg-violet-950/25"
          : "border-zinc-800 bg-zinc-900"
      }`}
    >
      <p className="text-[11px] uppercase tracking-wide text-zinc-500">{rotulo}</p>
      <p className={`mt-2 font-semibold text-zinc-50 ${destaque ? "text-2xl" : "text-xl"}`}>
        {valor}
      </p>
    </div>
  );
}

function MetricaSecundaria({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <span className="text-xs text-zinc-500">
      <span className="text-zinc-600">{rotulo}:</span> {valor}
    </span>
  );
}

function AcoesEstudo() {
  const { notify } = useToast();
  const [ocupado, setOcupado] = useState<string | null>(null);

  function disparar(rotulo: string) {
    setOcupado(rotulo);
    notify("Processando cálculos no servidor…");
    window.setTimeout(() => setOcupado(null), 1400);
  }

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-sm font-medium text-zinc-300">Ações</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={Boolean(ocupado)}
          onClick={() => disparar("estudo")}
          className="rounded-2xl border border-emerald-800/70 bg-emerald-950/40 px-5 py-5 text-left transition hover:border-emerald-600 hover:bg-emerald-950/70 disabled:opacity-60"
        >
          <span className="block text-base font-semibold text-emerald-100">
            Realizar estudo tarifário
          </span>
          <span className="mt-1 block text-xs text-emerald-200/70">
            {ocupado === "estudo"
              ? "Carregando…"
              : "Simula a modalidade e a demanda contratada (Módulo 3)."}
          </span>
        </button>
        <button
          type="button"
          disabled={Boolean(ocupado)}
          onClick={() => disparar("planilha")}
          className="rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-5 text-left transition hover:border-zinc-500 disabled:opacity-60"
        >
          <span className="block text-base font-semibold text-zinc-100">
            Gerar planilha padrão Cosern
          </span>
          <span className="mt-1 block text-xs text-zinc-500">
            {ocupado === "planilha"
              ? "Carregando…"
              : "Exportação no layout da distribuidora (em breve)."}
          </span>
        </button>
      </div>
    </section>
  );
}

export function DetalheUnidade() {
  const { id = "" } = useParams();
  const [dados, setDados] = useState<UnidadeDetalhe | null>(null);
  const [historico, setHistorico] = useState<MesHistorico[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);
    Promise.all([obterUnidade(id), obterHistoricoUnidade(id)])
      .then(([detalhe, meses]) => {
        if (!ativo) return;
        setDados(detalhe);
        setHistorico(meses);
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
  }, [id]);

  if (carregando) {
    return <p className="px-6 py-20 text-center text-sm text-zinc-500">Carregando…</p>;
  }
  if (erro || !dados) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link to="/" className="text-sm text-zinc-400 hover:text-zinc-200">
          ← Voltar à seleção
        </Link>
        <p className="mt-6 rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {erro ?? "Unidade não encontrada."}
        </p>
      </div>
    );
  }

  const demanda =
    dados.demanda_contratada_kw ??
    dados.demanda_contratada_fp_kw ??
    dados.demanda_contratada_ponta_kw;

  const grupoA = dados.classe_tarifaria === "A";
  const demandaTexto =
    demanda == null
      ? "Não se aplica"
      : grupoA && dados.demanda_contratada_ponta_kw != null && dados.demanda_contratada_fp_kw != null
        ? `${formatarNumero(dados.demanda_contratada_ponta_kw, 1)} / ${formatarNumero(dados.demanda_contratada_fp_kw, 1)} kW`
        : `${formatarNumero(demanda, 1)} kW`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link to="/" className="text-sm text-zinc-400 transition hover:text-zinc-200">
        ← Voltar à seleção
      </Link>

      <header className="mt-6 border-b border-zinc-800 pb-8">
        <p className="font-mono text-xs text-zinc-500">{dados.numero}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          {dados.nome}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">{dados.endereco || "Endereço não informado"}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-400">
          {dados.status ? (
            <span className="rounded-full border border-zinc-800 px-2 py-0.5">{dados.status}</span>
          ) : null}
          <span className="rounded-full border border-zinc-800 px-2 py-0.5">
            {rotuloClasse(dados.classe_tarifaria)}
          </span>
          {dados.sub_grupo ? (
            <span className="rounded-full border border-zinc-800 px-2 py-0.5">{dados.sub_grupo}</span>
          ) : null}
          {dados.modalidade_uc ? (
            <span className="rounded-full border border-zinc-800 px-2 py-0.5">{dados.modalidade_uc}</span>
          ) : null}
        </div>
      </header>

      <section className="mt-8">
        <h2 className="mb-4 text-sm font-medium text-zinc-300">Métricas rápidas</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricaDestaque
            rotulo="Consumo médio"
            valor={`${formatarNumero(dados.consumo_medio_kwh, 0)} kWh`}
          />
          <MetricaDestaque
            rotulo={grupoA ? "Demanda contratada (P / FP)" : "Demanda contratada"}
            valor={demandaTexto}
            destaque={grupoA && demanda != null}
          />
          <MetricaDestaque
            rotulo="Valor médio da fatura"
            valor={
              dados.valor_medio_fatura == null
                ? "—"
                : `R$ ${formatarNumero(dados.valor_medio_fatura, 2)}`
            }
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <MetricaSecundaria
            rotulo="Meses no histórico"
            valor={formatarNumero(dados.meses_historico)}
          />
          <MetricaSecundaria rotulo="Faturas" valor={formatarNumero(dados.n_faturas)} />
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-medium text-zinc-300">
          Histórico de consumo
          {grupoA ? " e demanda" : ""}
        </h2>
        <HistoricoGrafico dados={historico} grupoA={grupoA} />
      </section>

      <HistoricoMensal dados={historico} grupoA={grupoA} />

      <AcoesEstudo />
    </div>
  );
}

export function DetalheColetiva() {
  const { id = "" } = useParams();
  const [dados, setDados] = useState<ContaColetivaDetalhe | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);
    obterColetiva(id)
      .then((d) => {
        if (ativo) setDados(d);
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
  }, [id]);

  if (carregando) {
    return <p className="px-6 py-20 text-center text-sm text-zinc-500">Carregando…</p>;
  }
  if (erro || !dados) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link to="/" className="text-sm text-zinc-400 hover:text-zinc-200">
          ← Voltar à seleção
        </Link>
        <p className="mt-6 rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {erro ?? "Conta coletiva não encontrada."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link to="/" className="text-sm text-zinc-400 transition hover:text-zinc-200">
        ← Voltar à seleção
      </Link>

      <header className="mt-6 border-b border-zinc-800 pb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Conta coletiva</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          {dados.nome}
        </h1>
        <p className="mt-1 font-mono text-xs text-zinc-500">{dados.numero}</p>
        <p className="mt-2 text-sm text-zinc-400">{dados.endereco || "Endereço não informado"}</p>
        <p className="mt-3 text-sm text-zinc-300">
          Demanda contratada:{" "}
          <span className="font-medium text-zinc-50">
            {dados.demanda_contratada_kw == null
              ? "—"
              : `${formatarNumero(dados.demanda_contratada_kw, 1)} kW (soma das UCs A)`}
          </span>
        </p>
      </header>

      <section className="mt-8">
        <h2 className="mb-4 text-sm font-medium text-zinc-300">Métricas rápidas</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <MetricaDestaque rotulo="Unidades na conta" valor={formatarNumero(dados.n_unidades)} />
          <MetricaDestaque
            rotulo="Consumo médio agregado"
            valor={`${formatarNumero(dados.consumo_medio_kwh, 0)} kWh`}
          />
        </div>
      </section>

      <AcoesEstudo />

      <section className="mt-10">
        <h2 className="mb-4 text-sm font-medium text-zinc-300">Unidades desta conta</h2>
        <div className="flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
          {dados.unidades.map((u) => (
            <EntityCard
              key={u.id}
              to={`/unidades/${encodeURIComponent(u.id)}`}
              titulo={u.nome || "Sem nome"}
              numero={u.numero || u.id}
              status={u.status}
              classe={u.classe_tarifaria}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

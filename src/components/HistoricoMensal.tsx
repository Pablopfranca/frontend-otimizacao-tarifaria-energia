import { useState } from "react";
import { formatarNumero } from "../lib/format";
import type { MesHistorico } from "../types";

type Props = {
  dados: MesHistorico[];
  grupoA: boolean;
};

function celula(valor: number | null | undefined, casas = 0, sufixo = "") {
  if (valor == null) return "—";
  return `${formatarNumero(valor, casas)}${sufixo}`;
}

export function HistoricoMensal({ dados, grupoA }: Props) {
  const [aberto, setAberto] = useState(false);

  if (dados.length === 0) return null;

  const ordenado = [...dados].sort(
    (a, b) => b.ano * 100 + b.mes - (a.ano * 100 + a.mes),
  );

  return (
    <section className="mt-8">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left transition hover:border-zinc-700"
      >
        <span className="text-sm font-medium text-zinc-200">
          Detalhamento mensal
        </span>
        <span className="text-xs text-zinc-500">
          {aberto ? "Ocultar" : "Mostrar"} · {ordenado.length} meses
        </span>
      </button>

      {aberto ? (
        <div className="mt-2 overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[10px] uppercase tracking-wide text-zinc-500">
                <th className="px-3 py-2.5 font-medium">Mês</th>
                <th className="px-3 py-2.5 font-medium">Consumo (kWh)</th>
                {grupoA ? (
                  <>
                    <th className="px-3 py-2.5 font-medium">Ponta</th>
                    <th className="px-3 py-2.5 font-medium">Fora ponta</th>
                    <th className="px-3 py-2.5 font-medium">Dem. med. P (kW)</th>
                    <th className="px-3 py-2.5 font-medium">Dem. med. FP (kW)</th>
                    <th className="px-3 py-2.5 font-medium">Dem. contr. (kW)</th>
                  </>
                ) : (
                  <>
                    <th className="px-3 py-2.5 font-medium">Média diária</th>
                    <th className="px-3 py-2.5 font-medium">Dias</th>
                  </>
                )}
                <th className="px-3 py-2.5 font-medium">Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              {ordenado.map((m) => {
                const demContrTxt =
                  m.demanda_contratada_p_kw != null || m.demanda_contratada_fp_kw != null
                    ? `${celula(m.demanda_contratada_p_kw, 1)} / ${celula(m.demanda_contratada_fp_kw, 1)}`
                    : "—";

                return (
                  <tr
                    key={`${m.ano}-${m.mes}`}
                    className="border-b border-zinc-800/80 text-zinc-300 last:border-0 hover:bg-zinc-900/50"
                  >
                    <td className="px-3 py-2 font-mono text-zinc-400">{m.periodo}</td>
                    <td className="px-3 py-2">{celula(m.energia_kwh, 0)}</td>
                    {grupoA ? (
                      <>
                        <td className="px-3 py-2">{celula(m.energia_ponta_kwh, 0)}</td>
                        <td className="px-3 py-2">{celula(m.energia_fp_kwh, 0)}</td>
                        <td className="px-3 py-2">{celula(m.demanda_medida_p_kw, 1)}</td>
                        <td className="px-3 py-2">{celula(m.demanda_medida_fp_kw, 1)}</td>
                        <td className="px-3 py-2 text-violet-300/90">{demContrTxt}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-2">{celula(m.media_diaria_kwh, 2)}</td>
                        <td className="px-3 py-2">{celula(m.dias_periodo)}</td>
                      </>
                    )}
                    <td className="px-3 py-2">{celula(m.valor, 2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

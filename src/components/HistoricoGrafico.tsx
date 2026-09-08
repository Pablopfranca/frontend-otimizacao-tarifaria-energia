import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatarNumero } from "../lib/format";
import type { MesHistorico } from "../types";

type Ponto = MesHistorico & {
  label: string;
  consumo: number;
  demPonta: number | null;
  demFp: number | null;
  demContrP: number | null;
  demContrFp: number | null;
};

function preparar(dados: MesHistorico[]): Ponto[] {
  return [...dados]
    .sort((a, b) => a.ano * 100 + a.mes - (b.ano * 100 + b.mes))
    .map((m) => ({
      ...m,
      label: m.periodo,
      consumo: m.energia_kwh ?? 0,
      demPonta: m.demanda_medida_p_kw,
      demFp: m.demanda_medida_fp_kw,
      demContrP: m.demanda_contratada_p_kw,
      demContrFp: m.demanda_contratada_fp_kw,
    }));
}

type Props = {
  dados: MesHistorico[];
  grupoA: boolean;
};

export function HistoricoGrafico({ dados, grupoA }: Props) {
  const pontos = preparar(dados);

  if (pontos.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">
        Sem histórico de consumo para esta unidade.
      </p>
    );
  }

  const ultimos = pontos.slice(-24);

  return (
    <div className="h-72 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={ultimos} margin={{ top: 8, right: grupoA ? 48 : 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#71717a", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "#3f3f46" }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            yAxisId="kwh"
            tick={{ fill: "#71717a", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v) => `${v}`}
            label={{
              value: "kWh",
              angle: -90,
              position: "insideLeft",
              fill: "#52525b",
              fontSize: 10,
            }}
          />
          {grupoA ? (
            <YAxis
              yAxisId="kw"
              orientation="right"
              tick={{ fill: "#71717a", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(v) => `${v}`}
              label={{
                value: "kW",
                angle: 90,
                position: "insideRight",
                fill: "#52525b",
                fontSize: 10,
              }}
            />
          ) : null}
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(valor, nome) => {
              const n = typeof valor === "number" ? valor : Number(valor);
              const label = String(nome ?? "");
              const unidade = label.includes("kW") ? " kW" : " kWh";
              return [`${formatarNumero(Number.isNaN(n) ? null : n, label.includes("kW") ? 1 : 0)}${unidade}`, label];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#a1a1aa", paddingTop: 8 }}
          />
          <Bar
            yAxisId="kwh"
            dataKey="consumo"
            name="Consumo (kWh)"
            fill="#10b981"
            fillOpacity={0.75}
            radius={[3, 3, 0, 0]}
            maxBarSize={28}
          />
          {grupoA ? (
            <>
              <Line
                yAxisId="kw"
                type="monotone"
                dataKey="demPonta"
                name="Demanda medida ponta (kW)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                yAxisId="kw"
                type="monotone"
                dataKey="demFp"
                name="Demanda medida FP (kW)"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                yAxisId="kw"
                type="monotone"
                dataKey="demContrFp"
                name="Demanda contratada FP (kW)"
                stroke="#a78bfa"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                connectNulls
              />
            </>
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
      {pontos.length > 24 ? (
        <p className="mt-2 text-center text-[11px] text-zinc-500">
          Exibindo os últimos 24 meses de {pontos.length} no histórico.
        </p>
      ) : null}
    </div>
  );
}

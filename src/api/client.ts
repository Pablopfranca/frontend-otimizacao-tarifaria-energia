import type {
  ContaColetivaDetalhe,
  ContaColetivaLista,
  MesHistorico,
  UnidadeDetalhe,
  UnidadeLista,
} from "../types";

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/$/,
  "",
) ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${BASE}${path}`, {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor em localhost:8000.",
      0,
    );
  }

  if (!resposta.ok) {
    let detalhe = `Erro ${resposta.status}`;
    try {
      const corpo = (await resposta.json()) as { detail?: string };
      if (corpo.detail) detalhe = corpo.detail;
    } catch {
      /* corpo vazio */
    }
    throw new ApiError(detalhe, resposta.status);
  }

  return (await resposta.json()) as T;
}

function comoLista<T>(dados: unknown): T[] {
  if (Array.isArray(dados)) return dados as T[];
  if (dados && typeof dados === "object") {
    const obj = dados as { items?: T[]; data?: T[] };
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.data)) return obj.data;
  }
  return [];
}

export async function listarUnidades(): Promise<UnidadeLista[]> {
  return comoLista<UnidadeLista>(await request("/api/unidades"));
}

export async function obterUnidade(id: string): Promise<UnidadeDetalhe> {
  return request(`/api/unidades/${encodeURIComponent(id)}`);
}

export async function obterHistoricoUnidade(id: string): Promise<MesHistorico[]> {
  return comoLista<MesHistorico>(
    await request(`/api/unidades/${encodeURIComponent(id)}/historico`),
  );
}

export async function listarColetivas(): Promise<ContaColetivaLista[]> {
  return comoLista<ContaColetivaLista>(await request("/api/contas-coletivas"));
}

export async function obterColetiva(id: string): Promise<ContaColetivaDetalhe> {
  return request(`/api/contas-coletivas/${encodeURIComponent(id)}`);
}

export type ClasseTarifaria = "A" | "B" | "B_OPTANTE";

export type UnidadeLista = {
  id: string;
  nome: string;
  numero: string;
  status: string | null;
  classe_tarifaria: ClasseTarifaria | string;
  municipio: string | null;
  uf: string | null;
  uc_coletiva: string | null;
};

export type ContaColetivaLista = {
  id: string;
  nome: string;
  numero: string;
  n_unidades: number;
  municipio: string | null;
  uf: string | null;
};

export type UnidadeDetalhe = {
  id: string;
  nome: string;
  numero: string;
  status: string | null;
  endereco: string | null;
  classe_tarifaria: ClasseTarifaria | string;
  familia_tarifaria: string | null;
  grupo_tensao: string | null;
  sub_grupo: string | null;
  modalidade_uc: string | null;
  fase: string | null;
  demanda_contratada_kw: number | null;
  demanda_contratada_ponta_kw: number | null;
  demanda_contratada_fp_kw: number | null;
  consumo_medio_kwh: number | null;
  meses_historico: number;
  n_faturas: number;
  valor_medio_fatura: number | null;
  uc_coletiva: string | null;
};

export type MesHistorico = {
  origem: "B" | "A" | "B_OPTANTE" | string;
  ano: number;
  mes: number;
  periodo: string;
  energia_kwh: number | null;
  energia_ponta_kwh: number | null;
  energia_fp_kwh: number | null;
  demanda_medida_p_kw: number | null;
  demanda_medida_fp_kw: number | null;
  demanda_contratada_p_kw: number | null;
  demanda_contratada_fp_kw: number | null;
  valor: number | null;
  media_diaria_kwh: number | null;
  dias_periodo: number | null;
};

export type ContaColetivaDetalhe = {
  id: string;
  nome: string;
  numero: string;
  endereco: string | null;
  n_unidades: number;
  consumo_medio_kwh: number | null;
  demanda_contratada_kw: number | null;
  unidades: UnidadeLista[];
};

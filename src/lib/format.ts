export function rotuloClasse(classe: string | null | undefined): string {
  if (classe === "B_OPTANTE") return "B optante";
  if (classe === "A") return "Grupo A";
  if (classe === "B") return "Grupo B";
  return classe || "—";
}

export function formatarNumero(valor: number | null | undefined, casas = 0): string {
  if (valor == null || Number.isNaN(valor)) return "—";
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export function montarEndereco(partes: Array<string | null | undefined>): string | null {
  const texto = partes.filter(Boolean).join(", ");
  return texto || null;
}

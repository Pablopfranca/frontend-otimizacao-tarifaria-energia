"""API somente leitura para o Módulo 4.

Lê o SQLite gerado pelo Módulo 2. Se o Módulo 2 já expuser FastAPI na porta 8000,
não suba este processo.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

_REPO = Path(__file__).resolve().parents[2]
_BANCO = _REPO / "modulo2" / "data" / "neoenergia.sqlite"

app = FastAPI(title="Otimização tarifária — API de leitura", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _conectar() -> sqlite3.Connection:
    if not _BANCO.is_file():
        raise HTTPException(
            status_code=503,
            detail="Banco SQLite não encontrado. Rode o Módulo 2 (tratamento) antes.",
        )
    con = sqlite3.connect(f"file:{_BANCO.as_posix()}?mode=ro", uri=True)
    con.row_factory = sqlite3.Row
    return con


def _endereco(*partes: Any) -> str | None:
    texto = ", ".join(str(p).strip() for p in partes if p)
    return texto or None


def _unidade_lista(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["codigo_uc"],
        "nome": row["nome_cliente"] or row["codigo_uc"],
        "numero": row["codigo_uc"],
        "status": row["status"],
        "classe_tarifaria": row["classe_tarifaria"],
        "municipio": row["municipio"] if "municipio" in row.keys() else None,
        "uf": row["uf"] if "uf" in row.keys() else None,
        "uc_coletiva": row["uc_coletiva"] if "uc_coletiva" in row.keys() else None,
    }


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "banco": str(_BANCO)}


@app.get("/api/unidades")
def listar_unidades() -> list[dict[str, Any]]:
    con = _conectar()
    try:
        linhas = con.execute(
            """
            SELECT codigo_uc, nome_cliente, status, classe_tarifaria,
                   municipio, uf, uc_coletiva
            FROM v_uc
            ORDER BY nome_cliente COLLATE NOCASE, codigo_uc
            """
        ).fetchall()
        return [_unidade_lista(r) for r in linhas]
    finally:
        con.close()


@app.get("/api/unidades/{codigo}")
def obter_unidade(codigo: str) -> dict[str, Any]:
    con = _conectar()
    try:
        row = con.execute(
            """
            SELECT
                v.*,
                u.end_logradouro, u.end_bairro, u.end_municipio, u.end_cep, u.end_uf,
                c.end_completo, c.end_bairro AS cad_bairro, c.end_municipio AS cad_municipio,
                c.end_uf AS cad_uf
            FROM v_uc v
            JOIN uc u ON u.codigo_uc = v.codigo_uc
            LEFT JOIN uc_cadastro c ON c.codigo_uc = v.codigo_uc
            WHERE v.codigo_uc = ?
            """,
            (codigo,),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Unidade consumidora não encontrada.")

        cons = con.execute(
            """
            SELECT AVG(energia_kwh) AS media, COUNT(*) AS n
            FROM v_consumo_mensal
            WHERE codigo_uc = ?
            """,
            (codigo,),
        ).fetchone()
        fat = con.execute(
            """
            SELECT COUNT(*) AS n, AVG(valor_emissao) AS media
            FROM fatura
            WHERE codigo_uc = ?
            """,
            (codigo,),
        ).fetchone()
        dem = con.execute(
            """
            SELECT demanda_contratada_p, demanda_contratada_fp
            FROM consumo_a_mensal
            WHERE codigo_uc = ?
            ORDER BY ano DESC, mes DESC
            LIMIT 1
            """,
            (codigo,),
        ).fetchone()

        endereco = _endereco(
            row["end_completo"] or row["end_logradouro"],
            row["cad_bairro"] or row["end_bairro"],
            row["cad_municipio"] or row["end_municipio"] or row["municipio"],
            row["cad_uf"] or row["end_uf"] or row["uf"],
            row["end_cep"],
        )

        p = dem["demanda_contratada_p"] if dem else None
        fp = dem["demanda_contratada_fp"] if dem else None
        demanda = None
        if p is not None or fp is not None:
            demanda = max(p or 0, fp or 0) or None

        return {
            "id": row["codigo_uc"],
            "nome": row["nome_cliente"] or row["codigo_uc"],
            "numero": row["codigo_uc"],
            "status": row["status"],
            "endereco": endereco,
            "classe_tarifaria": row["classe_tarifaria"],
            "familia_tarifaria": row["familia_tarifaria"],
            "grupo_tensao": row["grupo_tensao"],
            "sub_grupo": row["sub_grupo"],
            "modalidade_uc": row["modalidade_uc"],
            "fase": row["fase"],
            "demanda_contratada_kw": demanda,
            "demanda_contratada_ponta_kw": p,
            "demanda_contratada_fp_kw": fp,
            "consumo_medio_kwh": cons["media"] if cons else None,
            "meses_historico": cons["n"] if cons else 0,
            "n_faturas": fat["n"] if fat else 0,
            "valor_medio_fatura": fat["media"] if fat else None,
            "uc_coletiva": row["uc_coletiva"],
        }
    finally:
        con.close()


@app.get("/api/unidades/{codigo}/historico")
def historico_unidade(codigo: str) -> list[dict[str, Any]]:
    con = _conectar()
    try:
        existe = con.execute(
            "SELECT 1 FROM uc WHERE codigo_uc = ?",
            (codigo,),
        ).fetchone()
        if existe is None:
            raise HTTPException(status_code=404, detail="Unidade consumidora não encontrada.")

        linhas = con.execute(
            """
            SELECT
                v.origem,
                v.ano,
                v.mes,
                v.energia_kwh,
                v.energia_ponta_kwh,
                v.energia_fp_kwh,
                v.demanda_medida_p,
                v.demanda_medida_fp,
                v.valor,
                a.demanda_contratada_p,
                a.demanda_contratada_fp,
                b.media_diaria_kwh,
                b.dias_periodo
            FROM v_consumo_mensal v
            LEFT JOIN consumo_a_mensal a
                ON a.codigo_uc = v.codigo_uc
               AND a.ano = v.ano
               AND a.mes = v.mes
               AND v.origem IN ('A', 'B_OPTANTE')
            LEFT JOIN (
                SELECT
                    codigo_uc,
                    ano,
                    mes,
                    AVG(media_diaria_kwh) AS media_diaria_kwh,
                    MAX(dias_periodo) AS dias_periodo
                FROM consumo_b
                GROUP BY codigo_uc, ano, mes
            ) b
                ON b.codigo_uc = v.codigo_uc
               AND b.ano = v.ano
               AND b.mes = v.mes
               AND v.origem = 'B'
            WHERE v.codigo_uc = ?
            ORDER BY v.ano DESC, v.mes DESC
            """,
            (codigo,),
        ).fetchall()

        return [
            {
                "origem": r["origem"],
                "ano": r["ano"],
                "mes": r["mes"],
                "periodo": f"{r['mes']:02d}/{r['ano']}",
                "energia_kwh": r["energia_kwh"],
                "energia_ponta_kwh": r["energia_ponta_kwh"],
                "energia_fp_kwh": r["energia_fp_kwh"],
                "demanda_medida_p_kw": r["demanda_medida_p"],
                "demanda_medida_fp_kw": r["demanda_medida_fp"],
                "demanda_contratada_p_kw": r["demanda_contratada_p"],
                "demanda_contratada_fp_kw": r["demanda_contratada_fp"],
                "valor": r["valor"],
                "media_diaria_kwh": r["media_diaria_kwh"],
                "dias_periodo": r["dias_periodo"],
            }
            for r in linhas
        ]
    finally:
        con.close()


@app.get("/api/contas-coletivas")
def listar_coletivas() -> list[dict[str, Any]]:
    con = _conectar()
    try:
        linhas = con.execute(
            """
            SELECT
                c.codigo_uc,
                c.nome_cliente,
                c.end_municipio,
                c.end_uf,
                (
                    SELECT COUNT(*) FROM uc u WHERE u.uc_coletiva = c.codigo_uc
                ) AS n_unidades
            FROM conta_coletiva c
            ORDER BY c.nome_cliente COLLATE NOCASE, c.codigo_uc
            """
        ).fetchall()
        return [
            {
                "id": r["codigo_uc"],
                "nome": r["nome_cliente"] or r["codigo_uc"],
                "numero": r["codigo_uc"],
                "n_unidades": r["n_unidades"],
                "municipio": r["end_municipio"],
                "uf": r["end_uf"],
            }
            for r in linhas
        ]
    finally:
        con.close()


@app.get("/api/contas-coletivas/{codigo}")
def obter_coletiva(codigo: str) -> dict[str, Any]:
    con = _conectar()
    try:
        row = con.execute(
            "SELECT * FROM conta_coletiva WHERE codigo_uc = ?",
            (codigo,),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Conta coletiva não encontrada.")

        unidades = con.execute(
            """
            SELECT codigo_uc, nome_cliente, status, classe_tarifaria,
                   municipio, uf, uc_coletiva
            FROM v_uc
            WHERE uc_coletiva = ?
            ORDER BY nome_cliente COLLATE NOCASE, codigo_uc
            """,
            (codigo,),
        ).fetchall()

        medias = con.execute(
            """
            SELECT AVG(m.energia_kwh) AS media
            FROM v_consumo_mensal m
            JOIN uc u ON u.codigo_uc = m.codigo_uc
            WHERE u.uc_coletiva = ?
            """,
            (codigo,),
        ).fetchone()
        demandas = con.execute(
            """
            SELECT a.codigo_uc,
                   MAX(COALESCE(a.demanda_contratada_p, 0)) AS p,
                   MAX(COALESCE(a.demanda_contratada_fp, 0)) AS fp
            FROM consumo_a_mensal a
            JOIN uc u ON u.codigo_uc = a.codigo_uc
            WHERE u.uc_coletiva = ?
            GROUP BY a.codigo_uc
            """,
            (codigo,),
        ).fetchall()
        demanda_total = sum(max(d["p"] or 0, d["fp"] or 0) for d in demandas) or None

        return {
            "id": row["codigo_uc"],
            "nome": row["nome_cliente"] or row["codigo_uc"],
            "numero": row["codigo_uc"],
            "endereco": _endereco(
                row["end_logradouro"],
                row["end_bairro"],
                row["end_municipio"],
                row["end_uf"],
                row["end_cep"],
            ),
            "n_unidades": len(unidades),
            "consumo_medio_kwh": medias["media"] if medias else None,
            "demanda_contratada_kw": demanda_total,
            "unidades": [_unidade_lista(u) for u in unidades],
        }
    finally:
        con.close()

# Módulo 4 — frontend

Interface React (tema escuro) para selecionar unidades consumidoras e contas coletivas, ver histórico de consumo (e demanda no Grupo A) e disparar ações do estudo tarifário.

**Somente frontend.** Não trata JSON, não grava SQLite e não sobe FastAPI.

A API HTTP pertence ao **Módulo 2** (`api.py`). Os JSON da Neoenergia vêm do **Módulo 1**; o Módulo 2 transforma esses JSON no banco que a API lê.

## Layout esperado

```text
Modulo1_API/                  ← pasta pai
  modulo1/                    ← ingestão (JSON)
  modulo2/                    ← tratamento + FastAPI na porta 8000
  modulo4/                    ← este repositório
```

Clone este repositório como pasta `modulo4`. Se o Módulo 2 não estiver na mesma pasta pai, suba a API dele à parte e aponte `VITE_API_URL`.

## O que o frontend faz

- Lista UCs e contas coletivas (busca por nome ou número).
- Detalhe da UC: endereço, classe tarifária, métricas, gráfico de consumo (e demanda no Grupo A), tabela mensal recolhível.
- Botões **Realizar estudo tarifário** e **Gerar planilha padrão Cosern**: por enquanto só avisam “Processando cálculos no servidor…” — o **Módulo 3** ainda não existe.

## Pré-requisitos (Módulos 1 e 2)

Na pasta pai, na ordem:

```bash
# 1) JSON (pule se modulo1/data/output/ já existir)
cd modulo1
python neoenergia_ingestor.py

# 2) SQLite
cd ..
pip install -r modulo2/requirements.txt
python -m modulo2.tratamento

# 3) API — deixe este processo aberto
python -m uvicorn modulo2.api:app --reload --port 8000
```

Confira [http://localhost:8000/api/health](http://localhost:8000/api/health). Sem a API no ar, a tela mostra erro de conexão.

## Como rodar o frontend

```bash
cd modulo4
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173).

A URL da API padrão é `http://localhost:8000`. Para outra origem, crie `modulo4/.env` (não versionado):

```env
VITE_API_URL=http://localhost:8000
```

O Vite também faz proxy de `/api` para `localhost:8000`; o cliente usa a URL absoluta acima, salvo `VITE_API_URL`.

## Endpoints consumidos (Módulo 2)

| Método | Caminho | Uso na UI |
|---|---|---|
| GET | `/api/unidades` | Home — aba Unidades consumidoras |
| GET | `/api/unidades/{id}` | Detalhe da UC (métricas, demanda) |
| GET | `/api/unidades/{id}/historico` | Gráfico e detalhamento mensal |
| GET | `/api/contas-coletivas` | Home — aba Contas coletivas |
| GET | `/api/contas-coletivas/{id}` | Detalhe da coletiva |

## Stack

React + TypeScript, Vite, Tailwind CSS, React Router, Recharts. Sem pandas e sem Python neste repositório.

## Não versionar

`node_modules/`, `dist/`, `.env`, `.env.*`. Não copie o SQLite para esta pasta.

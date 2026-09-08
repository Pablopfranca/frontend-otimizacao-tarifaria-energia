# Módulo 4 — frontend

Interface React (dark) para selecionar UCs e contas coletivas e disparar ações do estudo tarifário. Consome a API em `http://localhost:8000`.

O Módulo 2, neste repositório, gera o SQLite; ainda não havia FastAPI. Este módulo inclui um servidor **somente leitura** em `server/` que expõe o banco para a UI. Se o Módulo 2 passar a servir os mesmos endpoints na porta 8000, não suba o `server/` daqui.

## Endpoints esperados

| Método | Caminho | Uso |
|---|---|---|
| GET | `/api/unidades` | Lista de UCs |
| GET | `/api/unidades/{id}` | Detalhe + métricas |
| GET | `/api/unidades/{id}/historico` | Série mensal (consumo e demanda) |
| GET | `/api/contas-coletivas` | Lista de contas coletivas |
| GET | `/api/contas-coletivas/{id}` | Detalhe + UCs da conta |

## Como rodar

No diretório `modulo4`:

```bash
python -m pip install -r server/requirements.txt
python -m uvicorn server.main:app --reload --port 8000
```

Em outro terminal:

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`. As ações **Realizar estudo tarifário** e **Gerar planilha padrão Cosern** só exibem o aviso “Processando cálculos no servidor…” até o Módulo 3 existir.

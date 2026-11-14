# 🚀 Hospedar o Entre Nós no Firebase

Duas rotas possíveis. A **Opção A** é a mais simples e sobe frontend + servidor WebSocket juntos.
A **Opção B** publica o frontend estático no Firebase Hosting e o servidor Socket.IO no Cloud Run.

---

## Pré-requisitos (comuns às duas opções)

1. Node.js 20+ instalado (`node -v`).
2. Conta Google.
3. Estar na pasta raiz do projeto (onde ficam `firebase.json`, `.firebaserc` e `apphosting.yaml`).
4. Projeto criado em <https://console.firebase.google.com> (plano **Blaze** é necessário para Cloud Run/App Hosting; o Hosting estático funciona no Spark).

---

## Opção A — Firebase App Hosting (recomendada: tempo real completo)

Sobe o Next.js + Socket.IO no mesmo endereço, sem CORS e sem configurar URL extra.

1. **Envie o projeto para o GitHub**
   ```bash
   git init
   git add .
   git commit -m "Entre Nós"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/entre-nos.git
   git push -u origin main
   ```
2. No console do Firebase: **Build → App Hosting → Começar**.
3. Conecte o GitHub, escolha o repositório e a branch `main`, diretório raiz `/`.
4. Nome do backend: `entre-nos`. Região: `southamerica-east1` (ou `us-central1`).
5. Ative o rollout automático e clique em **Concluir**.
6. O build lê o `apphosting.yaml` do projeto — `maxInstances: 1` mantém todas as salas
   em memória na mesma instância (obrigatório para WebSocket + estado em memória).
7. Acesse a URL `https://entre-nos--<hash>.hosted.app` e teste com 3 abas.

> O arquivo `apphosting.yaml` já existe no repositório com `cpu`, `memória` e `maxInstances: 1`.

---

## Opção B — Firebase Hosting (estático) + Socket.IO no Cloud Run

O CDN do Firebase Hosting **não** encaminha WebSocket, por isso o servidor precisa de URL pública própria.

### B1. Publicar o servidor WebSocket no Cloud Run

```bash
gcloud auth login
gcloud config set project SEU_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

gcloud run deploy entre-nos-server \
  --source ./server \
  --region southamerica-east1 \
  --allow-unauthenticated \
  --session-affinity \
  --max-instances=1
```

Anote a URL retornada (ex.: `https://entre-nos-server-xxxx-rj.a.run.app`).

- `--session-affinity` + `--max-instances=1` garantem que as salas em memória não se percam entre réplicas.
- O servidor já escuta em `0.0.0.0` na porta `PORT` e responde em `/health`.

### B2. Publicar o frontend no Firebase Hosting

```bash
npx firebase-tools@latest login
npx firebase-tools@latest use --add          # escolha seu projeto e apelido
VITE_SOCKET_URL=https://entre-nos-server-xxxx-rj.a.run.app \
  npx firebase-tools@latest deploy --only hosting
```

O `firebase.json` já executa `npm --prefix client install` + `npm --prefix client run build`
antes de publicar a pasta `client/dist`.

### B3. Alternativa sem rebuild

Se o site já estiver no ar e você quiser apontar para o servidor depois, abra:

```text
https://SEU_PROJETO.web.app/?server=https://entre-nos-server-xxxx-rj.a.run.app
```

A URL fica salva no `localStorage` e o botão **🔌 Configurar Servidor** (rodapé da tela inicial)
permite trocar a qualquer momento.

### B4. Deploy com um comando só

```bash
bash deploy-firebase.sh SEU_PROJECT_ID
# ou já informando o backend:
bash deploy-firebase.sh SEU_PROJECT_ID https://entre-nos-server-xxxx-rj.a.run.app
```

---

## Checklist de teste após publicar

1. Abra o site e confira o status **“Mesa conectada em tempo real”** no rodapé.
2. Abra 3 abas (ou 3 celulares) — cada aba ganha um jogador separado automaticamente.
3. Crie o caso na aba 1, copie o código de 6 caracteres e entre nas abas 2 e 3.
4. Com 3 jogadores, clique em **INICIAR INVESTIGAÇÃO**: os inocentes veem a palavra, o impostor não.
5. Envie pistas, abra o debate por chat e conclua a votação.
6. Recarregue uma aba no meio da partida para validar a reconexão de 60s.

---

## Problemas comuns

| Sintoma | Causa | Solução |
| --- | --- | --- |
| “Conectando à mesa...” infinito | frontend estático sem URL do backend | use `?server=...` ou refaça o deploy com `VITE_SOCKET_URL` |
| Erro de CORS no console | domínio não liberado | o servidor aceita `*` por padrão; se definiu `CORS_ORIGIN`, inclua `https://SEU_PROJETO.web.app` |
| Sala “não encontrada” após alguns minutos | mais de uma instância do servidor | use `--max-instances=1` (Cloud Run) e mantenha `maxInstances: 1` no `apphosting.yaml` |
| WebSocket cai após ~60 min | limite de conexão do Cloud Run | normal: o cliente reconecta e restaura a partida |
| Página 404 ao recarregar rota | rewrite ausente | `firebase.json` já contém rewrite SPA para `/index.html` |
| Identidade “sumiu” ao trocar de domínio | `localStorage` é por domínio | personalize novamente (ou use o mesmo domínio sempre) |

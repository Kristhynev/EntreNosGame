# 🕵️ Entre Nós

Jogo web multiplayer em tempo real de dedução social com palavras secretas (inspirado em *Impostor* / *Spyfall* / *Among Us*), com **identidade anônima automática**, **avatares SVG 100% personalizáveis em camadas** (zero emojis prontos e zero imagens externas) e **mesa de investigação em estilo noir neo-brutalista**.

---

## 🎨 Identidade Visual — “Entre Nós”

Mesa de investigação em estilo **noir neo-brutalista**, inspirada em detetives, cartas de baralho e arquivos confidenciais:

| Token | Cor | Uso |
| --- | --- | --- |
| Fundo | `#0E1230` | Base azul-marinho da mesa |
| Tinta | `#0B0E1F` | Bordas grossas e sombras sólidas |
| Holofote | `#FFB020` | Destaques, códigos e ações principais |
| Alerta | `#E23B2E` | Impostor, exclusão e selos |
| Papel | `#F6EFE0` | Fichas, documentos e cartões |
| Secundário | `#4C8DFF` / `#63D2B0` | Ações neutras e estados de sucesso |

Tipografia: **Bebas Neue** (títulos de pôster) + **Inter** (corpo). O fundo tem holofotes animados, grão de filme, cartas flutuantes e uma lupa — tudo desativado automaticamente em `prefers-reduced-motion`.

O áudio procedural cria uma ambiência noir discreta e sinais para abertura de caso, entrada de jogadores, pistas, debate, votação e resultado. O controle **Som** começa desligado e ativa trilha e efeitos após interação do jogador; os sons são sintetizados no navegador, sem arquivos externos.

---

## 📁 Estrutura de Pastas

```text
├── server/                         # Backend Node.js + Express + Socket.IO (estado em memória)
│   ├── package.json
│   ├── index.js                    # Servidor Express + Socket.IO standalone (porta 3001)
│   ├── gameManager.js              # Salas, turnos, dicas, votação, chute de 20s e reconexão (60s)
│   ├── avatarSchema.js             # Whitelist AVATAR_SCHEMA + isValidAvatar + assinatura visual
│   └── words.js                    # Banco de palavras PT-BR (Comida, Lugares, Animais, Filmes, Aleatório)
│
├── client/                         # Frontend React + Vite + Tailwind CSS
│   ├── package.json
│   ├── vite.config.mjs
│   ├── index.html
│   └── src/
│       ├── App.tsx                 # Orquestração Socket.IO, identidade e telas
│       ├── index.css               # Tailwind CSS + animações festivas + prefers-reduced-motion
│       ├── lib/
│       │   ├── identity.ts         # Identidade anônima ("impostor_player") + catálogo de avatares
│       │   └── useCountdown.ts     # Hook de cronômetro sincronizado
│       └── components/
│           ├── WelcomeScreen.tsx   # Criar sala / entrar com código de 6 letras
│           ├── ProfileSetup.tsx    # Edição de nickname (máx. 15) + acesso ao editor de avatar
│           ├── Avatar.tsx          # SVG inline em camadas: HairBack → Face → Eyes → Mouth → HairFront → Accessory
│           ├── AvatarPicker.tsx    # Modal / Bottom Sheet com preview 120px e miniaturas ao vivo
│           ├── Lobby.tsx           # Lobby festivo com ticket copiável, regras do host e início
│           ├── PlayerCard.tsx      # Crachá de festa (scale+rotate) + slots vazios piscantes
│           ├── GameScreen.tsx      # Container das fases da partida
│           ├── HintPhase.tsx       # Papel secreto + fila de turnos + mural de dicas
│           ├── DebatePhase.tsx     # Fase opcional de debate por chat antes da votação
│           ├── DebateChatPanel.tsx # Chat em tempo real com avatares SVG e frases rápidas
│           ├── VotingPhase.tsx     # Votação interativa + chat de apoio + apuração
│           ├── GuessPhase.tsx      # 20s para o impostor eliminado tentar adivinhar a palavra
│           ├── ResultScreen.tsx    # Tela de vitória + revelação + "Jogar Novamente"
│           └── avatar/parts/       # Variantes SVG modulares por arquivo
│               ├── HairBack.tsx
│               ├── Face.tsx
│               ├── Eyes.tsx
│               ├── Mouth.tsx
│               ├── HairFront.tsx
│               └── Accessory.tsx
│
└── src/                            # Integração unificada para preview em servidor único
    ├── app/                        # Layout, estilos e página principal
    └── pages/api/socket-init.ts    # Ponte Socket.IO compartilhando o mesmo server/gameManager.js
```

---

## 🚀 Como Rodar em Desenvolvimento (`server/` + `client/`)

### 1. Iniciar o Servidor Socket.IO (`server/`)
Em um terminal:
```bash
cd server
npm install
npm run dev
```
O backend Express + Socket.IO subirá em `http://localhost:3001`.

### 2. Iniciar o Cliente React + Vite (`client/`)
Em outro terminal:
```bash
cd client
npm install
npm run dev
```
Abra `http://localhost:5173` no navegador!
> Caso queira apontar para outro IP na rede local (ex.: testar pelo celular no Wi-Fi), defina `VITE_SOCKET_URL=http://SEU_IP_LOCAL:3001` ao rodar o Vite.

---

## 🧪 Como Testar com Múltiplas Abas ou Dispositivos (3 a 8 Jogadores)

Uma partida exige no mínimo **3 jogadores** e suporta até **8 jogadores**:

1. **Aba 1 (Anfitrião)**:
   - Abra a aplicação. Sua identidade anônima (`playerId`, `nickname` divertido e `avatar` SVG) será gerada e salva em `localStorage` sob a chave `"impostor_player"`.
   - Personalize seu avatar se quiser e clique em **🚀 CRIAR SALA**.
   - Copie o código de **6 caracteres** exibido no **Ticket da Sala** no topo do Lobby.
2. **Aba 2 e Aba 3 (Convidados no mesmo navegador)**:
   - Basta abrir mais 2 abas normais no mesmo navegador! O jogo detecta automaticamente via `BroadcastChannel` que a identidade principal já está ativa na Aba 1 e cria uma identidade isolada para a Aba 2 e para a Aba 3 (ou você pode clicar no link *"Criar jogador separado nesta aba"* no rodapé, ou usar janelas anônimas / outros dispositivos).
   - Cole o código de 6 letras e clique em **🎟️ ENTRAR NA FESTA**.
3. **Testando a Partida Completa**:
   - Na Aba 1 (Host), clique em **🚀 COMEÇAR A FESTA**.
   - Verifique que os Inocentes recebem a **Palavra Secreta** individualmente via socket, enquanto o **Impostor** vê apenas a categoria!
   - Envie uma dica curta na vez de cada jogador até abrir a **Votação**.
   - Vote em um jogador em todas as abas:
     - Se um **Impostor** for eliminado, ele terá **20 segundos** na `GuessPhase` para chutar a palavra secreta e roubar a vitória!
     - Se um **Inocente** for eliminado e os impostores igualarem os inocentes vivos, os Impostores vencem; caso contrário, começa a próxima rodada.
4. **Testando Reconexão (Janela de 60s)**:
   - Recarregue (`F5`) qualquer aba durante o lobby ou no meio da partida: o cliente reenviará `reconnect { playerId, roomCode }` e recuperará automaticamente seu papel, palavra secreta (se inocente), dicas e cronômetro!

---

## ☁️ Como Hospedar no Firebase

O projeto já está 100% configurado com `firebase.json`, `.firebaserc`, `apphosting.yaml`, `server/Dockerfile` e o script automatizado `deploy-firebase.sh`.

### Opção 1: Firebase App Hosting (Fullstack + WebSockets juntos — requer Blaze)
1. Suba este projeto para um repositório no seu GitHub.
2. No [Console do Firebase](https://console.firebase.google.com/), crie ou abra seu projeto e acesse **Build → App Hosting → Começar**.
3. Conecte seu repositório GitHub (diretório raiz `/`).
4. O Firebase detectará automaticamente o `apphosting.yaml` (já configurado com `maxInstances: 1` para manter todas as salas em memória sincronizadas) e colocará frontend + servidor Socket.IO no ar na mesma URL `https://...hosted.app`!

### Opção 2: Firebase Hosting (`*.web.app`) + Servidor Socket.IO (`deploy-firebase.sh`)
Como o CDN estático do Firebase Hosting (`*.web.app`) serve arquivos estáticos (`client/dist`), o servidor WebSocket (`server/`) roda no **Google Cloud Run** (ou Render/Railway/Fly.io):

> Para evitar custos obrigatórios, o projeto inclui um blueprint [Render Free](./render.yaml). Veja os passos e limitações em [DEPLOY-FIREBASE.md](./DEPLOY-FIREBASE.md). O serviço gratuito pode dormir e perder as salas em memória.

1. No seu terminal local, autentique sua conta Google no Firebase:
   ```bash
   npx firebase-tools@latest login
   ```
2. Execute o script automatizado passando o **ID do seu projeto Firebase**:
   ```bash
   bash deploy-firebase.sh SEU_PROJECT_ID_FIREBASE
   ```
   - Se você tiver o `gcloud` instalado, o próprio script oferece publicar o `server/` no **Cloud Run** (`--session-affinity --max-instances=1`) e injeta automaticamente a `VITE_SOCKET_URL` no build do cliente antes de publicar em `https://SEU_PROJECT_ID_FIREBASE.web.app`!
   - Caso prefira hospedar o `server/` em outro serviço (ex.: Render ou Railway), passe a URL como segundo argumento:
     ```bash
     bash deploy-firebase.sh SEU_PROJECT_ID_FIREBASE https://seu-servidor-socket.onrender.com
     ```
   - Você também pode trocar ou conectar a URL do servidor diretamente na tela inicial do site hospedado clicando em **🔌 Configurar Servidor** ou acessando `https://SEU_PROJECT_ID_FIREBASE.web.app/?server=https://SUA_URL_SOCKET`.

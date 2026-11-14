#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${1:-}"
BACKEND_URL="${2:-${VITE_SOCKET_URL:-}}"
REGION="${CLOUD_RUN_REGION:-southamerica-east1}"

echo "🎉 ============================================== 🎉"
echo "   Deploy Automatizado — ENTRE NÓS no Firebase"
echo "🎉 ============================================== 🎉"

if ! command -v npx >/dev/null 2>&1; then
  echo "❌ Node.js / npx não encontrado. Instale o Node.js 20+ primeiro."
  exit 1
fi

if [ -z "$PROJECT_ID" ]; then
  echo "💡 Uso rápido:"
  echo "   bash deploy-firebase.sh SEU_PROJECT_ID_FIREBASE [URL_DO_SERVIDOR_SOCKET]"
  echo ""
  read -r -p "👉 Digite o ID do seu projeto no Firebase: " PROJECT_ID
fi

if [ -z "$PROJECT_ID" ]; then
  echo "❌ ID do projeto Firebase é obrigatório."
  exit 1
fi

# Se gcloud estiver instalado e nenhuma URL de backend foi passada, oferece deploy automático no Cloud Run
if [ -z "$BACKEND_URL" ] && command -v gcloud >/dev/null 2>&1; then
  echo ""
  read -r -p "🚀 Deseja publicar também o servidor Socket.IO (server/) no Google Cloud Run agora? (s/N): " DEPLOY_CLOUD_RUN
  if [[ "$DEPLOY_CLOUD_RUN" =~ ^[sSyY]$ ]]; then
    echo "📦 Publicando servidor WebSocket no Cloud Run ($REGION)..."
    gcloud run deploy entre-nos-server \
      --project "$PROJECT_ID" \
      --source ./server \
      --region "$REGION" \
      --allow-unauthenticated \
      --session-affinity \
      --max-instances=1

    BACKEND_URL="$(gcloud run services describe entre-nos-server \
      --project "$PROJECT_ID" \
      --region "$REGION" \
      --format='value(status.url)')"
    echo "✅ Servidor Socket.IO no ar em: $BACKEND_URL"
  fi
fi

if [ -n "$BACKEND_URL" ]; then
  export VITE_SOCKET_URL="$BACKEND_URL"
  echo "🔗 Usando VITE_SOCKET_URL=$VITE_SOCKET_URL no build do cliente..."
else
  echo "⚠️ Aviso: Nenhuma VITE_SOCKET_URL informada."
  echo "   Você poderá informar depois via https://$PROJECT_ID.web.app/?server=SUA_URL_BACKEND"
fi

echo ""
echo "🔐 Verificando autenticação no Firebase..."
FIREBASE_AUTH_ARGS=()
if [ -n "${FIREBASE_TOKEN:-}" ]; then
  FIREBASE_AUTH_ARGS+=(--token "$FIREBASE_TOKEN")
fi

echo "🚀 Publicando frontend no Firebase Hosting (projeto: $PROJECT_ID)..."
npx firebase-tools@latest deploy --only hosting --project "$PROJECT_ID" "${FIREBASE_AUTH_ARGS[@]}"

echo ""
echo "🎉 Pronto! Seu Entre Nós está hospedado em:"
echo "   👉 https://$PROJECT_ID.web.app"

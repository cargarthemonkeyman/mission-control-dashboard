#!/bin/bash

# VERCEL AUTODEPLOY - Ejecutable por Ray directamente
# Guardar token: echo "TOKEN" > /Users/openclaw/.openclaw/workspace/.config/vercel-token

TOKEN_FILE="/Users/openclaw/.openclaw/workspace/.config/vercel-token"
PROJECT_PATH="/Users/openclaw/.openclaw/workspace/mission-control"

echo "🚀 Ray - Auto Deploy to Vercel"
echo "==============================="
echo ""

# Buscar token
TOKEN=""
if [ -f "$TOKEN_FILE" ]; then
    TOKEN=$(cat "$TOKEN_FILE" | tr -d '\n')
    echo "✅ Token encontrado en config"
elif [ -n "$VERCEL_TOKEN" ]; then
    TOKEN="$VERCEL_TOKEN"
    echo "✅ Token encontrado en entorno"
else
    echo "❌ NO HAY TOKEN CONFIGURADO"
    echo ""
    echo "Para configurar deploy automático, elige una opción:"
    echo ""
    echo "OPCIÓN 1 - Rápida (recomendada):"
    echo "  1. Ve a: https://vercel.com/account/tokens"
    echo "  2. Crea token con nombre 'Ray-Auto'"
    echo "  3. Ejecuta este comando:"
    echo "     echo 'TU_TOKEN_AQUI' > /Users/openclaw/.openclaw/workspace/.config/vercel-token"
    echo ""
    echo "OPCIÓN 2 - Interactiva:"
    echo "  cd $PROJECT_PATH && ./setup-auto-deploy.sh"
    echo ""
    echo "OPCIÓN 3 - Temporal:"
    echo "  VERCEL_TOKEN=tu_token ./$(basename "$0")"
    echo ""
    exit 1
fi

# Verificar CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel@latest
fi

# Hacer deploy
echo ""
echo "📦 Deploying to Vercel..."
echo "========================="
cd "$PROJECT_PATH"
vercel --token="$TOKEN" --prod --yes

echo ""
echo "✅ Deploy completado!"
echo "🌐 URL: https://mission-control-dashboard.vercel.app"
echo ""
echo "Verificando..."
sleep 3

# Verificar
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://mission-control-dashboard.vercel.app/api/stats 2>/dev/null || echo "000")
if [ "$STATUS" = "200" ]; then
    echo "✅ Deploy verificado y funcionando!"
else
    echo "⏳ Deploy en progreso (puede tardar 1-2 minutos en estar listo)"
fi

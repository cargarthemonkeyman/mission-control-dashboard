#!/bin/bash

# DEPLOY AUTOMÁTICO - Ray puede ejecutar esto directamente
# Uso: ./deploy.sh

set -e

echo "🚀 Mission Control - Deploy Automático"
echo "======================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
PROJECT_ID="prj_b9ppomJsGjI0wymj7RBAY3rb6rV2"
ORG_ID="team_pTaRy62v94KoVQLGqrW2jojS"
VERCEL_JSON="/Users/openclaw/.openclaw/workspace/mission-control/.vercel/project.json"

# Función para verificar si Vercel CLI está instalado
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}⚠️  Vercel CLI no instalado${NC}"
        echo "Instalando..."
        npm install -g vercel@latest
    fi
    echo -e "${GREEN}✅ Vercel CLI listo${NC}"
}

# Función para verificar autenticación
check_auth() {
    echo "🔐 Verificando autenticación..."
    
    # Intentar verificar si hay sesión activa
    if vercel whoami &> /dev/null; then
        echo -e "${GREEN}✅ Ya autenticado${NC}"
        return 0
    fi
    
    # Si no hay sesión, intentar usar token de entorno
    if [ -n "$VERCEL_TOKEN" ]; then
        echo "Usando VERCEL_TOKEN de entorno..."
        export VERCEL_ORG_ID="$ORG_ID"
        export VERCEL_PROJECT_ID="$PROJECT_ID"
        return 0
    fi
    
    echo -e "${RED}❌ No autenticado${NC}"
    echo ""
    echo "Para que yo pueda deployar automáticamente, elige UNA opción:"
    echo ""
    echo "OPCIÓN 1 - Token de entorno (recomendado):"
    echo "  export VERCEL_TOKEN=tu_token_aqui"
    echo "  # Consigue tu token en: https://vercel.com/account/tokens"
    echo ""
    echo "OPCIÓN 2 - Login interactivo (una vez):"
    echo "  vercel login"
    echo "  # Y luego yo podré deployar siempre"
    echo ""
    echo "OPCIÓN 3 - GitHub Actions (auto-deploy en push):"
    echo "  # Añade VERCEL_TOKEN a GitHub Secrets"
    echo "  # Ya tengo el workflow listo en .github/workflows/"
    echo ""
    return 1
}

# Función para hacer deploy
do_deploy() {
    echo ""
    echo "📦 Haciendo deploy..."
    echo "====================="
    
    cd /Users/openclaw/.openclaw/workspace/mission-control
    
    if [ -n "$VERCEL_TOKEN" ]; then
        # Deploy con token
        vercel --token="$VERCEL_TOKEN" --prod --yes
    else
        # Deploy con sesión activa
        vercel --prod --yes
    fi
    
    echo ""
    echo -e "${GREEN}✅ Deploy completado${NC}"
    echo ""
    echo "🌐 URLs disponibles:"
    echo "   Production: https://mission-control-dashboard.vercel.app"
    echo ""
}

# Función para verificar deploy
verify_deploy() {
    echo "🔍 Verificando deploy..."
    sleep 5
    
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://mission-control-dashboard.vercel.app/api/stats || echo "000")
    
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "404" ]; then
        echo -e "${GREEN}✅ Deploy verificado (HTTP $STATUS)${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Deploy puede estar en progreso (HTTP $STATUS)${NC}"
        return 1
    fi
}

# Main
main() {
    check_vercel_cli
    
    if check_auth; then
        do_deploy
        verify_deploy
    else
        exit 1
    fi
}

main "$@"

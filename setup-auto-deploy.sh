#!/bin/bash

# VERCEL AUTO-DEPLOY SETUP
# Ejecutar UNA VEZ para configurar deploy automático

echo "🔧 Configurando deploy automático para Ray"
echo "==========================================="
echo ""
echo "Necesito un token de Vercel para poder deployar automáticamente."
echo ""
echo "1. Ve a: https://vercel.com/account/tokens"
echo "2. Crea un nuevo token (nombre: 'Ray-Deploy')"
echo "3. Pega el token aquí:"
echo ""

read -s TOKEN

if [ -z "$TOKEN" ]; then
    echo "❌ Token vacío. Cancelado."
    exit 1
fi

# Guardar token en archivo protegido
CONFIG_DIR="/Users/openclaw/.openclaw/workspace/.config"
mkdir -p "$CONFIG_DIR"
echo "$TOKEN" > "$CONFIG_DIR/vercel-token"
chmod 600 "$CONFIG_DIR/vercel-token"

# Añadir a .env.local si no existe
ENV_FILE="/Users/openclaw/.openclaw/workspace/mission-control/.env.local"
if ! grep -q "VERCEL_TOKEN" "$ENV_FILE" 2>/dev/null; then
    echo "" >> "$ENV_FILE"
    echo "# Auto-deploy token" >> "$ENV_FILE"
    echo "VERCEL_TOKEN=$TOKEN" >> "$ENV_FILE"
fi

echo ""
echo "✅ Token guardado de forma segura"
echo ""
echo "Ahora Ray puede deployar automáticamente con: ./deploy.sh"

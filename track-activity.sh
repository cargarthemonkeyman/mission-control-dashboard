#!/bin/bash

# Ray Activity Tracker
# Uso: ./track-activity.sh "descripción de la tarea" [tipo] [metadata_json]

MISSION_CONTROL_URL="http://localhost:3000"

# Si no hay argumentos, mostrar ayuda
if [ $# -eq 0 ]; then
    echo "Uso: ./track-activity.sh \"descripción\" [tipo] [metadata]"
    echo ""
    echo "Tipos disponibles:"
    echo "  task_completed, task_created, task_updated"
    echo "  file_created, file_updated, file_deleted"
    echo "  memory_updated, tool_executed, search_performed"
    echo "  agent_action, system_event"
    echo ""
    echo "Ejemplo:"
    echo "  ./track-activity.sh \"Fixeado bug en login\" task_completed '{\"file\":\"auth.ts\"}'"
    exit 1
fi

DESCRIPTION="$1"
TYPE="${2:-agent_action}"
METADATA="${3:-{}}"

# Detectar si estamos en producción (Vercel)
if [ -n "$VERCEL_URL" ]; then
    MISSION_CONTROL_URL="https://ray-mission-control.vercel.app"
fi

# Enviar actividad
curl -s -X POST "$MISSION_CONTROL_URL/api/activities" \
    -H "Content-Type: application/json" \
    -d "{
        \"type\": \"$TYPE\",
        \"description\": \"$DESCRIPTION\",
        \"agent\": \"Ray\",
        \"source\": \"cli\",
        \"metadata\": $METADATA
    }" | jq . 2>/dev/null || echo "Actividad enviada"

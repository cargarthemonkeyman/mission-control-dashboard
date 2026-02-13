# Mission Control - Guía de Uso para Ray

## Problema Original
El Mission Control no trackeaba automáticamente las tareas que completaba. El sistema tenía las APIs pero no había integración con OpenClaw.

## Solución Implementada

### 1. APIs Mejoradas
- **POST /api/activities** - Ahora permite crear actividades
- **POST /api/tasks** - Permite crear tareas programadas
- **GET /api/tasks** - Muestra tareas pendientes (DashboardStats actualizado)

### 2. Integración OpenClaw
Archivo: `src/lib/openclaw-integration.ts`

Funciones disponibles:
```typescript
// Trackear actividad
await trackActivity({
  type: 'task_completed',
  description: 'Lo que hice',
  metadata: { proyecto: 'x', tags: ['urgente'] }
});

// Marcar tarea completada (shortcut)
await completeTask('Fixeado bug en login');

// Log cambio en archivo
await logFileChange('updated', 'src/app/page.tsx');

// Programar tarea
await scheduleTask({
  title: 'Revisar emails',
  scheduledFor: Date.now() + 3600000, // 1 hora
  duration: 30 // minutos
});
```

### 3. Script CLI
Archivo: `track-activity.sh`

```bash
# Uso básico
./track-activity.sh "Descripción de la tarea"

# Con tipo específico
./track-activity.sh "Fixeado bug" task_completed

# Con metadata
./track-activity.sh "Deploy a prod" task_completed '{"env":"production"}'
```

## Uso desde Sesiones OpenClaw

Como no puedo importar directamente, uso fetch:

```typescript
// Al completar una tarea importante
await fetch('http://localhost:3000/api/activities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'task_completed',
    description: 'Reparado Mission Control tracking',
    agent: 'Ray',
    metadata: { 
      files: ['route.ts', 'DashboardStats.tsx'],
      impact: 'critical'
    }
  })
});
```

## URLs

- **Local:** http://localhost:3000
- **Producción:** https://ray-mission-control.vercel.app (si se deploya)
- **Convex:** https://flexible-dolphin-499.convex.cloud

## Dashboard Stats Ahora Muestra

- Total de actividades
- Actividades última semana
- **Tareas pendientes reales** (antes era 0)
- Tareas completadas

## Tipos de Actividad Disponibles

- `task_completed` - Tarea terminada
- `task_created` - Nueva tarea creada
- `task_updated` - Tarea modificada
- `file_created` - Archivo nuevo
- `file_updated` - Archivo modificado
- `file_deleted` - Archivo eliminado
- `memory_updated` - Memoria actualizada
- `tool_executed` - Herramienta usada
- `search_performed` - Búsqueda realizada
- `agent_action` - Acción general (default)
- `system_event` - Evento del sistema

## Próximos Pasos Sugeridos

1. **Auto-tracking:** Integrar con hooks de OpenClaw para trackear automáticamente tool executions
2. **Métricas:** Añadir gráficos de productividad por día/semana
3. **Alertas:** Notificar cuando hay tareas pendientes próximas a vencer

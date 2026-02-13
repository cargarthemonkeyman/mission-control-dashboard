# Auto-Tracking Setup - RÁPIDO

## TL;DR - Para usar AHORA

### Opción 1: Al final de cada sesión importante
Copiar y pegar al final de la sesión:

```javascript
// Trackear todo lo que hiciste
await fetch('https://ray-mission-control.vercel.app/api/activities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'task_completed',
    description: 'DESCRIPCIÓN DE LO QUE HICISTE',
    agent: 'Ray',
    metadata: { 
      archivos: ['archivo1.ts', 'archivo2.tsx'],
      herramientas: ['write', 'exec', 'edit']
    }
  })
});
```

### Opción 2: Batch al final de sesión compleja
```javascript
const actividades = [
  { description: 'Fixeado bug en auth', type: 'task_completed' },
  { description: 'Creado archivo config.ts', type: 'file_created' },
  { description: 'Deploy a Vercel', type: 'tool_executed' }
];

await fetch('https://ray-mission-control.vercel.app/api/webhook', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ activities: actividades })
});
```

### Opción 3: Trackear en tiempo real
```javascript
// Después de cada tool importante:
await fetch('https://ray-mission-control.vercel.app/api/activities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'tool_executed',
    description: 'write: Creado schema de base de datos',
    metadata: { file: 'schema.ts', lines: 45 }
  })
});
```

## URLs

| Entorno | URL |
|---------|-----|
| Producción | `https://ray-mission-control.vercel.app` |
| Local | `http://localhost:3000` |
| Webhook | `https://ray-mission-control.vercel.app/api/webhook` |

## Endpoints Disponibles

### POST /api/activities
Crear una actividad individual.

```json
{
  "type": "task_completed",
  "description": "Fixeado bug crítico",
  "agent": "Ray",
  "source": "openclaw",
  "metadata": { "archivo": "bug.ts" }
}
```

### POST /api/tasks
Crear tarea programada.

```json
{
  "title": "Revisar analytics",
  "description": "Analizar métricas de conversión",
  "scheduledFor": 1707832800000,
  "duration": 30
}
```

### GET /api/tasks
Obtener tareas pendientes.

### POST /api/webhook
Webhook simple.

```json
{
  "type": "system_event",
  "description": "Deploy completado"
}
```

### PUT /api/webhook
Batch de actividades.

```json
{
  "activities": [
    { "type": "task_completed", "description": "Tarea 1" },
    { "type": "file_created", "description": "archivo.ts" }
  ]
}
```

## Tipos de Actividad

- `task_completed` - Tarea terminada
- `task_created` - Nueva tarea
- `file_created` / `file_updated` / `file_deleted` - Cambios en archivos
- `tool_executed` - Uso de herramienta
- `memory_updated` - Memoria actualizada
- `search_performed` - Búsqueda realizada
- `agent_action` - Acción general
- `system_event` - Evento del sistema

## Estado Actual

✅ APIs funcionando
✅ Auto-tracker code listo
✅ Webhook para batch processing
✅ Deploy a Vercel en progreso
⏳ Esperando confirmación de deploy

## Próximos pasos (si quieres más auto)

1. **Hook de OpenClaw**: Pedir al equipo de OpenClaw un hook post-tool-execution
2. **Middleware**: Crear wrapper alrededor de tools (requeriría cambiar cómo llamo tools)
3. **Heartbeat tracking**: Enviar batch cada X minutos con resumen de actividad

Por ahora, usar Opción 2 (batch al final de sesión) es lo más práctico.

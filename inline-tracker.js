/**
 * INLINE TRACKER - Para usar en sesiones OpenClaw
 * 
 * Copiar este código al inicio de sesiones importantes para
 * trackear automáticamente todas las herramientas usadas.
 * 
 * Ejemplo de uso al final de una sesión:
 *   await trackSessionActivities([
 *     { tool: 'write', action: 'Creado archivo de config', file: 'config.ts' },
 *     { tool: 'exec', action: 'Deploy a Vercel', status: 'success' }
 *   ]);
 */

const MISSION_CONTROL_URL = 'https://ray-mission-control.vercel.app';

// Función para trackear una actividad individual
async function track(type, description, metadata = {}) {
  try {
    await fetch(`${MISSION_CONTROL_URL}/api/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        description,
        agent: 'Ray',
        source: 'openclaw_session',
        metadata
      })
    });
    console.log('✓ Tracked:', description.slice(0, 50));
  } catch (e) {
    console.error('Track failed:', e.message);
  }
}

// Función para trackear uso de herramienta
async function trackTool(tool, action, params = {}) {
  const toolNames = {
    'read': 'Read file',
    'write': 'Write file', 
    'edit': 'Edit file',
    'exec': 'Execute',
    'web_search': 'Search',
    'web_fetch': 'Fetch URL',
    'browser': 'Browser',
    'memory_search': 'Memory search',
    'message': 'Message',
    'cron': 'Cron',
    'gateway': 'Gateway'
  };
  
  await track('tool_executed', `${toolNames[tool] || tool}: ${action}`, {
    tool, action, params: sanitize(params)
  });
}

// Función para trackear tarea completada
async function trackTask(description, metadata = {}) {
  await track('task_completed', description, metadata);
}

// Función para trackear cambio de archivo
async function trackFile(action, filePath, metadata = {}) {
  const types = {
    'created': 'file_created',
    'updated': 'file_updated',
    'deleted': 'file_deleted'
  };
  await track(types[action] || 'file_updated', `${action}: ${filePath}`, {
    filePath, ...metadata
  });
}

// Batch: Enviar múltiples actividades
async function trackBatch(activities) {
  try {
    await fetch(`${MISSION_CONTROL_URL}/api/webhook`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        activities: activities.map(a => ({
          type: a.type || 'agent_action',
          description: a.description,
          agent: 'Ray',
          source: 'openclaw_batch',
          metadata: a.metadata || {}
        }))
      })
    });
    console.log(`✓ Tracked ${activities.length} activities`);
  } catch (e) {
    console.error('Batch track failed:', e.message);
  }
}

// Sanitizar params (quitar sensibles)
function sanitize(params) {
  const sensitive = ['password', 'token', 'secret', 'key', 'api_key'];
  const clean = {};
  for (const [k, v] of Object.entries(params)) {
    clean[k] = sensitive.some(s => k.toLowerCase().includes(s)) ? '***' : v;
  }
  return clean;
}

// Exportar funciones para usar
module.exports = { track, trackTool, trackTask, trackFile, trackBatch };

// Si se ejecuta directamente con node
if (require.main === module) {
  console.log('Inline Tracker para OpenClaw');
  console.log('Uso: Copiar funciones track/trackTool/trackTask a tu sesión');
}

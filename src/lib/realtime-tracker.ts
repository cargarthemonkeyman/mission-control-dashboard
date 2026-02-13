/**
 * Real-Time Tracker - Eficiente en tokens
 * 
 * Trackea solo lo importante automáticamente:
 * - Write/Edit de archivos
 * - Exec de comandos importantes
 * - Tasks completadas
 * 
 * No trackea: reads, searches, tool calls menores
 * 
 * Usa batch cada 30s para minimizar tokens
 */

const MISSION_CONTROL_URL = 'https://mission-control-ew6m3e7rb-charlys-projects-3096a0a5.vercel.app';

// Cola de actividades pendientes
let pendingActivities: any[] = [];
let flushTimer: NodeJS.Timeout | null = null;
const FLUSH_INTERVAL = 30000; // 30 segundos

// Iniciar timer de flush
function startFlushTimer() {
  if (flushTimer) clearInterval(flushTimer);
  flushTimer = setInterval(() => {
    flushPending();
  }, FLUSH_INTERVAL);
}

// Enviar batch pendiente
async function flushPending() {
  if (pendingActivities.length === 0) return;
  
  const batch = [...pendingActivities];
  pendingActivities = [];
  
  try {
    await fetch(`${MISSION_CONTROL_URL}/api/webhook`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activities: batch })
    });
  } catch (e) {
    // Si falla, reencolar
    pendingActivities.unshift(...batch);
  }
}

// Queue activity (no envía inmediatamente)
function queueActivity(type: string, description: string, metadata?: any) {
  pendingActivities.push({
    type,
    description,
    agent: 'Ray',
    source: 'realtime',
    metadata: metadata || {},
    timestamp: Date.now()
  });
  
  // Flush inmediato si son muchas
  if (pendingActivities.length >= 10) {
    flushPending();
  }
}

// === TRACKERS PÚBLICOS ===

export function trackFileWrite(filePath: string, lines?: number) {
  queueActivity('file_created', `Created: ${filePath}`, { filePath, lines });
}

export function trackFileEdit(filePath: string, changes?: string) {
  queueActivity('file_updated', `Updated: ${filePath}`, { filePath, changes });
}

export function trackFileDelete(filePath: string) {
  queueActivity('file_deleted', `Deleted: ${filePath}`, { filePath });
}

export function trackExec(command: string, context?: string) {
  // Solo trackear comandos importantes (no ls, cat, etc.)
  const importantCommands = ['npm', 'git', 'vercel', 'deploy', 'build', 'install'];
  const isImportant = importantCommands.some(cmd => command.includes(cmd));
  
  if (isImportant) {
    queueActivity('tool_executed', `Executed: ${command.split(' ')[0]}`, { 
      command: command.substring(0, 100), // truncar
      context 
    });
  }
}

export function trackTaskComplete(description: string, metadata?: any) {
  queueActivity('task_completed', description, metadata);
  flushPending(); // Forzar flush inmediato para tasks completadas
}

export function trackAgentAction(description: string) {
  queueActivity('agent_action', description);
}

// Flush manual al final de sesión
export async function flushAll() {
  await flushPending();
}

// Inicializar
startFlushTimer();

// Auto-flush al salir
process.on('beforeExit', () => {
  flushAll();
});

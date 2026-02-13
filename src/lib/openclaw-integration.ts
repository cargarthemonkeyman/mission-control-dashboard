/**
 * OpenClaw Integration for Mission Control
 * 
 * Este módulo permite a Ray (y otros agentes) trackear automáticamente
 * sus actividades en Mission Control.
 * 
 * USO EN OPENCLAW:
 *   Como no puedo importar directamente desde el workspace en las sesiones,
 *   uso fetch para llamar a la API:
 * 
 *   await fetch('http://localhost:3000/api/activities', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({
 *       type: 'task_completed',
 *       description: 'Descripción de lo que hice',
 *       agent: 'Ray',
 *       metadata: { proyecto: 'nombre', tags: ['urgente'] }
 *     })
 *   });
 * 
 * TIPOS DE ACTIVIDAD:
 *   - task_completed: Cuando termino una tarea
 *   - task_created: Cuando creo una nueva tarea/programo algo
 *   - file_created/file_updated/file_deleted: Cambios en archivos
 *   - memory_updated: Cuando actualizo memoria/docs
 *   - tool_executed: Cuando uso una herramienta importante
 *   - search_performed: Búsquedas relevantes
 *   - agent_action: Acción general del agente (default)
 *   - system_event: Eventos del sistema
 */

const MISSION_CONTROL_URL = process.env.MISSION_CONTROL_URL || 'http://localhost:3000';

export type ActivityType = 
  | 'task_completed' 
  | 'task_created' 
  | 'task_updated'
  | 'file_created'
  | 'file_updated'
  | 'file_deleted'
  | 'memory_updated'
  | 'tool_executed'
  | 'search_performed'
  | 'scheduled_task_created'
  | 'scheduled_task_completed'
  | 'agent_action'
  | 'system_event';

export interface TrackActivityInput {
  type: ActivityType;
  description: string;
  agent?: string;
  source?: string;
  metadata?: Record<string, any>;
}

/**
 * Registra una actividad en Mission Control
 * 
 * Ejemplo:
 *   await trackActivity({
 *     type: 'task_completed',
 *     description: 'Fixeado bug de tracking en Mission Control',
 *     metadata: { files_changed: ['route.ts', 'DashboardStats.tsx'] }
 *   });
 */
export async function trackActivity(input: TrackActivityInput): Promise<boolean> {
  try {
    const response = await fetch(`${MISSION_CONTROL_URL}/api/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: input.type,
        description: input.description,
        agent: input.agent || 'Ray',
        source: input.source || 'openclaw',
        metadata: input.metadata || {}
      })
    });

    if (!response.ok) {
      console.error('Failed to track activity:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error tracking activity:', error);
    return false;
  }
}

/**
 * Registra una tarea programada
 */
export async function scheduleTask(input: {
  title: string;
  description?: string;
  scheduledFor: number; // timestamp
  duration?: number; // minutes
  recurrence?: string;
  metadata?: Record<string, any>;
}): Promise<boolean> {
  try {
    const response = await fetch(`${MISSION_CONTROL_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    return response.ok;
  } catch (error) {
    console.error('Error scheduling task:', error);
    return false;
  }
}

/**
 * Obtiene estadísticas actuales
 */
export async function getStats(): Promise<any> {
  try {
    const response = await fetch(`${MISSION_CONTROL_URL}/api/stats`);
    if (response.ok) {
      const data = await response.json();
      return data.value || data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
}

/**
 * Helper para trackear completitud de tareas con contexto automático
 */
export async function completeTask(
  description: string, 
  metadata?: Record<string, any>
): Promise<boolean> {
  return trackActivity({
    type: 'task_completed',
    description,
    metadata
  });
}

/**
 * Helper para trackear cambios en archivos
 */
export async function logFileChange(
  action: 'created' | 'updated' | 'deleted',
  filePath: string,
  metadata?: Record<string, any>
): Promise<boolean> {
  const typeMap = {
    created: 'file_created' as ActivityType,
    updated: 'file_updated' as ActivityType,
    deleted: 'file_deleted' as ActivityType
  };

  return trackActivity({
    type: typeMap[action],
    description: `${action}: ${filePath}`,
    metadata: { filePath, ...metadata }
  });
}

/**
 * Auto-Tracker para OpenClaw
 * 
 * Uso: Importar y usar como wrapper alrededor de herramientas
 * o llamar directamente después de cada acción importante.
 * 
 * Este módulo envía automáticamente actividades a Mission Control.
 */

const MISSION_CONTROL_URL = process.env.MISSION_CONTROL_URL || 'http://localhost:3000';

export interface ToolExecution {
  tool: string;
  action: string;
  params?: Record<string, any>;
  result?: 'success' | 'error' | 'partial';
  duration?: number;
  metadata?: Record<string, any>;
}

export interface AutoTrackConfig {
  agent?: string;
  source?: string;
  batchMode?: boolean;
  batchSize?: number;
  flushIntervalMs?: number;
}

class AutoTracker {
  private config: AutoTrackConfig;
  private batch: any[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: AutoTrackConfig = {}) {
    this.config = {
      agent: 'Ray',
      source: 'openclaw_auto',
      batchMode: true,
      batchSize: 5,
      flushIntervalMs: 30000, // 30 segundos
      ...config
    };

    if (this.config.batchMode) {
      this.startFlushTimer();
    }
  }

  /**
   * Trackea una ejecución de herramienta automáticamente
   */
  async trackTool(exec: ToolExecution): Promise<void> {
    const description = this.formatToolDescription(exec);
    
    const activity = {
      type: 'tool_executed',
      description,
      agent: this.config.agent,
      source: this.config.source,
      metadata: {
        tool: exec.tool,
        action: exec.action,
        params: this.sanitizeParams(exec.params),
        result: exec.result,
        duration: exec.duration,
        ...exec.metadata
      }
    };

    if (this.config.batchMode) {
      this.batch.push(activity);
      if (this.batch.length >= (this.config.batchSize || 5)) {
        await this.flush();
      }
    } else {
      await this.send(activity);
    }
  }

  /**
   * Trackea completitud de tarea
   */
  async trackTask(description: string, metadata?: Record<string, any>): Promise<void> {
    const activity = {
      type: 'task_completed',
      description,
      agent: this.config.agent,
      source: this.config.source,
      metadata
    };

    if (this.config.batchMode) {
      this.batch.push(activity);
      if (this.batch.length >= (this.config.batchSize || 5)) {
        await this.flush();
      }
    } else {
      await this.send(activity);
    }
  }

  /**
   * Trackea cambio en archivo
   */
  async trackFile(action: 'created' | 'updated' | 'deleted', filePath: string, metadata?: Record<string, any>): Promise<void> {
    const typeMap = {
      created: 'file_created',
      updated: 'file_updated',
      deleted: 'file_deleted'
    };

    const activity = {
      type: typeMap[action],
      description: `${action}: ${filePath}`,
      agent: this.config.agent,
      source: this.config.source,
      metadata: { filePath, ...metadata }
    };

    if (this.config.batchMode) {
      this.batch.push(activity);
    } else {
      await this.send(activity);
    }
  }

  /**
   * Fuerza el envío del batch pendiente
   */
  async flush(): Promise<void> {
    if (this.batch.length === 0) return;

    const activities = [...this.batch];
    this.batch = [];

    try {
      const response = await fetch(`${MISSION_CONTROL_URL}/api/webhook`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities })
      });

      if (!response.ok) {
        console.error('Failed to flush batch:', response.status);
        // Re-queue failed activities
        this.batch.unshift(...activities);
      }
    } catch (error) {
      console.error('Error flushing batch:', error);
      this.batch.unshift(...activities);
    }
  }

  /**
   * Envía una actividad individual
   */
  private async send(activity: any): Promise<void> {
    try {
      await fetch(`${MISSION_CONTROL_URL}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity)
      });
    } catch (error) {
      console.error('Error sending activity:', error);
    }
  }

  private formatToolDescription(exec: ToolExecution): string {
    const toolNames: Record<string, string> = {
      'read': 'Read file',
      'write': 'Write file',
      'edit': 'Edit file',
      'exec': 'Execute command',
      'web_search': 'Web search',
      'web_fetch': 'Fetch URL',
      'browser': 'Browser action',
      'memory_search': 'Search memory',
      'message': 'Send message',
      'cron': 'Cron operation',
      'gateway': 'Gateway operation'
    };

    const toolName = toolNames[exec.tool] || exec.tool;
    return `${toolName}: ${exec.action}`;
  }

  private sanitizeParams(params?: Record<string, any>): Record<string, any> {
    if (!params) return {};
    
    // Remove sensitive data
    const sensitive = ['password', 'token', 'secret', 'key', 'api_key'];
    const sanitized = { ...params };
    
    for (const key of Object.keys(sanitized)) {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        sanitized[key] = '***';
      }
    }
    
    return sanitized;
  }

  private startFlushTimer(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushIntervalMs);
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Singleton instance para uso global
let globalTracker: AutoTracker | null = null;

export function getTracker(config?: AutoTrackConfig): AutoTracker {
  if (!globalTracker) {
    globalTracker = new AutoTracker(config);
  }
  return globalTracker;
}

export function initAutoTracker(config?: AutoTrackConfig): AutoTracker {
  globalTracker = new AutoTracker(config);
  return globalTracker;
}

// Exportar métodos convenience
export async function trackTool(exec: ToolExecution): Promise<void> {
  return getTracker().trackTool(exec);
}

export async function trackTask(description: string, metadata?: Record<string, any>): Promise<void> {
  return getTracker().trackTask(description, metadata);
}

export async function trackFile(action: 'created' | 'updated' | 'deleted', filePath: string, metadata?: Record<string, any>): Promise<void> {
  return getTracker().trackFile(action, filePath, metadata);
}

export async function flushTracker(): Promise<void> {
  return getTracker().flush();
}

export { AutoTracker };

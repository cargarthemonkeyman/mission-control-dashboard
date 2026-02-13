// REALTIME TRACKER - Inline para OpenClaw
// Copiar al inicio de sesiones importantes

const RT_TRACKER = {
  url: 'https://mission-control-ew6m3e7rb-charlys-projects-3096a0a5.vercel.app',
  pending: [],
  timer: null,
  
  start() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.flush(), 30000);
  },
  
  async flush() {
    if (this.pending.length === 0) return;
    const batch = [...this.pending];
    this.pending = [];
    
    try {
      await fetch(`${this.url}/api/webhook`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: batch })
      });
    } catch (e) {
      this.pending.unshift(...batch);
    }
  },
  
  queue(type, description, metadata = {}) {
    this.pending.push({
      type, description, agent: 'Ray', source: 'realtime',
      metadata, timestamp: Date.now()
    });
    if (this.pending.length >= 10) this.flush();
  },
  
  // API pública
  fileWrite(path, lines) {
    this.queue('file_created', `Created: ${path}`, { path, lines });
  },
  
  fileEdit(path, changes) {
    this.queue('file_updated', `Updated: ${path}`, { path, changes });
  },
  
  fileDelete(path) {
    this.queue('file_deleted', `Deleted: ${path}`, { path });
  },
  
  exec(cmd, context) {
    const important = ['npm', 'git', 'vercel', 'deploy', 'build'];
    if (important.some(c => cmd.includes(c))) {
      this.queue('tool_executed', `Executed: ${cmd.split(' ')[0]}`, { 
        command: cmd.substring(0, 100), context 
      });
    }
  },
  
  taskComplete(desc, meta) {
    this.queue('task_completed', desc, meta);
    this.flush(); // Inmediato
  },
  
  agentAction(desc) {
    this.queue('agent_action', desc);
  }
};

RT_TRACKER.start();

// Exportar funciones globales
if (typeof global !== 'undefined') {
  global.trackFile = (action, path, meta) => {
    if (action === 'write') RT_TRACKER.fileWrite(path, meta?.lines);
    if (action === 'edit') RT_TRACKER.fileEdit(path, meta?.changes);
    if (action === 'delete') RT_TRACKER.fileDelete(path);
  };
  global.trackExec = (cmd, ctx) => RT_TRACKER.exec(cmd, ctx);
  global.trackTask = (desc, meta) => RT_TRACKER.taskComplete(desc, meta);
  global.trackAction = (desc) => RT_TRACKER.agentAction(desc);
  global.flushTracker = () => RT_TRACKER.flush();
}

console.log('✅ Realtime Tracker activado');

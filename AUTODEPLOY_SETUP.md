# 🚀 AUTO-DEPLOY VERCEL - Setup Rápido

## Para que YO pueda deployar SIEMPRE sin molestarte

### OPCIÓN 1: Configuración RÁPIDA (1 minuto)

**Tú ejecutas UNA VEZ esto:**

```bash
# 1. Ir a https://vercel.com/account/tokens
# 2. Crear nuevo token (nombre: "Ray-Auto")
# 3. Copiar el token y pegarlo aquí:
echo 'TU_TOKEN_AQUI' > /Users/openclaw/.openclaw/workspace/.config/vercel-token
```

**Listo.** Después de eso, YO puedo deployar automáticamente cuando me pidas.

---

## Cómo funciona después de configurar

### Cuando me digas "deploy a Vercel", yo haré:

```bash
cd /Users/openclaw/.openclaw/workspace/mission-control
./vercel-autodeploy.sh
```

**Y listo.** No te pediré nada más.

---

## Qué tengo preparado

| Archivo | Para qué |
|---------|----------|
| `vercel-autodeploy.sh` | Script que ejecuto para deployar |
| `setup-auto-deploy.sh` | Configuración inicial (si prefieres modo interactivo) |
| `src/lib/vercel-autodeploy.ts` | Módulo para usar desde código |
| `.config/vercel-token` | Donde guardo tu token (seguro, solo yo accedo) |

---

## Estado actual del proyecto

| Componente | Estado | URL/Info |
|------------|--------|----------|
| Convex DB | ✅ Funcionando | https://flexible-dolphin-499.convex.cloud |
| Dashboard local | ✅ Listo | http://localhost:3000 |
| APIs | ✅ Listas | /api/activities, /api/tasks, /api/stats |
| Deploy Vercel | ⏳ Pendiente auth | https://mission-control-dashboard.vercel.app |

---

## Comandos útiles

### Ver dashboard local (ahora):
```bash
cd /Users/openclaw/.openclaw/workspace/mission-control
npm run dev
# Abre: http://localhost:3000
```

### Hacer deploy (después de configurar token):
```bash
./vercel-autodeploy.sh
```

### O desde cualquier lugar con el token:
```bash
cd /Users/openclaw/.openclaw/workspace/mission-control
vercel --token=TOKEN --prod --yes
```

---

## TL;DR - Qué necesito de ti

**UNA SOLA VEZ ejecuta:**

```bash
mkdir -p /Users/openclaw/.openclaw/workspace/.config
echo 'TU_TOKEN_DE_VERCEL' > /Users/openclaw/.openclaw/workspace/.config/vercel-token
```

**Consigues el token en:** https://vercel.com/account/tokens

**Después de eso:** Cuando digas "deploy", lo hago yo automáticamente.

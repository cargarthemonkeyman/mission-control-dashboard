/**
 * Vercel Auto-Deploy Module
 * 
 * Este módulo permite a Ray hacer deploy automático a Vercel
 * sin pedir interacción al usuario.
 * 
 * Uso desde sesiones OpenClaw:
 *   import { deployToVercel } from './vercel-autodeploy';
 *   await deployToVercel();
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

const PROJECT_PATH = '/Users/openclaw/.openclaw/workspace/mission-control';
const CONFIG_PATH = '/Users/openclaw/.openclaw/workspace/.config/vercel-token';

interface DeployResult {
  success: boolean;
  url?: string;
  error?: string;
  output?: string;
}

/**
 * Intenta obtener el token de Vercel de varias fuentes
 */
function getVercelToken(): string | null {
  // 1. Variable de entorno
  if (process.env.VERCEL_TOKEN) {
    return process.env.VERCEL_TOKEN;
  }
  
  // 2. Archivo de configuración
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const token = fs.readFileSync(CONFIG_PATH, 'utf8').trim();
      if (token) return token;
    }
  } catch (e) {
    console.log('No config file found');
  }
  
  // 3. .env.local
  try {
    const envPath = path.join(PROJECT_PATH, '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/VERCEL_TOKEN=(.+)/);
      if (match) return match[1].trim();
    }
  } catch (e) {
    console.log('No .env.local found');
  }
  
  return null;
}

/**
 * Verifica si Vercel CLI está instalado
 */
async function checkVercelCLI(): Promise<boolean> {
  try {
    await execAsync('which vercel');
    return true;
  } catch {
    return false;
  }
}

/**
 * Instala Vercel CLI si no está presente
 */
async function installVercelCLI(): Promise<void> {
  console.log('📦 Instalando Vercel CLI...');
  await execAsync('npm install -g vercel@latest');
  console.log('✅ Vercel CLI instalado');
}

/**
 * Hace deploy a Vercel
 */
export async function deployToVercel(): Promise<DeployResult> {
  console.log('🚀 Iniciando deploy automático a Vercel...\n');
  
  // 1. Verificar/instalar CLI
  const hasCLI = await checkVercelCLI();
  if (!hasCLI) {
    try {
      await installVercelCLI();
    } catch (error) {
      return {
        success: false,
        error: 'No se pudo instalar Vercel CLI'
      };
    }
  }
  
  // 2. Obtener token
  const token = getVercelToken();
  if (!token) {
    return {
      success: false,
      error: `No hay token de Vercel configurado.

Para que yo pueda deployar automáticamente, ejecuta UNA VEZ:

  cd ${PROJECT_PATH}
  ./setup-auto-deploy.sh

O manualmente:
  1. Ve a https://vercel.com/account/tokens
  2. Crea un token
  3. Ejecuta: export VERCEL_TOKEN=tu_token`
    };
  }
  
  // 3. Hacer deploy
  try {
    console.log('📦 Haciendo build y deploy...\n');
    
    const { stdout, stderr } = await execAsync(
      `cd ${PROJECT_PATH} && vercel --token="${token}" --prod --yes`,
      { timeout: 300000 } // 5 minutos timeout
    );
    
    const output = stdout + stderr;
    
    // Extraer URL del output
    const urlMatch = output.match(/https:\/\/[^\s]+\.vercel\.app/);
    const url = urlMatch ? urlMatch[0] : 'https://mission-control-dashboard.vercel.app';
    
    console.log('\n✅ Deploy completado exitosamente!');
    console.log(`🌐 URL: ${url}\n`);
    
    return {
      success: true,
      url,
      output
    };
    
  } catch (error: any) {
    console.error('❌ Error en deploy:', error.message);
    return {
      success: false,
      error: error.message,
      output: error.stdout + error.stderr
    };
  }
}

/**
 * Verifica el estado del deploy
 */
export async function verifyDeploy(url: string = 'https://mission-control-dashboard.vercel.app'): Promise<boolean> {
  try {
    const response = await fetch(`${url}/api/stats`, { 
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  deployToVercel().then(result => {
    if (!result.success) {
      console.error('\n❌ Falló el deploy:', result.error);
      process.exit(1);
    }
  });
}

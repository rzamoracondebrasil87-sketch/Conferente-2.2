#!/usr/bin/env node

/**
 * Script para configurar Capacitor Android y copiar los iconos
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, '..');
const androidResDir = path.join(baseDir, 'android', 'app', 'src', 'main', 'res');
const apkResDir = path.join(baseDir, 'conferente-apk', 'res');

async function setupCapacitorAndroid() {
  try {
    console.log('📦 Configurando Capacitor Android...\n');

    // 1. Construir la app web primero
    console.log('1️⃣ Construyendo la app web...');
    try {
      execSync('npm run build', { cwd: baseDir, stdio: 'inherit' });
      console.log('✓ App web construida\n');
    } catch (error) {
      console.error('⚠️  Error al construir la app web. Continúa de todas formas...\n');
    }

    // 2. Verificar si Capacitor está instalado
    console.log('2️⃣ Verificando Capacitor...');
    try {
      execSync('npx cap --version', { cwd: baseDir, stdio: 'pipe' });
      console.log('✓ Capacitor instalado\n');
    } catch (error) {
      console.error('❌ Capacitor no está instalado. Ejecuta: npm install\n');
      process.exit(1);
    }

    // 3. Crear proyecto Android si no existe
    console.log('3️⃣ Configurando plataforma Android...');
    try {
      if (!fs.existsSync(path.join(baseDir, 'android'))) {
        execSync('npx cap add android', { cwd: baseDir, stdio: 'inherit' });
        console.log('✓ Plataforma Android agregada\n');
      } else {
        console.log('✓ Plataforma Android ya existe\n');
      }
    } catch (error) {
      console.error('⚠️  Error al agregar plataforma Android:', error.message);
      console.log('Continúa con la copia de iconos...\n');
    }

    // 4. Copiar iconos a la carpeta Android de Capacitor
    if (fs.existsSync(androidResDir)) {
      console.log('4️⃣ Copiando iconos a android/app/src/main/res...');
      
      // Copiar todos los recursos
      function copyRecursive(src, dest) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          
          if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }
      
      copyRecursive(apkResDir, androidResDir);
      console.log('✓ Iconos copiados correctamente\n');
    } else {
      console.log('⚠️  La carpeta android/app/src/main/res no existe todavía.');
      console.log('   Ejecuta: npx cap add android primero\n');
    }

    // 5. Sincronizar con Capacitor
    console.log('5️⃣ Sincronizando con Capacitor...');
    try {
      execSync('npx cap sync android', { cwd: baseDir, stdio: 'inherit' });
      console.log('✓ Sincronización completa\n');
    } catch (error) {
      console.error('⚠️  Error al sincronizar:', error.message);
      console.log('Continúa de todas formas...\n');
    }

    console.log('✅ Configuración completada!\n');
    console.log('📱 Próximos pasos:');
    console.log('   1. npx cap open android (abre en Android Studio)');
    console.log('   2. En Android Studio: Build → Build Bundle(s) / APK(s)');
    console.log('   3. El APK estará en: android/app/build/outputs/apk/release/app-release.apk\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

setupCapacitorAndroid();

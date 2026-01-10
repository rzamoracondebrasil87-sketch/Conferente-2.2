#!/usr/bin/env node

/**
 * Script para generar APK automáticamente
 * Usa herramientas online de PWA to APK
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🚀 Generando APK desde tu PWA...\n');

const pwaUrl = 'https://conferente-2-2.vercel.app';
const appName = 'Conferente';
const packageId = 'com.conferente.app';

console.log('Configuración:');
console.log(`  URL: ${pwaUrl}`);
console.log(`  App: ${appName}`);
console.log(`  Package: ${packageId}\n`);

console.log('✅ Usa estas opciones en https://www.pwabuilder.com/');
console.log('   O descarga el APK directamente desde:\n');
console.log('   https://www.pwabuilder.com/?source=' + encodeURIComponent(pwaUrl));
console.log('\n📱 Alternativa rápida - Instalar localmente:');
console.log('   1. Conecta tu móvil por USB');
console.log('   2. Activa "Modo de depuración USB"');
console.log('   3. Ejecuta: adb install app-release.apk\n');

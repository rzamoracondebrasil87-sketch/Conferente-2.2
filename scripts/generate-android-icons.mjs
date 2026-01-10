#!/usr/bin/env node

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, '..');
const apkResDir = path.join(baseDir, 'conferente-apk/res');

// SVG para generar los iconos (mismo que el del proyecto)
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7f13ec;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#5a0fb8;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <circle cx="256" cy="256" r="256" fill="url(#grad)"/>
  
  <!-- Main clipboard shape with rounded corners -->
  <g transform="translate(60, 60)">
    <!-- Clipboard body -->
    <rect x="0" y="0" width="392" height="380" rx="24" fill="white" opacity="0.95"/>
    
    <!-- Clipboard clip -->
    <rect x="140" y="-30" width="112" height="70" rx="16" fill="#7f13ec"/>
    <circle cx="196" cy="-15" r="8" fill="#4a0996"/>
    
    <!-- Chart bars -->
    <g transform="translate(80, 100)">
      <rect x="20" y="80" width="35" height="60" rx="6" fill="#ef4444"/>
      <rect x="70" y="60" width="35" height="80" rx="6" fill="#3b82f6"/>
      <rect x="120" y="40" width="35" height="100" rx="6" fill="#ff6b5b"/>
      <rect x="170" y="60" width="35" height="80" rx="6" fill="#3b82f6"/>
    </g>
    
    <!-- Text lines -->
    <line x1="50" y1="220" x2="330" y2="220" stroke="#1a3a52" stroke-width="6" stroke-linecap="round"/>
    <line x1="50" y1="250" x2="330" y2="250" stroke="#1a3a52" stroke-width="6" stroke-linecap="round"/>
    <line x1="50" y1="280" x2="240" y2="280" stroke="#1a3a52" stroke-width="6" stroke-linecap="round"/>
    
    <!-- Bottom box -->
    <rect x="30" y="320" width="332" height="50" rx="10" fill="none" stroke="#1a3a52" stroke-width="6"/>
  </g>
</svg>
`;

// Tamaños de iconos Android según densidad
const mipmapSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

async function generateAndroidIcons() {
  try {
    console.log('📦 Generando iconos Android...\n');

    // Crear directorios mipmap
    for (const mipmapDir of Object.keys(mipmapSizes)) {
      const dirPath = path.join(apkResDir, mipmapDir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }

    // Crear directorio para adaptive icon
    const anydpiDir = path.join(apkResDir, 'mipmap-anydpi-v26');
    if (!fs.existsSync(anydpiDir)) {
      fs.mkdirSync(anydpiDir, { recursive: true });
    }

    // Generar iconos para cada densidad
    for (const [mipmapDir, size] of Object.entries(mipmapSizes)) {
      const iconPath = path.join(apkResDir, mipmapDir, 'icon.png');
      
      await sharp(Buffer.from(svg))
        .resize(size, size, { 
          fit: 'contain', 
          background: { r: 127, g: 19, b: 236, alpha: 1 } 
        })
        .png()
        .toFile(iconPath);
      
      console.log(`✓ ${mipmapDir}/icon.png (${size}x${size})`);
    }

    // Crear archivo icon.xml para adaptive icon (Android 8.0+)
    const iconXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/icon_background"/>
    <foreground android:drawable="@mipmap/icon_foreground"/>
</adaptive-icon>`;

    const iconXmlPath = path.join(anydpiDir, 'icon.xml');
    fs.writeFileSync(iconXmlPath, iconXml);
    console.log(`✓ mipmap-anydpi-v26/icon.xml (adaptive icon)`);

    // Crear foreground para adaptive icon (se usa el mismo icono)
    // Los foregrounds deben tener padding de seguridad (20% de cada lado)
    // Creamos versiones con padding para foreground
    for (const [mipmapDir, size] of Object.entries(mipmapSizes)) {
      const foregroundDir = path.join(apkResDir, mipmapDir);
      const foregroundPath = path.join(foregroundDir, 'icon_foreground.png');
      
      // Para adaptive icon, el foreground debe ser más pequeño (60% del tamaño total)
      // con padding alrededor (20% de cada lado = 40% total padding)
      const foregroundSize = Math.round(size * 0.6);
      const padding = (size - foregroundSize) / 2;
      
      // Crear canvas con padding
      await sharp(Buffer.from(svg))
        .resize(foregroundSize, foregroundSize, { 
          fit: 'contain', 
          background: { r: 0, g: 0, b: 0, alpha: 0 } // transparente
        })
        .extend({
          top: Math.round(padding),
          bottom: Math.round(padding),
          left: Math.round(padding),
          right: Math.round(padding),
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .resize(size, size)
        .png()
        .toFile(foregroundPath);
      
      console.log(`✓ ${mipmapDir}/icon_foreground.png (${size}x${size})`);
    }

    // Crear colors.xml con el color de fondo para adaptive icon
    const colorsDir = path.join(apkResDir, 'values');
    if (!fs.existsSync(colorsDir)) {
      fs.mkdirSync(colorsDir, { recursive: true });
    }

    const colorsXmlPath = path.join(colorsDir, 'colors.xml');
    const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="icon_background">#7f13ec</color>
</resources>`;

    // Leer colors.xml existente si existe, o crear nuevo
    if (fs.existsSync(colorsXmlPath)) {
      const existingContent = fs.readFileSync(colorsXmlPath, 'utf8');
      if (!existingContent.includes('icon_background')) {
        // Agregar el color sin eliminar contenido existente
        const updatedContent = existingContent.replace(
          '</resources>',
          '    <color name="icon_background">#7f13ec</color>\n</resources>'
        );
        fs.writeFileSync(colorsXmlPath, updatedContent);
      }
    } else {
      fs.writeFileSync(colorsXmlPath, colorsXml);
    }
    console.log(`✓ values/colors.xml (icon background color)`);

    console.log('\n✅ Todos los iconos Android generados correctamente');
    console.log('\n📱 Iconos creados en:');
    console.log(`   ${apkResDir}`);
    console.log('\n📝 Próximos pasos:');
    console.log('   1. El AndroidManifest.xml ya referencia @mipmap/icon');
    console.log('   2. Compila el APK con Android Studio o Capacitor');
    console.log('   3. Los iconos se mostrarán correctamente en el dispositivo');
    
  } catch (error) {
    console.error('❌ Error generando iconos Android:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

generateAndroidIcons();

#!/usr/bin/env node

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');

// SVG para generar los iconos
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

async function generateIcons() {
  try {
    console.log('📦 Generando iconos PNG válidos...\n');

    // Generar 192x192
    await sharp(Buffer.from(svg))
      .resize(192, 192, { fit: 'contain', background: { r: 127, g: 19, b: 236, alpha: 1 } })
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✓ icon-192.png (192x192)');

    // Generar 512x512
    await sharp(Buffer.from(svg))
      .resize(512, 512, { fit: 'contain', background: { r: 127, g: 19, b: 236, alpha: 1 } })
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✓ icon-512.png (512x512)');

    // Generar maskable 192x192 (sin bordes)
    await sharp(Buffer.from(svg))
      .resize(192, 192, { fit: 'cover' })
      .png()
      .toFile(path.join(publicDir, 'icon-192-maskable.png'));
    console.log('✓ icon-192-maskable.png (192x192)');

    // Generar maskable 512x512 (sin bordes)
    await sharp(Buffer.from(svg))
      .resize(512, 512, { fit: 'cover' })
      .png()
      .toFile(path.join(publicDir, 'icon-512-maskable.png'));
    console.log('✓ icon-512-maskable.png (512x512)');

    console.log('\n✅ Todos los iconos generados correctamente');
  } catch (error) {
    console.error('❌ Error generando iconos:', error.message);
    process.exit(1);
  }
}

generateIcons();

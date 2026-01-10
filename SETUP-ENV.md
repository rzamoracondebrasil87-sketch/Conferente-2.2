# Configuración de Variables de Entorno en Vercel

## Para que la IA funcione:

1. **En Vercel Dashboard:**
   - Ve a tu proyecto Conferente-2.2
   - Settings → Environment Variables
   - Agrega una variable llamada `GEMINI_API_KEY` con el valor: `AIzaSyBq3NYPcsT7OtlyqNcCyf-lRDBe9xOo7-o`

2. **Redeploy:**
   - Luego de agregar la variable, haz trigger a un nuevo build desde el dashboard
   - O simplemente haz `git push` a master para que Vercel rebuild automáticamente

3. **Localmente (desarrollo):**
   - Copia `.env.example` a `.env`
   - Reemplaza `tu_api_key_aqui` con tu API key real
   - Corre `npm run dev` y la IA debería funcionar

## PWA Install Prompt

El botón flotante "Instalar Conferente" debería aparecer cuando:
- Visitas el sitio desde un navegador compatible (Chrome, Edge, Firefox)
- El sitio está servido en HTTPS (Vercel lo es)
- Manifest.json es válido (ya lo es)
- Service Worker está registrado

**Para probar localmente:**
```bash
npm run build
npm run preview
# Luego abre http://localhost:4173 en tu navegador
```

El componente `InstallPrompt.tsx` tiene logging detallado. Abre DevTools → Console para ver si el evento `beforeinstallprompt` se detecta.

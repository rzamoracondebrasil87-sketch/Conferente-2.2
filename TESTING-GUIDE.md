# 🧪 TESTING GUIDE - Verificación Completa

## 1. PWA Installation Testing

### 1.1 Local Testing (npm run preview)

```bash
# Terminal 1
npm run preview

# Opens at http://127.0.0.1:4173
```

### 1.2 Verificar beforeinstallprompt

**En DevTools Console:**
```javascript
// Debería ver estos logs:
// "📱 beforeinstallprompt event received"
// "✅ InstallPrompt: PWA is installable!"

// Si no ve el evento, espere unos segundos después de cargar
// El evento se dispara automáticamente en navegadores compatibles
```

### 1.3 Probar Installation Flow

1. **Abrir app en Chrome/Edge/Samsung**
2. **Esperar 1.5 segundos** - debe aparecer popup "Instalar Conferente"
3. **Click "Instalar Ahora"** - se abre prompt nativo
4. **Confirmar instalación** - app se instala en pantalla principal
5. **Verificar instalación**:
   - Aparece icono en pantalla principal
   - Desde icono, app se abre en modo standalone
   - No hay barra de navegador

### 1.4 Verificar Standalone Mode

**En DevTools Console:**
```javascript
// Cuando app está en standalone mode:
window.matchMedia('(display-mode: standalone)').matches  // true
navigator.standalone  // true (iOS)

// App detectará esto y NO mostrará install prompt de nuevo
```

### 1.5 Verificar 7-Day Cooldown

1. **Instalar la app**
2. **Abrir desde navegador nuevamente** (no desde icono)
3. **No debería ver prompt** (está en cooldown)
4. **Verifica localStorage**:
   ```javascript
   localStorage.getItem('installPromptDismissed')  // Tiene timestamp
   ```

---

## 2. AI Chat Testing

### 2.1 Setup Previo

✅ Verificar que `.env` tiene:
```
GEMINI_API_KEY=AIzaSyBq3NYPcsT7OtlyqNcCyf-lRDBe9xOo7-o
```

✅ Verificar que Vercel tiene env var (si están en producción)

### 2.2 Test Basic Chat

1. **Abrir app en http://127.0.0.1:4173**
2. **Click botón AI Chat** (icono robot)
3. **Ver status**: "Monitorando" ✅
4. **Type mensaje**: "Olá, como você está?"
5. **Verificar**:
   - Mensaje aparece como usuario (derecha, azul)
   - Indicador "Analisando" con puntos
   - Respuesta de Gemini aparece (izquierda, gris)

### 2.3 Test con Datos de Pesaje

1. **Cerrar AI Chat**
2. **Llenar formulario de pesaje**:
   - Proveedor: "Empresa A"
   - Producto: "Caixa de Maçã"
   - Nota: "50"
3. **Pesar algo** (ajustar peso)
4. **Abrir AI Chat nuevamente**
5. **Verificar contexto** en tarjeta de status:
   - Muestra proveedor: "Empresa A"
   - Muestra producto: "Caixa de Maçã"
   - Muestra peso actual vs nota
6. **Click sugestión**: "Analise a pesagem atual"
7. **Verificar respuesta**:
   - Gemini analiza el peso
   - Compara con target
   - Da sugerencias

### 2.4 Test Error Handling

1. **Editar vite.config.ts** temporalmente para API key inválida:
   ```typescript
   __GEMINI_API_KEY__: JSON.stringify('INVALID_KEY_12345')
   ```
2. **npm run build** y **npm run preview**
3. **Abrir AI Chat y enviar mensaje**
4. **Verificar**:
   - Error message clara
   - No crash de app
   - Pueda cerrar drawer

### 2.5 Test Historial de Chat

1. **Enviar 3-4 mensajes diferentes**
2. **Cerrar y reabrir AI Chat**
3. **Verificar**:
   - Historial se limpia (es sesión, no persistente)
   - UI se reinicia
   - Sugestiones predefinidas vuelven

---

## 3. Weighing Workflow Testing

### 3.1 Basic Flow

```
1. Supplier: "Fornecedor A"
2. Product: "Produto B"
3. Target Weight: "10"
4. Gross Weight: "10.5"
5. Auto-calculate Net: "should be 10.5 - tare"
6. Save -> Notification
7. History updated
```

### 3.2 Tare Learning

1. **Primera pesagem**:
   - Producto nuevo
   - Set tare manualmente: "0.2kg"
   - Save
   - Sistema aprende tara = 0.2kg

2. **Segunda pesagem del mismo producto**:
   - Select mismo supplier + product
   - **Tare se auto-aplica** como 0.2kg
   - Verificar que se sugiere automáticamente

3. **Tercera pesagem con proveedor diferente**:
   - Cambiar supplier a "Fornecedor C"
   - Mismo product
   - Sistema debe avisar: "Otra proveedor tiene tara diferente"
   - Opción de usar anterior o nueva

### 3.3 Weight Variance Analysis

**Test Case 1: Underweight**
```
Target: 10kg
Net: 9.5kg
Result: Notificación "Falta de Peso: Faltam 0.50kg"
Color: Red/Orange
```

**Test Case 2: Overweight**
```
Target: 10kg
Net: 10.5kg
Result: Notificación "Sobra de Peso: Sobram 0.50kg"
Color: Warning
```

**Test Case 3: Exact**
```
Target: 10kg
Net: 10.00kg
Result: Notificación "Conferência Exata: Peso exato"
Color: Green/Success
```

### 3.4 Photo Evidence

1. **Click botón foto** (lado derecho)
2. **Permitir acceso a cámara**
3. **Tomar foto** (click botón captura)
4. **Foto debería verse en componente**
5. **Save pesaje** - foto se guarda con registro
6. **Verificar localStorage** - photoData incluido

---

## 4. Notifications Testing

### 4.1 Toast Notifications

**Trigger en diferentes escenarios:**

```javascript
// Falta de datos
- Click Save sin supplier → Toast error
- Click Save sin producto → Toast error
- Click Save sin peso en nota → Toast error

// Success
- Pesaje guardado → Toast success

// Info
- Tara confirmada → Toast info
```

### 4.2 PWA Notifications

**Habilitar notificaciones:**
1. **Abrir app** - browser pide permisos
2. **Click "Allow"**
3. **Complete pesaje** con varianza
4. **Debería ver notificación nativa** del browser:
   - Título: "Conferente"
   - Body: "Falta de Peso: Faltam 0.50kg."
   - Icon: Ícono de app

**Verificar en Settings:**
```
Settings → Notifications → Conferente
Should show: "Bloqueado" o "Permitido"
```

### 4.3 Notification Drawer

1. **Click bell icon** en header
2. **Ver lista de notificaciones recientes**
3. **Click notificación** → navega a view relacionada

---

## 5. History Testing

### 5.1 Save Multiple Records

```
Pesaje 1: Empresa A, Caixa A, 10kg, ✓
Pesaje 2: Empresa A, Caixa A, 9.5kg, ✗
Pesaje 3: Empresa B, Caixa B, 15kg, ✓
Pesaje 4: Empresa B, Caixa B, 15.2kg, ✗
```

### 5.2 View History

1. **Click "Histórico" en footer**
2. **Verificar**:
   - Muestra todos los pesajes
   - Ordenados por reciente primero
   - Muestra varianza con colores
   - Icon de foto si tiene photo

### 5.3 Export/Share

1. **En History, click registro**
2. **Click botón export**
3. **Verificar**:
   - Puede copiar datos
   - Puede compartir por WhatsApp/Email

### 5.4 Search/Filter

1. **Type nombre en search**
2. **Filtra resultados**
3. **Clear search** → todos aparecen nuevamente

---

## 6. Theme Testing

### 6.1 Dark Mode

1. **App abre en dark mode** por defecto
2. **Click settings** → Theme
3. **Cambiar a Light**
4. **Verificar**:
   - Colors cambian
   - localStorage guarda preferencia
   - Recarga app → mantiene light mode

### 6.2 Color Scheme

1. **Settings → Palette**
2. **Cambiar color primario**
3. **Verificar**:
   - Buttons cambian color
   - Links cambian color
   - Highlights cambian

---

## 7. Offline Testing

### 7.1 Service Worker

**En DevTools → Application:**
```
Service Workers
├── /sw.js
│   ├── Status: activated
│   └── Scope: http://127.0.0.1:4173
```

### 7.2 Go Offline

1. **DevTools → Network**
2. **Set "Offline"**
3. **App sigue funcionando**:
   - Puede navegar
   - Puede completar pesaje
   - Puede ver histórico

### 7.3 Network Request Caching

**Verificar que se cachea:**
- HTML (network-first)
- CSS/JS (cache-first)
- Imágenes (cache-first)
- Icons (cache-first)

---

## 8. Browser Compatibility Testing

| Browser | PWA | AI | Offline |
|---------|-----|----|----|
| Chrome | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ |
| Firefox | ⚠️ | ✅ | ✅ |
| Safari | ⚠️ | ✅ | ⚠️ |
| Samsung | ✅ | ✅ | ✅ |

**⚠️ = No PWA support**

---

## 9. Performance Testing

### 9.1 Lighthouse

```bash
# DevTools → Lighthouse
Generate report
Check:
- Performance: > 80
- Accessibility: > 80
- Best Practices: > 80
- PWA: > 80
- SEO: > 80
```

### 9.2 Bundle Size

```
dist/index.html: 11.69 kB (gzip: 3.38 kB)
dist/assets/index.js: 534.25 kB (gzip: 129.53 kB)

Total: ~133 kB gzipped
```

### 9.3 Startup Time

```
Measure:
- Time to Interactive (TTI): < 3s
- First Contentful Paint (FCP): < 1s
- Largest Contentful Paint (LCP): < 2.5s
```

---

## 10. Mobile Testing

### 10.1 Responsiveness

**Test on different sizes:**
- 320px (small phone)
- 375px (iPhone)
- 768px (tablet)
- 1024px (desktop)

**Verificar:**
- Layout se adapta
- Buttons clickeables
- Text legible
- No overflow

### 10.2 Touch Interactions

1. **Tap buttons** - responden bien
2. **Swipe drawers** - abren/cierran
3. **Long press** - copy texto
4. **Double tap** - zoom disabled
5. **Scroll** - smooth

### 10.3 Safe Area

**En iPhone con notch:**
- Header respeta notch
- Footer respeta home indicator
- No hidden content

---

## 11. Data Persistence Testing

### 11.1 localStorage Verification

```javascript
// En DevTools → Application → Local Storage

// Debe contener:
conferente_name = "Conferente"
conferente_photo = "[base64 image data]"
conferente_tare_data = "[JSON learning data]"
conferente_history = "[JSON records]"
appInstalled = "true"
installPromptDismissed = "[timestamp]"
theme_palette = "refined"
theme_mode = "dark"
```

### 11.2 Data Sync Across Tabs

1. **Abrir app en Tab A**
2. **Abrir app en Tab B**
3. **Hacer pesaje en Tab A**
4. **Switch a Tab B**
5. **Recargar**
6. **Verificar** que ve el nuevo pesaje

---

## 12. Error Scenarios Testing

### 12.1 Network Error

```javascript
// En DevTools console
window.navigator.onLine = false;  // Simular offline

// Enviar mensaje AI
// Debe mostrar error y permitir retry
```

### 12.2 Invalid API Key

```typescript
// Editar vite.config.ts
__GEMINI_API_KEY__: JSON.stringify('INVALID')

// npm run build && npm run preview
// AI Chat debe mostrar error claro
```

### 12.3 Large Photo

```javascript
// Tomar foto múltiples veces
// Verificar que localStorage no excede límite (5-10MB típico)
```

---

## 📋 Checklist Final

```
PWA
☐ beforeinstallprompt appears after 1.5s
☐ Installation works
☐ App appears on home screen
☐ Launches in standalone mode
☐ No prompt on subsequent launches
☐ Service Worker activated

AI Chat
☐ Gemini API responds
☐ Context data shows correctly
☐ Error handling works
☐ Multiple messages work
☐ Chat history clear on close

Weighing
☐ Tare calculation correct
☐ Tare learning works
☐ Weight variance detection works
☐ Notifications trigger correctly
☐ Photos save with record

History
☐ Records save and persist
☐ Filtering works
☐ Search works
☐ Export works

Notifications
☐ Toast messages appear
☐ PWA notifications work
☐ Notification drawer works
☐ Click notification navigates

Theme
☐ Dark mode works
☐ Light mode works
☐ Color palette changes
☐ Preference persists

Offline
☐ App works offline
☐ Service Worker cached content
☐ Data syncs when back online

Performance
☐ Lighthouse score > 80
☐ TTI < 3s
☐ No console errors
☐ Bundle size acceptable
```

---

## 🚀 Deployment Testing (Vercel)

1. **Push to GitHub master**
2. **Vercel deploys automatically**
3. **Visit production URL**
4. **Run all tests above** in production
5. **Verify**:
   - PWA works with HTTPS
   - All notifications work
   - AI Chat works
   - Offline mode works

---

*Todos los tests deben pasar antes de considerar la app como lista para producción.*

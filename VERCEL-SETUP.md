# 🚀 Guía Rápida: Subir a GitHub y Desplegar en Vercel

Tu código está listo en Git. Sigue estos pasos:

## PASO 1: Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre: `conferente-2.2`
3. Descripción: `PWA inteligente con Gemini API`
4. Selecciona **Public** (para que Vercel pueda acceder)
5. Haz clic en "Create repository"
6. **NO** inicialices con README (ya lo tenemos)

## PASO 2: Conectar tu repositorio local a GitHub

Copia y ejecuta esto en PowerShell (en la carpeta del proyecto):

```powershell
cd e:\conferente-2.2

# Renombrar rama a 'main'
git branch -M main

# Agregar URL remota (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/conferente-2.2.git

# Subir el código
git push -u origin main
```

**Ejemplo real:**
```powershell
git remote add origin https://github.com/juanperez/conferente-2.2.git
git push -u origin main
```

## PASO 3: Conectar Vercel

1. Ve a https://vercel.com/dashboard
2. Haz clic en "Add New..." → "Project"
3. Haz clic en "Continue with GitHub"
4. Autoriza Vercel a acceder a GitHub
5. Busca y selecciona `conferente-2.2`
6. Haz clic en "Import"

## PASO 4: Configurar Variables de Entorno

En la pantalla de importación:

1. Busca "Environment Variables"
2. Agrega:
   ```
   Name: GEMINI_API_KEY
   Value: AIzaSyBq3NYPcsT7OtlyqNcCyf-lRDBe9xOo7-o
   ```
3. Haz clic en "Deploy"

## ✅ ¡Listo!

Vercel desplegará automáticamente. Tu PWA estará disponible en:
```
https://conferente-2-2.vercel.app
```

(El nombre exacto depende de tu usuario en GitHub)

## 📱 Instalar en móvil

1. Abre el link en Chrome/Firefox mobile
2. Toca "Instalar" 
3. ¡La app estará en tu pantalla de inicio!

## 🔄 Actualizaciones futuras

Cada vez que hagas cambios:
```powershell
git add .
git commit -m "Tu mensaje"
git push origin main
```

Vercel se desplegará automáticamente. ¡Magia! ✨

---

**Nota:** Si necesitas cambiar la API key después:
- Vercel Dashboard → Configuración del Proyecto → Environment Variables
- Edita `GEMINI_API_KEY`
- Vuelve a desplegar

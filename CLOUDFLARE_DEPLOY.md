# 🚀 Guía de Despliegue en Cloudflare

Esta guía te explica paso a paso cómo publicar tu app Runna.io en Cloudflare (¡gratis para siempre!).

---

## 📋 Requisitos Previos

1. **Cuenta de Cloudflare** (gratis): https://dash.cloudflare.com/sign-up
2. **Cuenta de Neon** (gratis): https://neon.tech - Para la base de datos
3. **Node.js** instalado en tu computadora: https://nodejs.org

---

## 📦 Si Descargaste el ZIP

Si descargaste el proyecto como ZIP desde Replit:

```bash
# 1. Descomprime el archivo
unzip runna-io.zip
cd runna-io

# 2. Instala las dependencias
npm install

# 3. Continúa con el Paso 1 de esta guía
```

---

## 🗄️ Configurar Base de Datos Neon (si no la tienes)

1. Ve a https://neon.tech y crea una cuenta gratis
2. Crea un nuevo proyecto
3. Copia el "Connection string" que te dan (se ve así):
   ```
   postgresql://usuario:contraseña@ep-xxx.region.neon.tech/neondb
   ```
4. Guárdalo, lo necesitarás en el Paso 3

---

## 🔧 Paso 1: Instalar Wrangler

Wrangler es la herramienta de Cloudflare para desplegar Workers.

```bash
npm install -g wrangler
```

---

## 🔐 Paso 2: Iniciar Sesión en Cloudflare

```bash
wrangler login
```

Se abrirá tu navegador. Autoriza la aplicación.

---

## 🗄️ Paso 3: Configurar la Base de Datos

Tu DATABASE_URL de Neon debe configurarse como "secret" (variable segura):

```bash
wrangler secret put DATABASE_URL
```

Cuando te lo pida, pega tu URL de Neon que se ve así:
```
postgresql://usuario:contraseña@host.neon.tech/basededatos
```

---

## 🏃 Paso 3.5: Configurar Strava (Opcional)

Si quieres integrar Strava para importar actividades automaticamente:

### A. Configura los secrets de Strava:
```bash
wrangler secret put STRAVA_CLIENT_ID
# Ingresa tu Client ID de Strava (ejemplo: 190184)

wrangler secret put STRAVA_CLIENT_SECRET
# Ingresa tu Client Secret de Strava

wrangler secret put STRAVA_WEBHOOK_VERIFY_TOKEN
# Crea cualquier string aleatorio (ejemplo: mi_token_secreto_2024)

wrangler secret put STRAVA_REDIRECT_URI
# Ingresa: https://runna-io-api.TU-USUARIO.workers.dev/api/strava/callback
```

### B. Configura tu app en Strava:
1. Ve a https://www.strava.com/settings/api
2. En "Authorization Callback Domain" pon: `runna-io-api.TU-USUARIO.workers.dev`

### C. Registra el webhook (despues de desplegar el Worker):
```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -d client_id=TU_CLIENT_ID \
  -d client_secret=TU_CLIENT_SECRET \
  -d callback_url=https://runna-io-api.TU-USUARIO.workers.dev/api/strava/webhook \
  -d verify_token=TU_WEBHOOK_VERIFY_TOKEN
```

---

## 🚀 Paso 4: Desplegar el Backend (Worker)

```bash
npm run worker:deploy
# o si no tienes el script:
wrangler deploy
```

Tu API estará disponible en:
```
https://runna-io-api.tu-usuario.workers.dev
```

---

## 🌐 Paso 5: Desplegar el Frontend (Pages)

### Opción A: Desde la línea de comandos

```bash
# Construir el frontend
npm run pages:build
# o: vite build --outDir dist/pages

# Desplegar a Pages
wrangler pages deploy dist/pages
```

### Opción B: Conectar con GitHub (recomendado)

1. Sube tu código a GitHub
2. Ve a https://dash.cloudflare.com → Pages
3. Haz clic en "Create a project" → "Connect to Git"
4. Selecciona tu repositorio
5. Configura:
   - **Build command:** `npm run pages:build`
   - **Build output directory:** `dist/pages`
6. ¡Listo! Cada push a main = deploy automático

---

## 🔗 Paso 6: Conectar Frontend con Backend

Actualiza la URL de la API en tu frontend. En `client/src/lib/queryClient.ts` o donde hagas las llamadas API:

```typescript
const API_URL = import.meta.env.PROD 
  ? 'https://runna-io-api.tu-usuario.workers.dev'
  : '';
```

---

## 📱 Paso 7: Compartir con Amigos

Tu app estará disponible en:
- **Dominio gratuito:** `runna-io.pages.dev`
- **O configura tu dominio:** Cloudflare Dashboard → Pages → Custom Domains

### Instalar como App (PWA)
Tus amigos pueden "instalar" la app:
1. Abrir la URL en el navegador del móvil
2. En Chrome/Safari, buscar "Añadir a pantalla de inicio"
3. ¡Listo! Tendrán un icono como app nativa

---

## 💰 Costos (Todo Gratis)

| Servicio | Límite Gratuito |
|----------|-----------------|
| Cloudflare Workers | 100,000 requests/día |
| Cloudflare Pages | Ilimitado |
| Neon PostgreSQL | 3 proyectos, 10GB |
| Dominio .pages.dev | Gratis |

---

## 🛠️ Desarrollo Local

Para probar cambios antes de desplegar:

```bash
# Backend (Worker)
npm run worker:dev
# API disponible en http://localhost:8787

# Frontend (Vite)
npm run dev
# App disponible en http://localhost:5000
```

---

## 📂 Estructura del Proyecto

```
runna-io/
├── client/           # Frontend (React + Vite)
│   ├── public/
│   │   ├── manifest.json    # PWA config
│   │   └── service-worker.js
│   └── src/
├── worker/           # Backend (Cloudflare Workers + Hono)
│   └── src/
│       ├── index.ts  # Entry point
│       ├── routes.ts # API endpoints
│       └── storage.ts
├── shared/           # Código compartido
│   └── schema.ts     # Drizzle ORM
└── wrangler.toml     # Config Cloudflare
```

---

## ❓ Problemas Comunes

### "wrangler: command not found"
```bash
npm install -g wrangler
```

### "Error de base de datos"
Verifica que configuraste el secret:
```bash
wrangler secret list
# Debe mostrar DATABASE_URL
```

### "CORS error"
El Worker ya tiene CORS configurado. Si hay problemas, verifica la URL de la API en el frontend.

---

¡Eso es todo! 🎉 Tu app está lista para conquistar ciudades.

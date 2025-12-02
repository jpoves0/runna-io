# Runna.io 🏃‍♂️

**Progressive Web App móvil de conquista territorial basada en rutas de running**

Runna.io es una aplicación competitiva donde corres para conquistar territorio en tu ciudad. Compite con tus amigos por dominar el mayor área posible. Cuando corres sobre el territorio de un amigo, ¡lo reconquistas!

## 🌟 Características

- 🗺️ **Mapa interactivo** con territorios conquistados visualizados por colores
- 📍 **Tracking GPS en tiempo real** para registrar tus rutas
- 🏆 **Sistema de rankings** por metros cuadrados conquistados
- ⚔️ **Sistema de reconquista** - corre sobre territorios de amigos para conquistarlos
- 👥 **Gestión de amigos** para competir en grupo
- 📱 **PWA instalable** - úsala como app nativa en tu móvil
- 🎨 **Interfaz optimizada para móvil** con diseño moderno

## 📋 Requisitos Previos

- **Node.js** 20.x o superior
- **PostgreSQL** (Neon Database o local)
- **npm** (incluido con Node.js)

## 🚀 Instalación y Ejecución Local

### 1. Descargar el Proyecto

Si tienes el proyecto en Replit, descárgalo como ZIP:
- En Replit, haz clic en los tres puntos (⋯) → **Download as zip**
- Descomprime el archivo en tu ordenador

O clona desde GitHub (si está disponible):
```bash
git clone <url-del-repositorio>
cd runna-io
```

### 2. Instalar Dependencias

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

### 3. Configurar Base de Datos

**Opción A: Usar Neon Database (Recomendado - Gratis)**

1. Crea una cuenta gratis en [Neon](https://neon.tech)
2. Crea un nuevo proyecto
3. Copia la cadena de conexión (DATABASE_URL)
4. Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL=postgresql://usuario:password@host/database?sslmode=require
```

**Opción B: PostgreSQL Local**

1. Instala PostgreSQL en tu ordenador
2. Crea una base de datos:
```bash
createdb runna_db
```
3. Crea un archivo `.env`:
```env
DATABASE_URL=postgresql://localhost:5432/runna_db
```

### 4. Migrar Base de Datos

Ejecuta las migraciones para crear las tablas:

```bash
npm run db:push
```

### 5. Iniciar la Aplicación

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:5000**

### 6. Crear Datos de Prueba (Opcional)

Para probar la app con usuarios de demostración, abre otra terminal y ejecuta:

```bash
curl -X POST http://localhost:5000/api/seed -H "Content-Type: application/json"
```

Esto creará 5 usuarios de prueba y relaciones de amistad.

## 📱 Instalar como PWA en Móvil

1. Abre la app en el navegador de tu móvil
2. **En iOS (Safari)**: Toca el botón de compartir → "Añadir a pantalla de inicio"
3. **En Android (Chrome)**: Toca los tres puntos → "Instalar aplicación" o "Añadir a pantalla de inicio"

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila el proyecto para producción
- `npm run db:push` - Sincroniza el schema de base de datos
- `npm run db:studio` - Abre Drizzle Studio para ver la base de datos

## 🌐 Subir a GitHub

### Método 1: Desde Replit (Recomendado)

1. En Replit, abre el panel de **Tools** (Herramientas)
2. Haz clic en `+` y selecciona **Git**
3. Crea un nuevo repositorio en [GitHub](https://github.com/new)
4. En el panel Git de Replit:
   - Haz clic en "Connect to GitHub"
   - Autoriza Replit
   - Selecciona tu repositorio
5. Haz commit de tus cambios y push

### Método 2: Desde Terminal Local

```bash
# Inicializar repositorio Git
git init

# Añadir archivos
git add .
git commit -m "Initial commit: Runna.io MVP"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/tu-usuario/runna-io.git
git branch -M main
git push -u origin main
```

**IMPORTANTE**: Antes de subir a GitHub, crea un archivo `.gitignore`:

```
node_modules/
.env
.replit
.upm
replit.nix
*.log
.DS_Store
dist/
```

## 📂 Estructura del Proyecto

```
runna-io/
├── client/                 # Frontend (React + Vite)
│   ├── public/            # Archivos estáticos
│   │   └── manifest.json  # PWA manifest
│   └── src/
│       ├── components/    # Componentes React
│       ├── pages/         # Páginas de la app
│       ├── lib/           # Utilidades
│       └── App.tsx        # Componente principal
├── server/                # Backend (Express)
│   ├── db.ts             # Conexión a base de datos
│   ├── storage.ts        # Capa de datos
│   ├── routes.ts         # API endpoints
│   └── seed.ts           # Datos de prueba
├── shared/               # Código compartido
│   ├── schema.ts         # Modelos de datos (Drizzle)
│   └── colors.ts         # Utilidades compartidas
└── package.json          # Dependencias
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React** - Framework UI
- **TypeScript** - Lenguaje
- **Vite** - Build tool
- **TailwindCSS** - Estilos
- **shadcn/ui** - Componentes UI
- **Leaflet** - Mapas interactivos
- **TanStack Query** - Gestión de estado/datos

### Backend
- **Express.js** - Servidor HTTP
- **Drizzle ORM** - ORM para PostgreSQL
- **Neon Database** - PostgreSQL serverless
- **Turf.js** - Cálculos geoespaciales
- **Zod** - Validación de datos

## 🎯 Próximas Características (Roadmap)

- [ ] Integración con API de Strava OAuth
- [ ] Integración con Garmin Connect
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Notificaciones push cuando reconquistan tu territorio
- [ ] Exportar a app nativa con React Native
- [ ] Sistema de logros y badges
- [ ] Estadísticas avanzadas (velocidad, elevación)

## 🤝 Contribuir

¿Quieres mejorar Runna.io? ¡Las contribuciones son bienvenidas!

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT.

## 🐛 Problemas Conocidos

- El tracking GPS requiere que el navegador tenga permisos de ubicación
- Funciona mejor en navegadores modernos (Chrome, Safari, Firefox)
- La precisión del GPS puede variar según el dispositivo

## 📞 Soporte

¿Tienes preguntas o problemas?
- Abre un [Issue en GitHub](https://github.com/tu-usuario/runna-io/issues)
- Contacta: [tu-email@ejemplo.com]

---

**¡Disfruta conquistando territorio! 🏃‍♂️🗺️**

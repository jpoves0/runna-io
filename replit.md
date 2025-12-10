# Runna.io

## Overview

Runna.io is a mobile-first Progressive Web App (PWA) for territory conquest through running. Users track GPS routes while running, which creates territory polygons on a map. The app features competitive elements where friends can "reconquer" each other's territories by running through them. Built with a React frontend, Express/Hono backend, and PostgreSQL database using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Maps**: Leaflet.js for interactive map rendering
- **Geospatial**: Turf.js for geometry calculations (territory polygons, area calculations)
- **PWA**: Service worker with caching, manifest.json for installability

### Backend Architecture
- **Primary Server**: Express.js with TypeScript running on Node.js
- **Alternative Deployment**: Hono framework for Cloudflare Workers (in `/worker` directory)
- **API Pattern**: RESTful JSON API at `/api/*` endpoints
- **Database ORM**: Drizzle ORM with PostgreSQL dialect

### Data Storage
- **Database**: PostgreSQL via Neon (serverless Postgres)
- **Connection**: `@neondatabase/serverless` with WebSocket support
- **Schema Location**: `shared/schema.ts` - shared between frontend and backend
- **Key Tables**:
  - `users` - Player profiles with color and total conquered area
  - `routes` - GPS coordinate arrays with distance/duration
  - `territories` - GeoJSON polygons linked to routes
  - `friendships` - User-to-user connections for competition

### Key Design Decisions

1. **Shared Schema**: TypeScript types and Drizzle schema in `/shared` directory enables type safety across client and server

2. **Mobile-First PWA**: Designed as installable mobile app with service worker caching, bottom navigation, and touch-optimized UI

3. **Territory as Polygon**: Running routes are converted to buffered polygons using Turf.js, stored as GeoJSON in the database

4. **Dual Deployment Options**: Express for Node.js hosting, Hono worker for Cloudflare edge deployment - both share the same schema and storage patterns

5. **Real-time GPS Tracking**: Browser Geolocation API with `watchPosition` for continuous route recording during runs

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless Postgres database, connected via `DATABASE_URL` environment variable

### Frontend Libraries
- **Leaflet**: Map tiles from CartoDB Positron (light theme)
- **Google Fonts**: Inter font family for typography

### Build Tools
- **Vite**: Frontend bundler with React plugin
- **esbuild**: Server bundling for production
- **Drizzle Kit**: Database migrations with `db:push` command

### Cloudflare Deployment (Optional)
- Wrangler CLI for Workers deployment
- Database URL stored as Cloudflare secret
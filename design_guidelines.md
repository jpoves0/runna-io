# Runna.io Design Guidelines

## Design Approach
**Reference-Based Approach** drawing inspiration from:
- **Strava**: Activity tracking UI patterns and social features
- **Pokemon GO**: Territory/area control gamification
- **Nike Run Club**: Achievement-focused motivation design
- **Spotify**: Social competitive elements and friend systems

### Key Design Principles
1. Map-first interface - territory visualization is primary
2. Instant gratification through visual conquest feedback
3. Competitive energy through bold visual hierarchy
4. Mobile-gesture optimized interactions

## Typography System
- **Primary Font**: Inter or SF Pro (via Google Fonts CDN)
- **Hierarchy**:
  - Hero stats: text-4xl to text-6xl, font-bold
  - Section headers: text-2xl to text-3xl, font-semibold
  - Map labels/overlays: text-lg, font-medium
  - Body/rankings: text-base, font-normal
  - Micro-data (m²): text-sm, font-medium

## Layout & Spacing
**Tailwind Spacing Primitives**: 2, 4, 6, 8, 12, 16 units
- Component padding: p-4 (mobile), p-6 (desktop)
- Section spacing: space-y-6 to space-y-8
- Card gaps: gap-4
- Map overlays: inset spacing of 4-6 units

**Mobile-First Grid**:
- Single column stack on mobile (grid-cols-1)
- Rankings/stats: max 2 columns on tablet (md:grid-cols-2)
- Never exceed 2-column layouts given mobile focus

## Core Components

### 1. Map Interface (Primary Screen)
- **Full-viewport map** (h-screen) with Leaflet.js/Mapbox
- **Floating overlay controls** positioned absolutely:
  - Top: User stats card (conquered area, rank)
  - Bottom: Quick action buttons (Start Run, View Friends)
- **Territory polygons**: Rendered with distinct stroke patterns per user
- **Zoom controls**: Large touch targets (min 44x44px)

### 2. Stats Dashboard Overlay
**Glass morphism card** floating over map:
- Semi-transparent backdrop
- Rounded corners (rounded-2xl)
- **Content structure**:
  - Large number display for personal m² (text-5xl)
  - Rank indicator badge
  - Small trend indicator (↑ 12% this week)
- Compact height (h-32 to h-40)

### 3. Rankings Table
**Leaderboard design** (full-screen modal or bottom sheet):
- **Row structure**:
  - Rank number (w-12, text-xl)
  - User avatar (w-10 h-10, rounded-full)
  - Name (flex-1, truncate)
  - Conquered area in m² (text-lg, font-semibold)
- **Visual enhancements**:
  - Top 3 users: larger avatars, badge icons
  - Current user row: highlighted with subtle border
  - Alternating row spacing for readability
- Sticky header on scroll

### 4. Route Tracking Interface
**Active run screen** replacing map view:
- **Top section**: Live stats (time-4, distance-4, pace-4 in grid-cols-3)
- **Middle**: Simplified map showing current route path
- **Bottom**: Large pause/stop button (h-16, w-full)
- Pulsing indicators for active tracking state

### 5. Territory Conquest Notifications
**Toast/slide-in cards** appearing after route completion:
- Animation from bottom or top
- **Content**: "You conquered 450m² from @username!"
- Icon + text + area gained/lost
- Auto-dismiss after 4s, swipeable
- Stack multiple notifications (max 3 visible)

### 6. Friends/Social Screen
**Card-based layout**:
- Search bar (h-12, rounded-full)
- Friend cards (h-20):
  - Avatar + name + current rank
  - Quick "View Territory" button
  - Conquered area badge
- Grid layout: grid-cols-1 md:grid-cols-2
- Gap-4 between cards

### 7. Bottom Navigation
**Fixed navigation bar**:
- 4 main tabs: Map, Rankings, Activity, Profile
- Icon + label format
- Active state: distinct visual weight (font-semibold)
- Height: h-16
- Icons from Heroicons

### 8. Onboarding Flow
**Full-screen slides** (for PWA first use):
- Each slide: single focused message + illustration placeholder
- Large headline (text-3xl)
- 2-3 sentences max (text-lg)
- Primary CTA button (h-12, w-full, rounded-xl)
- Progress dots at bottom
- Swipeable gesture navigation

## Interaction Patterns
- **Map interactions**: Pinch-to-zoom, double-tap zoom, pan gestures
- **Swipe gestures**: Dismiss notifications, navigate between screens
- **Pull-to-refresh**: On rankings and activity feed
- **Haptic feedback**: On territory conquest (if supported)

## Icon Library
**Heroicons** (solid/outline variants via CDN):
- Map: MapIcon
- Trophy: TrophyIcon
- User group: UsersIcon
- Play/Pause: PlayIcon, PauseIcon
- Location: MapPinIcon

## Accessibility
- All touch targets: min 44x44px
- Map zoom buttons: clear labels, high contrast
- Rankings: semantic table structure with proper headers
- Form inputs: consistent focus states (ring-2, ring-offset-2)
- Notification announcements for screen readers

## PWA Specific
- **Install prompt**: Slide-up card with clear CTA
- **Offline state**: "No connection" banner at top (h-10)
- **Loading states**: Skeleton screens for map/rankings while data loads
- **App icon**: 192x192 and 512x512 for manifest

## Performance Considerations
- Map tiles: Progressive loading with placeholders
- Territory polygon rendering: Simplify geometries for smooth pan/zoom
- Rankings: Virtual scrolling for long lists (if 50+ users)
- Images: Lazy load user avatars below fold

This design creates a competitive, gamified experience optimized for mobile gestures and quick glances, with the map serving as the hero element throughout the app.
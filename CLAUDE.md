# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**4Roscher** is a household management web application built for mobile-first usage, designed to help roommates coordinate shared apartment activities like shopping, cleaning, plant care, and finances.

**Live URL**: The app is deployed on Railway at the production URL provided in the Railway dashboard.

## Development Commands

- **Run development server**: `npm run dev` - Starts both Express backend and Vite frontend on port 3000
- **Build for production**: `npm run build` - Builds frontend with Vite and bundles backend with esbuild
- **Start production server**: `npm run start` - Runs the production build
- **Type checking**: `npm run check` - Runs TypeScript type checking
- **Database migrations**: `npm run db:push` - Pushes database schema changes using Drizzle
- **Database seeding**: `npm run db:seed` - Seeds database with initial data (users, rooms, plants, etc.)

## Architecture Overview

**4Roscher** is a full-stack household management application with React frontend and Express backend, optimized for mobile devices and real-time collaboration.

### Tech Stack
- **Frontend**: React 18 with TypeScript, Vite, Wouter (routing), TanStack Query, Tailwind CSS
- **Backend**: Express.js with TypeScript, Drizzle ORM, WebSocket server
- **Database**: Supabase PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI primitives with shadcn/ui patterns
- **State Management**: TanStack Query for server state, local React state for UI
- **Real-time**: WebSocket + Polling hybrid for live updates

### Project Structure

```
/client/src/
├── pages/         # Page components (dashboard, finances, shopping, etc.)
├── components/    # Reusable UI components
│   ├── ui/       # Base UI components (shadcn/ui pattern)
│   ├── forms/    # Form components for various features
│   └── layout/   # Layout components (mobile-layout, navigation)
├── hooks/        # Custom React hooks
├── lib/          # Utilities and constants
└── services/     # Service layers (notification-service)

/server/
├── index.ts           # Express server entry point
├── routes.ts          # API route definitions with WebSocket notifications
├── storage.ts         # Storage abstraction layer (MemStorage fallback)
├── drizzle-storage.ts # Supabase/PostgreSQL storage implementation
├── websocket.ts       # WebSocket server for live updates
├── seed.ts            # Database seeding script
└── vite.ts            # Vite dev server integration

/shared/
└── schema.ts     # Shared database schema and types using Drizzle
```

### Key Architectural Patterns

1. **Mobile-First Design**: All UI components are optimized for mobile devices with a bottom navigation bar and floating action buttons.

2. **Type Safety**: Full TypeScript coverage with shared types between frontend and backend via `/shared/schema.ts`.

3. **Storage Abstraction**: The backend uses an `IStorage` interface allowing easy swapping between database (DrizzleStorage) and in-memory (MemStorage) implementations.

4. **API Structure**: RESTful API endpoints under `/api/` prefix with consistent patterns:
   - GET for fetching data
   - POST for creating resources
   - PATCH for updates
   - DELETE for removal

5. **Component Organization**: UI components follow shadcn/ui patterns with Radix UI primitives for accessibility.

6. **Feature Modules**: Each major feature (shopping, finances, plants, cleaning, inventory) has its own page component and associated modals.

### Database Schema

The application manages several entities:
- **Users**: Household members (Alex and Maya by default)
- **Shopping**: Lists and items with assignment tracking
- **Finances**: Transactions with split calculations and long-term purchases
- **Cleaning**: Room cleaning schedules and tracking
- **Plants**: Plant care schedules with watering tracking
- **Inventory**: Household supply tracking with low-stock alerts
- **Activities**: Activity log for all user actions

### Development Notes

- The app runs on a single port (default 3000) serving both API and client
- In development, Vite middleware handles hot module replacement
- Receipt scanning supports PDF processing server-side and image processing client-side using Tesseract.js
- Push notifications are implemented via service workers
- Path aliases configured: `@/` for client/src, `@shared/` for shared code

### Environment Requirements

- **DATABASE_URL**: Required for PostgreSQL connection (Drizzle)
- **PORT**: Server port (defaults to 3000)
- **NODE_ENV**: Set to 'development' or 'production'
- **SUPABASE_URL**: Supabase project URL (for client-side features)
- **SUPABASE_ANON_KEY**: Supabase anonymous key (for client-side features)
- **SUPABASE_SERVICE_ROLE_KEY**: Supabase service role key (server-side only)

## Supabase Setup

The application now uses Supabase for persistent storage with real-time capabilities.

### Initial Setup

1. **Create `.env` file** with Supabase credentials (see `.env.example`)
2. **Push database schema**: `npm run db:push`
3. **Seed initial data**: `npm run db:seed`

### Storage Implementation

- Uses `DrizzleStorage` when `DATABASE_URL` is present
- Falls back to `MemStorage` for local development without database
- Storage implementation is in `/server/drizzle-storage.ts`

### Real-time Features

The app uses a hybrid approach for live updates:

1. **Automatic Polling**: React Query refetches data every 5 seconds
2. **WebSocket Notifications**: Instant updates when users make changes
3. **Toast Notifications**: User-friendly notifications for important updates

**How it works:**
- WebSocket server broadcasts updates on `/ws` endpoint
- Client automatically connects via `useWebSocket` hook
- When data changes, server notifies all connected clients to refetch
- Fallback polling ensures data stays fresh even if WebSocket fails

**Live Update Features:**
- Shopping items added/completed
- Plants watered
- Rooms cleaned
- Inventory updates
- Dashboard automatically refreshes

### Database Commands

- `npm run db:push` - Push schema changes to Supabase
- `npm run db:seed` - Seed database with initial data

## Deployment

The application is deployed on Railway with automatic GitHub integration:

### Production Deployment
- **Platform**: Railway
- **Build**: Automatic on GitHub push to main branch
- **Environment**: Node.js 20 with Nixpacks builder
- **Database**: Supabase PostgreSQL (persistent)
- **WebSocket**: Full support for real-time features
- **SSL**: Automatic HTTPS certificate

### Deployment Process
1. Push code to GitHub repository
2. Railway automatically detects changes
3. Builds with `npm ci --include=dev && npm run build`
4. Starts with `npm run start`
5. Health monitoring via `/api/health` endpoint

### Production Configuration
- All environment variables set in Railway dashboard
- Static files served from `dist/public/`
- WebSocket server on `/ws` path
- Auto-restart on failures with exponential backoff

## Key Features

- **Real-time Collaboration**: WebSocket + polling for instant updates
- **Mobile PWA**: Can be installed on home screens
- **Receipt Scanning**: PDF and image OCR using Tesseract.js
- **Push Notifications**: Service worker integration
- **Offline Capability**: Service worker caching
- **Multi-user**: User switching between household members
- **Responsive Design**: Mobile-first with desktop support
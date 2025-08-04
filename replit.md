# RoomMate App

## Overview

RoomMate is a comprehensive shared apartment management application designed for two roommates (Alex and Maya) to coordinate their daily living activities. The app provides five main functional areas: shopping management, financial tracking with OCR receipt scanning, cleaning schedules, plant care, and a dashboard for daily task overview. Built as a full-stack web application with mobile-first design principles, it uses modern web technologies to facilitate seamless roommate coordination and household management.

## Key Features Implemented

### 📱 Mobile-First Design
- Bottom navigation with 5 main sections
- Expandable floating action buttons for quick actions
- Dark/light mode support with theme switching
- Touch-optimized interface with proper spacing

### 🛒 Shopping Management
- Active shopping list with item management
- Add items with cost estimates and assignments
- Mark items as completed
- Long-term purchase planning with cost splitting

### 💰 Financial Tracking with OCR
- **Receipt Scanning**: Upload PDF receipts for automatic text extraction
- **Smart Categorization**: Swipe-based UI to categorize expenses as "Me", "Roommate", or "Shared"
- **Automatic Expense Splitting**: Shared items automatically split 50/50 between roommates
- **Balance Tracking**: Real-time balance calculations showing who owes whom
- **Transaction History**: Complete record of all expenses with timestamps

### 🧽 Cleaning Management
- Room-based cleaning schedules with frequency settings
- Visual progress indicators showing cleaning status
- Overdue tracking with color-coded alerts
- One-click marking of rooms as cleaned

### 🌱 Plant Care
- Individual plant profiles with watering schedules
- Status tracking (due today, overdue, good condition)
- Quick watering actions with user attribution
- Visual status badges for easy identification

### 📊 Dashboard Overview
- Current financial balance summary
- Urgent tasks requiring immediate attention
- Recent activity feed
- Quick navigation to action items

### 🔔 Push Notifications
- **Service Worker Implementation**: Comprehensive service worker with caching and notification support
- **Notification Permissions**: Settings page with permission management and test functionality
- **Real-time Alerts**: Notifications for cleaning completion, plant watering, and expense additions
- **PWA Manifest**: Full Progressive Web App configuration with app icons
- **Developer Mode**: Toggle to show test notification buttons on cleaning and plant pages

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack React Query for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Mobile Layout**: Custom mobile-first layout with bottom navigation and floating action button
- **Theme System**: Dark/light mode support with CSS variables and theme switching

### Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API endpoints with JSON responses
- **Development Setup**: Vite middleware integration for development with hot module replacement

### Data Storage Solutions
- **Database**: PostgreSQL (configured for Neon Database)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon Database serverless PostgreSQL with connection pooling

### Authentication and Authorization
- **Current State**: No authentication system implemented (hardcoded users Alex and Maya)
- **User Switching**: Frontend-only user switching mechanism without backend validation
- **Security**: No current security measures (intended for trusted roommate environment)

### Mobile-First Design
- **Responsive Design**: Tailwind CSS with mobile breakpoint optimizations
- **Navigation**: Bottom tab navigation for mobile devices
- **Layout**: Custom mobile layout component with header, main content area, and floating action button
- **Touch Interactions**: Optimized for touch interfaces with appropriate button sizes and spacing

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **Connection**: @neondatabase/serverless for database connectivity

### File Storage (Configured but not actively used)
- **Google Cloud Storage**: Configured for file uploads and storage
- **Uppy**: File upload widget system with AWS S3 and GCS support

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Radix UI**: Headless UI components for accessibility and functionality
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Fast build tool and development server
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer

### Core Libraries
- **React Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation for API requests and responses
- **Date-fns**: Date manipulation and formatting utilities

### Replit Integration
- **Replit Vite Plugins**: Development environment integration with error overlay and cartographer
- **Development Banner**: Automatic development environment detection and banner display
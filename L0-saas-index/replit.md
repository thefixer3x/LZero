# L0 Landing Page

## Overview

This is a Next.js 15 marketing landing page for L0, an enterprise edge AI reasoning infrastructure product. The site showcases L0's capabilities including zero-latency on-device AI, persistent memory services, offline-first operation, and enterprise-grade security features. The application is a static marketing site with no backend or database requirements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Framework
- **Next.js 15** with App Router for server-side rendering and static generation
- **React Server Components (RSC)** enabled for optimal performance
- **TypeScript** for type safety throughout the codebase

### Styling Architecture
- **Tailwind CSS** with custom configuration for theming
- **CSS Variables** for dynamic color schemes supporting light/dark modes
- **shadcn/ui** component library built on Radix UI primitives
- Custom primary color: `#2465ED` (blue)

### Component Structure
- `/app` - Next.js App Router pages and layouts
- `/components` - Reusable React components
- `/components/ui` - shadcn/ui primitives (buttons, cards, dialogs, etc.)
- `/hooks` - Custom React hooks (mobile detection, toast notifications)
- `/lib` - Utility functions

### Animation & Interactivity
- **Framer Motion** for animations (spotlight effects, feature cards)
- Custom animated components: typing prompt input, frosted glass icons, spotlight effects
- Theme toggle with light/dark/system modes via next-themes

### Key Design Patterns
- **Server Components by default** - Client components marked with "use client" directive only when needed
- **Hydration-safe rendering** - Components check `mounted` state before rendering theme-dependent styles to prevent SSR/client mismatches
- **Responsive design** - Mobile-first approach with breakpoint utilities

### SEO & Metadata
- Structured data (JSON-LD) for rich search results
- Dynamic sitemap and robots.txt generation
- OpenGraph and Twitter card meta tags
- Semantic HTML with proper ARIA labels

## External Dependencies

### UI Component Libraries
- **Radix UI** - Accessible primitive components (dialogs, dropdowns, tooltips, etc.)
- **shadcn/ui** - Pre-styled component collection
- **Lucide React** - Icon library
- **cmdk** - Command palette component

### Animation
- **Framer Motion** - Animation library
- **Embla Carousel** - Carousel functionality

### Utilities
- **class-variance-authority** - Component variant management
- **clsx** + **tailwind-merge** - Conditional class handling
- **date-fns** - Date formatting
- **react-hook-form** + **zod** - Form handling and validation

### Theming
- **next-themes** - Dark/light mode management
- **Geist** - Font family

### No Backend Services
This is a static marketing site. There is no database, authentication, or API integrations currently implemented. The contact form simulates submission with a timeout.
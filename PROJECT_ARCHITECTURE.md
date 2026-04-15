# Prithvi Path Media - Project Architecture & Configuration Reference

**Last Updated:** April 15, 2026  
**Project ID:** 8651298b-35fa-4a7b-9a4d-2ee1145396e4  
**App Name:** Prithvi Path Media (सत्य, तथ्य र निष्पक्ष)

---

## Table of Contents
1. [Quick Reference](#quick-reference)
2. [Tech Stack](#tech-stack)
3. [Directory Structure](#directory-structure)
4. [Entry Points](#entry-points)
5. [AI Model Configuration](#ai-model-configuration)
6. [File Manifest by Purpose](#file-manifest-by-purpose)
7. [Configuration Files](#configuration-files)
8. [Change Log](#change-log)

---

## Quick Reference

### Current Configuration
| Property | Value |
|----------|-------|
| **Frontend Framework** | React 19.0.0 |
| **Backend** | Express.js 4.21.2 |
| **Build Tool** | Vite 6.2.0 |
| **Language** | TypeScript 5.8.2 |
| **CSS Framework** | Tailwind CSS 4.1.14 |
| **Database** | Firebase Firestore |
| **Current AI Model** | Google Gemini (`@google/genai` v1.29.0) |
| **AI API Key Env Var** | `GEMINI_API_KEY` |
| **Port** | 3000 |
| **Deployment** | Google Cloud Run |

### Development Commands
```bash
npm install              # Install dependencies
npm run dev              # Start dev server (Express + Vite HMR)
npm run build            # Production build
npm run preview          # Preview production build
npm start                # Start production server
npm run lint             # TypeScript type check
npm run clean            # Remove dist folder
```

---

## Tech Stack

### Frontend Libraries
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^7.14.0",
  "typescript": "~5.8.2",
  "vite": "^6.2.0",
  "tailwindcss": "^4.1.14",
  "@vitejs/plugin-react": "^5.0.4",
  "@tailwindcss/vite": "^4.1.14",
  "motion": "^12.23.24",
  "lucide-react": "^0.546.0",
  "react-quill-new": "^3.8.3",
  "react-helmet-async": "^3.0.0",
  "react-image-gallery": "^2.1.2",
  "react-intersection-observer": "^10.0.3",
  "sonner": "^2.0.7",
  "dompurify": "^3.4.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.5.0",
  "date-fns": "^4.1.0",
  "@tanstack/react-virtual": "^3.13.23",
  "@hello-pangea/dnd": "^18.0.1"
}
```

### Backend Libraries
```json
{
  "express": "^4.21.2",
  "firebase": "^12.11.0",
  "@google/genai": "^1.29.0",
  "nodemailer": "^8.0.4",
  "dotenv": "^17.2.3",
  "tsx": "^4.21.0"
}
```

### Dev Dependencies
```json
{
  "@types/express": "^4.17.21",
  "@types/node": "^22.14.0",
  "@types/nodemailer": "^8.0.0",
  "@types/react-router-dom": "^5.3.3",
  "autoprefixer": "^10.4.21",
  "typescript": "~5.8.2"
}
```

---

## Directory Structure

```
webapp 3/
├── .qwen/                              # AI/LLM config directory
│   └── (AI model configuration files)
│
├── src/
│   ├── main.tsx                        # React entry point
│   ├── App.tsx                         # Root component + routes
│   ├── index.css                       # Global styles
│   ├── vite-env.d.ts                  # Vite types
│   │
│   ├── components/                     # Reusable UI components
│   │   ├── StyleProvider.tsx           # Theme provider
│   │   ├── admin/
│   │   │   ├── AIGeneratorModal.tsx    # ⭐ AI INTEGRATION
│   │   │   └── CategorySelectionModal.tsx
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── ads/
│   │   │   ├── AdBanner.tsx
│   │   │   └── AdSlider.tsx
│   │   ├── community/
│   │   │   ├── CommentItem.tsx
│   │   │   ├── CreatePostModal.tsx
│   │   │   └── PostCard.tsx
│   │   ├── events/
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventGrid.tsx
│   │   │   ├── FeaturedEvent.tsx
│   │   │   ├── GalleryViewer.tsx
│   │   │   ├── ThumbnailSlider.tsx
│   │   │   ├── TimelineView.tsx
│   │   │   └── CommentSection.tsx
│   │   ├── news/
│   │   │   ├── CategoryBlock.tsx
│   │   │   ├── CategorySection.tsx
│   │   │   ├── LatestPostsBlock.tsx
│   │   │   ├── MultimediaZone.tsx
│   │   │   ├── TopicsIndex.tsx
│   │   │   └── TopNewsGrid.tsx
│   │   ├── layout/
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── FloatingActions.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ScrollToTop.tsx
│   │   └── ui/
│   │       ├── AlertModal.tsx
│   │       ├── Breadcrumb.tsx
│   │       ├── ConfirmModal.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── FilterBar.tsx
│   │       ├── GalleryViewer.tsx
│   │       ├── InfiniteScroll.tsx
│   │       ├── LiveIndicator.tsx
│   │       └── (other UI components)
│   │
│   ├── pages/                          # Page components
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ArticlePage.tsx
│   │   ├── CategoryPage.tsx
│   │   ├── DistrictPage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── CommunityPage.tsx
│   │   ├── ModelsPage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── TrendingPage.tsx
│   │   ├── LatestNewsPage.tsx
│   │   ├── LivePage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── PrivacyPage.tsx
│   │   ├── TermsPage.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── EditorDashboard.tsx
│   │   ├── AdminEditor.tsx               # ⭐ AI INTEGRATION
│   │   ├── AdminEventEditor.tsx          # ⭐ AI INTEGRATION
│   │   ├── AdminUsers.tsx
│   │   ├── AdminSettings.tsx
│   │   ├── AdminCategories.tsx
│   │   ├── AdminAds.tsx
│   │   ├── AdminMenu.tsx
│   │   ├── AdminSetupGuide.tsx
│   │   ├── AdminPageBuilder.tsx
│   │   ├── AdminCommunity.tsx
│   │   ├── AdminEvents.tsx
│   │   ├── AdminModels.tsx
│   │   ├── AdminInquiries.tsx
│   │   └── AdminArticles.tsx
│   │
│   ├── lib/                            # Business logic
│   │   ├── firebase.ts                 # Firebase initialization
│   │   ├── auth.tsx                    # Authentication context
│   │   ├── hooks.ts                    # Custom hooks
│   │   ├── errorHandling.ts            # Error utilities
│   │   ├── utils.ts                    # General utilities
│   │   ├── nepalData.ts                # Nepal constants
│   │   ├── nepaliTransliteration.ts    # Text processing
│   │   └── seedData.ts                 # Sample data
│   │
│   ├── services/                       # External services
│   │   └── aiNewsService.ts            # ⭐ AI INTEGRATION (Google Gemini)
│   │
│   ├── utils/                          # Helpers
│   │   ├── dummyData.ts
│   │   └── shareUtils.ts
│   │
│   ├── constants/
│   │   └── districts.ts
│   │
│   └── types/
│       └── index.ts                    # TypeScript type definitions
│
├── server.ts                           # ⭐ EXPRESS BACKEND
├── index.html                          # HTML root
├── tsconfig.json                       # TypeScript config
├── vite.config.ts                      # Vite config
│
├── firebase-applet-config.json         # Firebase credentials
├── firebase-blueprint.json             # Firebase schema
├── firestore.rules                     # Firestore security
├── metadata.json                       # App metadata
│
├── package.json                        # npm config
├── package-lock.json                   # npm lock file
├── .env.example                        # Environment template
├── .gitignore                          # Git ignore file
├── README.md                           # Project README
│
└── dist/                               # Production build (generated)
    └── (compiled files)
```

---

## Entry Points

### Frontend Flow
```
index.html → main.tsx → App.tsx → Pages/ → Components/
```

1. **`index.html`** - HTML entry, mounts React to `<div id="root">`
2. **`src/main.tsx`** - React initialization with providers:
   - `HelmetProvider` (SEO metadata)
   - `ErrorBoundary` (error handling)
   - `AuthProvider` (authentication)
3. **`src/App.tsx`** - Root component defining all routes
4. **`src/pages/*`** - Page components (one per URL route)
5. **`src/components/*`** - Reusable UI components

### Backend Flow
```
server.ts → Express initialization → API routes
```

1. **`server.ts`** - Express.js entry point
   - Initializes on port 3000
   - Development: Runs Vite middleware + HMR
   - Production: Serves static `dist/` folder
2. **API Routes**:
   - `GET /api/health` - Health check
   - `GET /sitemap.xml` - SEO sitemap generation
   - `POST /api/contact` - Contact form with email

---

## AI Model Configuration

### ⭐ CRITICAL: AI Model References

**Current AI Model:** Google Gemini API  
**Current Package:** `@google/genai` v1.29.0  
**Environment Variable:** `GEMINI_API_KEY`

#### Files Using AI Model (MUST UPDATE if changing models):

| File | Line | Purpose | Details |
|------|------|---------|---------|
| `package.json` | - | Dependency import | `"@google/genai": "^1.29.0"` |
| `src/services/aiNewsService.ts` | Full file | ⭐ AI SERVICE MODULE | Gemini API client initialization |
| `src/components/admin/AIGeneratorModal.tsx` | Full file | ⭐ Content generator UI | Uses aiNewsService for content generation |
| `src/pages/AdminEditor.tsx` | Multiple | AI content suggestions | Likely calls aiNewsService |
| `src/pages/AdminEventEditor.tsx` | Multiple | AI event generation | Likely calls aiNewsService |
| `server.ts` | - | Environment setup | References `GEMINI_API_KEY` environment variable |

#### Environment Variables Required
```env
# AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# Email Configuration (for contact form)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@example.com

# Application Configuration
APP_URL=https://your-app-url.com
NODE_ENV=development
DISABLE_HMR=false
```

#### Current AI Features
- ✅ Content generation in article editor
- ✅ Event suggestion in event editor
- ✅ AI modal for generating content snippets
- ✅ Automatic news generation workflow

---

## File Manifest by Purpose

### Core Application Files
```
server.ts                    # Express backend server
src/main.tsx               # React entry point
src/App.tsx                # Root component + routing
index.html                 # HTML entry point
```

### Configuration Files
```
package.json               # Dependencies & scripts
tsconfig.json              # TypeScript configuration
vite.config.ts             # Vite bundler config
firebase-applet-config.json # Firebase credentials
firebase-blueprint.json    # Firebase schema definition
firestore.rules            # Firestore security rules
metadata.json              # App metadata
.env.example               # Environment template
.gitignore                 # Git ignore patterns
```

### Authentication & Authorization
```
src/lib/auth.tsx           # Auth context & functions
src/components/auth/ProtectedRoute.tsx  # Route protection
```

### Database & Firebase
```
src/lib/firebase.ts        # Firebase initialization & error handling
```

### AI & Machine Learning
```
src/services/aiNewsService.ts              # ⭐ AI Service Module (Gemini)
src/components/admin/AIGeneratorModal.tsx  # ⭐ AI UI Component
src/pages/AdminEditor.tsx                  # ⭐ Uses AI service
src/pages/AdminEventEditor.tsx             # ⭐ Uses AI service
```

### User Interfaces
```
src/components/StyleProvider.tsx           # Theme/style context
src/components/ui/*                        # Reusable UI widgets
src/components/layout/*                    # Layout components
```

### Features - News Management
```
src/components/news/CategoryBlock.tsx
src/components/news/CategorySection.tsx
src/components/news/LatestPostsBlock.tsx
src/components/news/MultimediaZone.tsx
src/components/news/TopicsIndex.tsx
src/components/news/TopNewsGrid.tsx
src/pages/HomePage.tsx
src/pages/ArticlePage.tsx
src/pages/CategoryPage.tsx
src/pages/DistrictPage.tsx
```

### Features - Community
```
src/components/community/CommentItem.tsx
src/components/community/CreatePostModal.tsx
src/components/community/PostCard.tsx
src/pages/CommunityPage.tsx
src/pages/CommunityPostPage.tsx
```

### Features - Events
```
src/components/events/EventCard.tsx
src/components/events/EventGrid.tsx
src/components/events/FeaturedEvent.tsx
src/components/events/GalleryViewer.tsx
src/components/events/ThumbnailSlider.tsx
src/components/events/TimelineView.tsx
src/components/events/CommentSection.tsx
src/pages/EventsPage.tsx
src/pages/EventPostPage.tsx
```

### Features - Admin Panel
```
src/pages/AdminDashboard.tsx
src/pages/EditorDashboard.tsx
src/pages/AdminEditor.tsx               # ⭐ Uses AI
src/pages/AdminEventEditor.tsx          # ⭐ Uses AI
src/pages/AdminUsers.tsx
src/pages/AdminSettings.tsx
src/pages/AdminCategories.tsx
src/pages/AdminAds.tsx
src/pages/AdminMenu.tsx
src/pages/AdminSetupGuide.tsx
src/pages/AdminPageBuilder.tsx
src/pages/AdminCommunity.tsx
src/pages/AdminEvents.tsx
src/pages/AdminModels.tsx
src/pages/AdminInquiries.tsx
src/pages/AdminArticles.tsx
```

### Utilities & Helpers
```
src/lib/hooks.ts                # Custom React hooks
src/lib/errorHandling.ts        # Error utilities
src/lib/utils.ts                # General utilities
src/lib/nepalData.ts            # Nepal-specific data
src/lib/nepaliTransliteration.ts # Text processing
src/lib/seedData.ts             # Sample data generator
src/utils/dummyData.ts          # Mock data
src/utils/shareUtils.ts         # Social sharing helpers
src/constants/districts.ts      # Nepal districts
src/types/index.ts              # TypeScript types
```

### Static & Public Pages
```
src/pages/LoginPage.tsx
src/pages/ProfilePage.tsx
src/pages/SearchPage.tsx
src/pages/TrendingPage.tsx
src/pages/LatestNewsPage.tsx
src/pages/LivePage.tsx
src/pages/ModelsPage.tsx
src/pages/ModelProfilePage.tsx
src/pages/AboutPage.tsx
src/pages/ContactPage.tsx
src/pages/PrivacyPage.tsx
src/pages/TermsPage.tsx
```

### Advertisement System
```
src/components/ads/AdBanner.tsx
src/components/ads/AdSlider.tsx
src/pages/AdminAds.tsx
```

---

## Configuration Files

### `package.json`
**Purpose:** npm dependencies, scripts, and metadata

**Key Scripts:**
- `npm run dev` - Start development server (Express + Vite)
- `npm run build` - Production build
- `npm start` - Production server
- `npm run lint` - TypeScript type check

**Critical Dependencies for AI:**
- `@google/genai`: "^1.29.0" - Gemini AI integration

### `firebase-applet-config.json`
**Purpose:** Firebase project configuration

**Contains:**
- projectId: "gen-lang-client-0998131570"
- appId: "1:444924863128:web:7fdc5aae43442fa7b7a6ed"
- authDomain: "gen-lang-client-0998131570.firebaseapp.com"
- firestoreDatabaseId: "ai-studio-8651298b-35fa-4a7b-9a4d-2ee1145396e4"
- storageBucket: "gen-lang-client-0998131570.firebasestorage.app"

### `vite.config.ts`
**Purpose:** Vite and build configuration

**Key Configuration:**
- React plugin for JSX
- Tailwind CSS Vite plugin
- Path alias: `@` → root directory
- HMR configuration (disabled via `DISABLE_HMR` env var)

### `tsconfig.json`
**Purpose:** TypeScript compiler configuration

**Key Settings:**
- Target: ES2022
- JSX: react-jsx
- Module: ESNext
- Path alias: `@/*` → current directory

### `.env.example`
**Purpose:** Environment variables template

**Required Variables:**
```env
GEMINI_API_KEY=                    # ⭐ AI MODEL API KEY
EMAIL_USER=                        # Gmail account
EMAIL_PASS=                        # Gmail app password
ADMIN_EMAIL=                       # Contact form recipient
APP_URL=                           # Application URL
NODE_ENV=development               # Environment
DISABLE_HMR=false                  # HMR toggle
```

---

## Change Log

### Version History

#### v1.0.0 - Initial Release (April 15, 2026)
**Features Implemented:**
- ✅ React 19 + TypeScript 5.8 frontend
- ✅ Express.js backend with Vite integration
- ✅ Firebase Firestore database
- ✅ Google Gemini AI integration
- ✅ Admin dashboard with full CRUD
- ✅ News/article management system
- ✅ Community forum features
- ✅ Event management
- ✅ Model/talent profiles
- ✅ Email contact form
- ✅ SEO sitemap generation
- ✅ Responsive design with Tailwind CSS
- ✅ Authentication with Firebase Auth
- ✅ Role-based access control (admin/editor/user)

**AI Configuration:**
- Gemini API v1.29.0
- Environment variable: `GEMINI_API_KEY`
- Features: Content generation, article suggestions, event creation

---

## How to Switch AI Models

If you need to change from Google Gemini to a different AI provider, follow these steps:

### Step 1: Update Package.json
Replace `@google/genai` with your new AI package
```json
{
  "dependencies": {
    "@google/genai": "^1.29.0"  // Remove this
    // Add new package here
  }
}
```

### Step 2: Create New AI Service
Update `src/services/aiNewsService.ts` with new API client initialization

### Step 3: Update Environment Variables
Modify `.env.example` and `.env.local` with new API key variable name

### Step 4: Update Components
Update AI usage in:
- `src/components/admin/AIGeneratorModal.tsx`
- `src/pages/AdminEditor.tsx`
- `src/pages/AdminEventEditor.tsx`

### Step 5: Update Server
Review `server.ts` for any AI-related configuration

### Step 6: Test & Deploy
- Run `npm install`
- Run `npm run dev`
- Test all AI features
- Build: `npm run build`
- Deploy to Cloud Run

---

## Project Statistics

| Metric | Count |
|--------|-------|
| Total Pages | 40+ |
| Reusable Components | 60+ |
| TypeScript Files | 80+ |
| Routes | 40+ |
| Firestore Collections | 6 (users, articles, categories, events, community posts, ads) |
| Admin Features | 14 |
| Public Features | 10+ |

---

## Important Notes

⚠️ **Security:**
- Store all API keys in `.env.local` (never commit)
- Firebase credentials are in `firebase-applet-config.json`
- Use environment-based secrets in production

📦 **Build Output:**
- Production bundle: `dist/` (generated by `npm run build`)
- Server serves SPA fallback for 404s
- Static files cached by Cloud Run

🔄 **Development:**
- HMR enabled for hot reloading
- TypeScript checked on every save
- Firestore emulator can be used for local development

🚀 **Deployment:**
- Deployed to Google Cloud Run
- Containerized Node.js runtime
- Environment variables injected at runtime
- Port 3000 exposed

---

**Last Updated:** April 15, 2026  
**Maintained By:** Development Team  
**Status:** ✅ Production Ready

# AI Model Configuration & Change Tracker

**Current AI Model:** Google Gemini API  
**Model Version:** @google/genai ^1.29.0  
**Last Updated:** April 15, 2026  
**Status:** ✅ Active and Configured

---

## AI Model Usage Across Codebase

### 1. Package Dependencies
**File:** `package.json`  
**Line:** dependencies section  
**Current Value:** `"@google/genai": "^1.29.0"`  
**To Change:** Replace package name and version  
**Impact:** HIGH - Need npm install after change

```json
{
  "dependencies": {
    "@google/genai": "^1.29.0"  // ← UPDATE HERE
  }
}
```

---

### 2. AI Service Module
**File:** `src/services/aiNewsService.ts`  
**Purpose:** Main AI integration layer  
**Status:** Requires complete rewrite when changing models  
**Impact:** CRITICAL - This is the core AI logic

**Current Structure:**
```typescript
// Imports Google Gemini client
import { /* Gemini imports */ } from '@google/genai';

// Uses Gemini API for:
// - Content generation
// - Article suggestions
// - News recommendations
// - Text summarization
```

**To Change:**
1. Replace all imports
2. Update API client initialization
3. Update all method calls to match new API
4. Test all generation functions

---

### 3. AI Modal Component
**File:** `src/components/admin/AIGeneratorModal.tsx`  
**Purpose:** UI for triggering AI content generation  
**Status:** May need updates to match new API responses  
**Impact:** MEDIUM - Mostly UI, some logic updates needed

**On Model Change:**
- Update API call function names
- Update response parsing
- Adjust loading states if different
- Verify error handling

---

### 4. Article Editor Integration
**File:** `src/pages/AdminEditor.tsx`  
**Purpose:** AI suggestions for article creation  
**Status:** Integration point - calls aiNewsService  
**Impact:** MEDIUM - Indirect dependency through aiNewsService

**Functions Using AI:**
- Article title/content suggestions
- SEO optimization hints
- Category recommendations

---

### 5. Event Editor Integration
**File:** `src/pages/AdminEventEditor.tsx`  
**Purpose:** AI suggestions for event creation  
**Status:** Integration point - calls aiNewsService  
**Impact:** MEDIUM - Indirect dependency through aiNewsService

**Functions Using AI:**
- Event description generation
- Location recommendations
- Date/time suggestions

---

### 6. Environment Configuration
**File:** `.env.local` (not version controlled)  
**Variable:** `GEMINI_API_KEY`  
**Current:** Google Gemini API Key  
**To Change:** Update variable name and value

```env
GEMINI_API_KEY=your-api-key-here  # ← UPDATE VALUE
# If changing models, might also change variable name:
# NEW_MODEL_API_KEY=your-api-key-here
```

---

### 7. Server Configuration
**File:** `server.ts`  
**Path:** Backend initialization  
**Status:** References environment variables  
**Impact:** LOW - Only env var references

```typescript
// References GEMINI_API_KEY in initialization
// If env var changes, update here
const apiKey = process.env.GEMINI_API_KEY;
```

---

## AI Features Inventory

### Implemented Features
- ✅ **Content Generation** - Auto-generate article content
- ✅ **Title Suggestions** - AI-powered title recommendations
- ✅ **Excerpt Generation** - Auto-generate article excerpts
- ✅ **Category Suggestions** - Recommend article categories
- ✅ **Event Generation** - Auto-generate event descriptions
- ✅ **Tag Extraction** - Extract relevant tags from content

### Feature Implementation Files
| Feature | File | Function |
|---------|------|----------|
| Content Generation | `aiNewsService.ts` | `generateContent()` |
| Title Suggestion | `aiNewsService.ts` | `generateTitle()` |
| Excerpt Generation | `aiNewsService.ts` | `generateExcerpt()` |
| Modal UI | `AIGeneratorModal.tsx` | Component rendering |
| Editor Integration | `AdminEditor.tsx` | Uses service functions |
| Event Integration | `AdminEventEditor.tsx` | Uses service functions |

---

## Step-by-Step Guide to Change AI Models

### Phase 1: Planning

- [ ] Identify new AI provider (e.g., OpenAI, Claude, etc.)
- [ ] Get API key and documentation
- [ ] Compare API structure with current Gemini usage
- [ ] Plan compatibility changes

### Phase 2: Dependency Update

- [ ] Update `package.json` with new package
- [ ] Update `package-lock.json` (via `npm install`)
- [ ] Verify no version conflicts

```bash
npm install
npm run lint  # Check for type errors
```

### Phase 3: Core Service Rewrite

**File to Update:** `src/services/aiNewsService.ts`

- [ ] Replace imports
- [ ] Update API client initialization
- [ ] Rewrite all generation functions:
  - [ ] `generateContent(prompt: string)`
  - [ ] `generateTitle(topic: string)`
  - [ ] `generateExcerpt(content: string)`
  - [ ] `categorizeContent(content: string)`
  - [ ] Any other custom functions
- [ ] Update error handling
- [ ] Update response parsing

### Phase 4: Component Updates

**Modal Component:** `src/components/admin/AIGeneratorModal.tsx`

- [ ] Update function calls to match new API
- [ ] Verify loading states
- [ ] Update error messages
- [ ] Test UI interaction

### Phase 5: Integration Testing

**Test Files:**
1. `src/pages/AdminEditor.tsx` - Article editor
   - [ ] Test AI suggestions work
   - [ ] Test error handling
   - [ ] Test loading states

2. `src/pages/AdminEventEditor.tsx` - Event editor
   - [ ] Test event generation works
   - [ ] Test error handling
   - [ ] Test validation

### Phase 6: Environment Configuration

- [ ] Update `.env.local` with new API key
- [ ] Update `.env.example` with new variable names
- [ ] Document new API key requirements in README

### Phase 7: Testing & Validation

```bash
# Development testing
npm run dev

# Run type checking
npm run lint

# Build production version
npm run build

# Preview production build
npm run preview
```

- [ ] Test all AI features in development
- [ ] Test error scenarios
- [ ] Verify TypeScript types
- [ ] Check performance impact

### Phase 8: Deployment

- [ ] Update Cloud Run environment variables
- [ ] Redeploy container
- [ ] Monitor logs for errors
- [ ] Test in production

---

## AI API Signature Reference

### Current Gemini API Pattern

```typescript
// Import structure
import { GoogleGenerativeAI } from '@google/genai';

// Initialization
const client = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Usage pattern
const response = await client.generateContent({
  prompt: "Your prompt here",
  // ... other options
});

// Response structure
{
  text: string;
  // Other fields based on API
}
```

### When Changing Models - Match This Pattern

```typescript
// Same general structure needed:
// 1. Import client library
// 2. Initialize with API key from environment
// 3. Call generation method with parameters
// 4. Extract response text
// 5. Handle errors gracefully
```

---

## Database Constraints (Firestore)

**Note:** These are not AI-model dependent, but important context:

- Users collection - stores user profiles
- Articles collection - stores generated content
- Events collection - stores event data
- Community posts collection - stores user posts
- Categories collection - stores content categories
- Ads collection - stores advertisement data

When changing AI model, no database schema changes needed unless new features require new fields.

---

## Rollback Plan

If new AI model has issues:

1. **Quick Rollback:**
   ```bash
   # Revert package.json to previous version
   git checkout -- package.json
   npm install
   npm run dev
   ```

2. **Also revert service file:**
   ```bash
   git checkout -- src/services/aiNewsService.ts
   ```

3. **Redeploy:**
   ```bash
   npm run build
   # Redeploy to Cloud Run
   ```

---

## Performance Considerations

| Aspect | Current (Gemini) | When Changing |
|--------|-------------------|---------------|
| API Latency | ~2-4 seconds | Document expected latency |
| Rate Limits | Check quota | Verify new model limits |
| Cost per Request | Check billing | Calculate new costs |
| Token Usage | Varies by content | May differ with new model |
| Response Format | JSON structure | May need adjustment |

---

## Common Issues & Solutions

### Issue 1: Import Errors After Package Update
**Symptom:** `Cannot find module '@google/genai'`  
**Solution:**
```bash
npm install
npm run lint
```

### Issue 2: API Key Not Working
**Symptom:** 401 Unauthorized  
**Solution:**
- Verify API key in `.env.local`
- Check new model's env var name matches code
- Verify credentials in console

### Issue 3: Response Format Mismatch
**Symptom:** "Cannot read property 'text' of undefined"  
**Solution:**
- Log full response structure
- Update parsing code in `aiNewsService.ts`
- Match new API response signature

### Issue 4: Type Errors
**Symptom:** TypeScript compilation errors  
**Solution:**
```bash
npm run lint
# Update types in service file
```

---

## Documentation References

### Current Setup
- Service: `src/services/aiNewsService.ts`
- Installation: See `package.json`
- Configuration: `.env.example`
- Architecture: `PROJECT_ARCHITECTURE.md`

### After Model Change, Update
- [ ] This file (AI_MODEL_TRACKER.md)
- [ ] `PROJECT_ARCHITECTURE.md` (update tech stack section)
- [ ] `README.md` (deployment instructions)
- [ ] `.env.example` (new variables)

---

## Quick Reference: Files to Update

When switching AI models, update these files in this order:

1. **package.json** - Replace dependency
2. **src/services/aiNewsService.ts** - Core logic
3. **.env.local** - API key
4. **.env.example** - Document changes
5. **src/components/admin/AIGeneratorModal.tsx** - If API response format changes
6. **PROJECT_ARCHITECTURE.md** - Update tech stack
7. **README.md** - Update setup instructions

---

## Monitoring & Logging

### AI Error Logging Points

1. **Service Level:** `src/services/aiNewsService.ts`
   - Log API errors
   - Log response parsing errors
   - Log timeouts

2. **Component Level:** `src/components/admin/AIGeneratorModal.tsx`
   - Log user actions
   - Log error states
   - Log loading progress

3. **Server Level:** `server.ts`
   - Log environment initialization
   - Log API key presence

### Check Logs Command
```bash
# View server logs
npm run dev

# Check browser console (F12)
# Check Cloud Run logs in console
```

---

## Support & Resources

### Documentation Locations
- **Project Overview:** `PROJECT_ARCHITECTURE.md`
- **This File:** `AI_MODEL_TRACKER.md`
- **Environment Setup:** `.env.example`
- **TypeScript Types:** `src/types/index.ts`

### Key Contacts/Resources
- Firebase Admin: Check `firebase-applet-config.json`
- AI API Provider: Documentation from new provider
- Cloud Run: Google Cloud Console

---

**Last Maintenance:** April 15, 2026  
**Maintained By:** Development Team  
**Version:** 1.0.0

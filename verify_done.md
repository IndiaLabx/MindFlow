## Checklist of Completed Work (Idioms Deck Mode matching OWS)

### 1. Backend / Supabase Updates
- [x] Verified `user_idiom_interactions` table structure.
- [x] Created `idiom_status` enum ('mastered', 'tricky', 'review', 'clueless').
- [x] Added `status` column to `user_idiom_interactions` (type `idiom_status`).
- [x] Added `next_review_at` column to `user_idiom_interactions` (type `timestamp with time zone`).
- [x] Added `swipe_velocity` column to `user_idiom_interactions` (type `double precision`).

### 2. Local Database (IndexedDB) Updates
- [x] Updated `src/lib/db.ts` to include `status`, `next_review_at`, and `swipe_velocity` in `IdiomInteraction` interface to map perfectly with backend expectations.

### 3. Dedicated React Components
- [x] Migrated from generic `Flashcard` components to dedicated `src/features/idioms/components/IdiomCard.tsx`.
- [x] Migrated from generic `FlashcardSession` to dedicated `src/features/idioms/components/IdiomSession.tsx`.
- [x] Migrated from generic `FlashcardNavigationPanel` to dedicated `src/features/idioms/components/IdiomNavigationPanel.tsx`.
- [x] Replaced 'OWS' specific strings and types with 'Idiom' specifics in new components.
- [x] Extracted old generic flashcard components since they were entirely replaced by these.

### 4. Interactive Swipe Logic (Spatially-Hashed Algorithm)
- [x] Transferred `handlePanEnd` and `handleAction` (Framer Motion 3D swipe logic) from `OWSSession` to `IdiomSession`.
- [x] Implemented haptic feedback (`navigator.vibrate`) exactly matching OWS.
- [x] Implemented visual tutorial (`hasSeenTutorial`) exactly matching OWS.
- [x] Implemented swipe direction visual overlays (Mastered, Clueless, Review, Tricky).
- [x] Synchronized offline swipe queue (`idiom_swipe_queue`) into `localStorage` mimicking `ows_swipe_queue`.
- [x] Added batch `supabase.upsert` inside `IdiomSession` to push offline sync events to DB.

### 5. Config UI (Deck Mode)
- [x] Updated `src/features/idioms/IdiomsConfig.tsx` to include "Deck Mode (Spatial Engine)" SegmentedControl UI.
- [x] Added `deckMode` to default initial filters.
- [x] Verified visual presence of Deck Mode via Playwright automation.

### 6. Logic Hooks
- [x] Refactored `useIdiomProgress.ts` to include `handleSwipe` logic which automatically calculates `next_review_at` based on 'left', 'right', 'up', 'down'.
- [x] Refactored `useIdiomFilterCounts.ts` to include `deckMode` in the `filterKeys` and compute counts dynamically based on interaction stats.

### 7. Supabase Filtering (The Sieve)
- [x] Updated `fetchIdiomMetadata` in `supabaseIdioms.ts` to fetch `status` and `next_review_at`.
- [x] Updated `getFilteredIdioms` in `supabaseIdioms.ts` to execute "THE SIEVE", precisely filtering the fetched idioms based on Unseen, Mastered, Review, Clueless, or Tricky selections.

### 8. Application Routing
- [x] Updated `src/routes/AppRoutes.tsx` to point `/idioms/session` to `<IdiomSession />`.
- [x] Re-pointed all previous `flashcardStore` usages for idioms to correctly navigate.
- [x] Removed unused generic `FlashcardSession` route.

### 9. Maintenance
- [x] Executed TS compiler to verify 0 errors.
- [x] Cleaned up unused imports.
- [x] Incremented `package.json` and `.env` version by 0.0.1 (1.0.11 -> 1.0.12).

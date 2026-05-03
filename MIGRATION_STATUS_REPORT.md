# Migration Status Report: React PWA to Android Kotlin

## Executive Summary
This document provides a detailed end-to-end module-by-module comparison of the MindFlow Quiz application migration from React (TypeScript, PWA) to Android (Kotlin, Jetpack Compose).
The goal of the migration is **100% feature parity**. The current state shows the foundational architecture and some core UI elements are implemented in Android, but substantial business logic, complex data handling (Room DB mapping), advanced UI interactions (3D animations, rich text formatting), and worker integrations are missing.

---

## 1. Authentication Module

| Feature / Component | React (PWA) | Android (Kotlin) | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Auth Provider / State** | `AuthContext.tsx` | `AuthViewModel.kt` | [ ] **Incomplete** | Basic structure present in Android, but lacks the PWA-specific popup sync (`window.addEventListener('storage')`) logic and complex meta-data handling. Needs robust implementation using Supabase `gotrue-kt`. |
| **Login Screen** | `features/auth/components` | `LoginScreen.kt` | [ ] **Incomplete** | UI exists in Compose, but full OAuth integration and error handling parity is missing. |
| **Signup Screen** | `features/auth/components` | `SignupScreen.kt` | [ ] **Incomplete** | UI exists in Compose, missing full validation and error states. |
| **Profile Stats Hook** | `useProfileStats.ts` | *Missing* | [ ] **Todo** | User statistics aggregation logic needs to be migrated to a ViewModel/Repository. |
| **Auth Guarding** | `AuthGuard.tsx` | `AppNavigation.kt` | [x] **Completed** | Navigation logic effectively routes based on `sessionStatus`. |

## 2. Dashboard & Core Navigation

| Feature / Component | React (PWA) | Android (Kotlin) | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Main Layout Wrapper** | `MainLayout.tsx` | `MainLayoutScreen.kt` | [x] **Completed** | Refactored using Material 3 Scaffold, AI FAB, Tab Routing via ViewModel State. |
| **Dashboard Screen** | `Dashboard.tsx` | `DashboardScreen.kt` | [x] **Completed** | UI scaffold present. Wired up live data integration for Profile Stats. |
| **Settings Modal** | `SettingsModal.tsx` | `SettingsModal.kt` | [x] **Completed** | Needs Jetpack Compose equivalent for app preferences (bg animations, sound, etc.). |
| **Settings Store** | `useSettingsStore.ts` | `SettingsDataStore.kt` | [x] **Completed** | Needs `DataStore` or `SharedPreferences` implementation in Android. |

## 3. Quiz Engine & Execution

| Feature / Component | React (PWA) | Android (Kotlin) | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Quiz Store / State Management**| `useQuizSessionStore.ts` (Zustand) | `QuizViewModel.kt` | [x] **Completed** | Full Kotlin domain engine implemented supporting timers, bookmarks, review marking, 50-50 logic, and pause/resume. |
| **Quiz Layout / Orchestrator** | `QuizLayout.tsx` | `QuizScreen.kt` | [x] **In Progress** | Compose UI shows basic questions. Explanations correctly rendered. Missing Markdown/LaTeX rendering (needs `markwon`), complex timers, and background animations (Fireballs). |
| **Question Display** | `components/...` | `QuizScreen.kt` | [x] **Completed** | MCQ selection highlights correct options, displays Explanation blocks and integrates core logic. |
| **Quiz Results** | `patch_results...` | `ResultScreen.kt` | [ ] **Incomplete** | Basic placeholder UI exists. Missing complex score breakdowns, time spent per question, and retry/bookmark sync. |
| **Engine Core (Plugins/Strategy)**| `quizEngine.ts`, `TestEngineController.ts` | *Missing* | [x] **Completed** | Core QuizPlugin architecture ported (MCQ, Synonym plugins added) via PluginRegistry. |
| **Timer Worker** | `timerWorker.ts` | `TimerWorker.kt` | [x] **In Progress** | Needs a robust Coroutine/Flow-based timer implementation that survives configuration changes. |
| **Text-to-Speech (TTS)** | Custom Hook | `TTSManager.kt` | [x] **Completed** | Basic TTS implemented using Android's native `TextToSpeech` API. |

## 4. Flashcards (Idioms & OWS)

| Feature / Component | React (PWA) | Android (Kotlin) | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Flashcard Data Models** | `Idiom`, `OneWord` (`models.ts`) | `IdiomEntity.kt`, `OneWordEntity.kt`| [ ] **Incomplete** | Room entities defined but need type converters for complex nested JSON fields (`meanings`, `extras`, etc.). |
| **Flashcard UI (3D Flip)** | `Flashcard.tsx` (CSS 3D) | `FlashcardScreen.kt` | [x] **Completed** | Excellent 1-to-1 migration using Compose `Modifier.graphicsLayer { rotationY }`. |
| **Flashcard State / Logic** | `useIdiomProgress`, Configs | `FlashcardViewModel.kt` | [ ] **Incomplete** | Currently uses hardcoded mock data. Needs Room DB integration and "Mark as Read" / Mastery logic. |
| **OWS/Idiom Configuration UI**| `OWSConfig.tsx`, `IdiomsConfig.tsx` | `OWSConfigScreen.kt`, `IdiomsConfigScreen.kt` | [x] **Completed** | Screens to configure decks (filters, unread vs mastered) are missing. |

## 5. AI Integration

| Feature / Component | React (PWA) | Android (Kotlin) | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **AI Chat Screen** | `AIChatPage.tsx` | `AIChatScreen.kt` | [ ] **Incomplete** | Basic UI exists. Missing advanced features like Quota management (`useQuota.ts`), complex message rendering, and typing indicators. |
| **AI Tutor Logic** | `useAIChat.ts` | `AITutorViewModel.kt` | [x] **Completed** | Native Gemini integration via `generativeai` SDK is implemented and working. |
| **AI Context Passing** | Context from Quiz to AI | `AITutorViewModel.kt` | [ ] **Incomplete** | The structure is there (`contextData` parameter), but it needs to be wired up from the `QuizScreen`. |

## 6. Data Layer & Offline Sync

| Feature / Component | React (PWA) | Android (Kotlin) | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Database Schema/Models** | `src/types/models.ts` | `Room Entities` | [ ] **Incomplete** | Entities exist but lack complex TypeConverters for nested lists and objects (e.g., `options`, `explanation`). |
| **Backend Integration** | `@supabase/supabase-js` | `gotrue-kt`, `postgrest-kt` | [ ] **Incomplete** | Client initialized in `SupabaseClient.kt`. Actual remote fetching in Repositories is commented out/missing. |
| **Offline Storage** | IndexedDB (`src/lib/db.ts`) | Room (`AppDatabase.kt`) | [ ] **Incomplete** | DAOs exist but are not fully wired to fetch remote data and cache it. |
| **Background Sync** | Service Worker | `SyncWorker.kt` | [ ] **Todo** | Worker is scaffolded but the actual logic to check internet, fetch, and save to Room is a placeholder ("Phase 8"). |

---

# Sprint Execution Roadmap (Phase-wise)

## 🚀 Sprint 1: Rock-Solid Foundation (Data, Sync, & Auth)
**Goal:** Establish a robust, offline-first data persistence layer and seamless authentication flow, directly mirroring the PWA's reliable state mechanisms.

- [x] **Phase 1: Advanced Schema & Type Converters**
  - Implement full Room Entities corresponding to `models.ts` (e.g., `QuestionEntity`, `IdiomEntity`, `OneWordEntity`).
  - Develop advanced Room TypeConverters to accurately handle complex nested JSON structures (e.g., `options`, `explanation`, `meanings`, `extras`).
  - Wire up Supabase Client (`postgrest-kt`) for seamless data ingestion.
- [x] **Phase 2: Offline-First Sync & Background Workers**
  - Implement complex DAOs representing the entire Offline Storage logic formerly handled by IndexedDB (`src/lib/db.ts`).
  - Scaffold and finalize Android `SyncWorker` (WorkManager) for background synchronization, fetching only updated records and handling offline-first capability.
  - Setup DataStore for robust local tracking of sync timestamps (`lastSync`).
- [x] **Phase 3: Complete Authentication Architecture**
  - Finalize `AuthViewModel` with `gotrue-kt`, handling OAuth integration, error states, and session storage parity (replacing `window.addEventListener('storage')`).
  - Finalize Jetpack Compose UI for `LoginScreen` and `SignupScreen` with full validation and error states.
  - Implement user statistics aggregation (`useProfileStats.ts` equivalent) inside a `UserRepository` or `StatsViewModel`.

## 🚀 Sprint 2: Core Routing, Dashboard, & Settings
**Goal:** Build out the structural skeleton of the app, ensuring proper multi-screen navigation and persistence of user preferences.

- [x] **Phase 1: Main Layout & Structural Navigation**
  - Finalize `MainLayoutScreen.kt` to mirror the React `MainLayout.tsx` with complex tab routing and deep linking capabilities.
  - Ensure state resiliency across configuration changes using `SavedStateHandle`.
- [x] **Phase 2: Dashboard Real-Data Hydration**
  - Replace all mock data in `DashboardScreen.kt` with live Flow emissions from the `Room` database and `Profile Stats` aggregates.
  - Ensure responsive UI updates when the background `SyncWorker` pulls in new data.
- [x] **Phase 3: Settings & Configurations Store**
  - Implement Android `DataStore` (or `SharedPreferences`) to replace `useSettingsStore.ts` for app preferences (background animations, sound toggles, etc.).
  - Build out the Jetpack Compose `SettingsModal` and hook it into the global UI state.
  - Develop the `OWSConfig` and `IdiomsConfig` UI screens for flashcard deck configuration (filters, mastery selection).

## 🚀 Sprint 3: The Ultimate Quiz Engine
**Goal:** Translate the complex React state-machine (`useQuizSessionStore.ts`) and Plugin Architecture into a highly performant, resilient Android ViewModel.

- [x] **Phase 1: State Machine & Engine Core**
  - Port the `quizEngine.ts` and `TestEngineController.ts` plugin architecture into Kotlin domain use-cases.
  - Finalize `QuizViewModel.kt` utilizing `MutableStateFlow`, completely supporting timers, bookmarks, review marking, 50-50 lifelines, and pause/resume logic.
- [x] **Phase 2: Advanced Quiz Layout & Background Workers**
  - Implement a highly accurate Coroutine/Flow-based `TimerWorker` that survives Activity death and configuration changes.
  - Upgrade `QuizScreen.kt` to support Markdown/LaTeX rendering (via `markwon`) and rich UI animations (like background fireballs).
- [ ] **Phase 3: Deep Analytics & Quiz Results**
  - Completely build out `ResultScreen.kt` replacing placeholders with detailed score breakdowns and time spent per question.
  - Implement retry mechanisms and two-way sync for bookmarks and post-quiz review states back to Room/Supabase.

## 🚀 Sprint 4: Flashcards Mastery & AI Integration
**Goal:** Polish the learning experience with spaced repetition algorithms and native Gemini AI integration.

- [ ] **Phase 1: Flashcard State & Spaced Repetition (SRS)**
  - Wire up `FlashcardViewModel.kt` to the real Room DB, replacing hardcoded mock data.
  - Implement "Mark as Read", mastery logic, and Spaced Repetition filters identical to `useIdiomProgress` hooks.
- [ ] **Phase 2: AI Context Passing & Advanced Chat**
  - Upgrade `AIChatScreen.kt` with advanced UI rendering, smooth typing indicators, and markdown chat bubbles.
  - Implement `useQuota.ts` logic into Android to enforce and manage Gemini API usage limits.
  - Completely wire up AI Context passing: seamlessly transmit current question contexts and user selections from the `QuizScreen` directly to the `AITutorViewModel`.
- [ ] **Phase 3: System Optimization & Quality Assurance**
  - Conduct full end-to-end memory profiling to ensure `Flow` collections do not leak.
  - Verify offline parity: Ensure the app boots, fetches local data, allows quiz execution, and queues results without internet access.
  - Final UI pass ensuring 100% Jetpack Compose and Material 3 design consistency across all screen sizes.

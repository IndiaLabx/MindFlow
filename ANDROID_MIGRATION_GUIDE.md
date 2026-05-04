
# MindFlow Quiz: Comprehensive 6-Sprint Android Migration Guide

## 1. Executive Summary
This document provides a highly detailed, file-by-file mapping for converting the **MindFlow Quiz** PWA (React) into a **Native Android Application** (Kotlin/Jetpack Compose). The goal is **100% End-to-End Parity**, meaning every single feature, UI element, tool, and offline capability present in the `react-mindflow-app` directory must be accurately reproduced natively on Android.

## 2. Technology & Architecture Mapping
| Concept | MindFlow React (Current) | Android Native (Target) |
| :--- | :--- | :--- |
| **UI Framework** | React (Declarative), Tailwind CSS | Jetpack Compose, Material 3, custom Modifiers |
| **State Management** | Zustand (`useQuizSessionStore`), React Context | `ViewModel` + Kotlin `StateFlow` / `SharedFlow` |
| **Routing**| React Router (`<BrowserRouter>`) | Jetpack Navigation Compose |
| **Backend API** | `@supabase/supabase-js` | Supabase Kotlin (`gotrue-kt`, `postgrest-kt`) |
| **Offline DB** | IndexedDB (`src/lib/db.ts` wrapper) | Room Database (SQLite) + DAO + Coroutines |
| **Background Sync** | Service Workers (PWA) | Android WorkManager (`SyncWorker`) |
| **AI Integration** | `@google/genai` (Text & Live Audio) | `generativeai` (Google AI Client SDK for Android) |
| **Markdown / LaTeX**| `react-markdown`, `rehype-katex` | `Markwon` (via `AndroidView`) + KaTeX webview/render |

---

## 3. The 6-Sprint Comprehensive Migration Plan

### 🚀 Sprint 1: Data Foundations & Authentication Layer
**Goal:** Establish the rock-solid offline-first SQLite database and authentication pathways mapping directly to IndexedDB.

#### Phase 1.1: Core Data Models & Room Schema
*React Source:* `src/types/models.ts`, `src/features/quiz/types/index.ts`
*Android Target:* `app/src/main/java/com/mindflow/quiz/data/local/entity/*`
**Logic & Mapping:**
- Translate complex TypeScript models into Room `@Entity` data classes.
- Build robust `@TypeConverter` classes for nested JSON structures (e.g., `options: List<String>`, `explanation: ExplanationDto`).
- Must include entities for `User`, `Question`, `Idiom`, `OneWord`, `QuizHistory`, `Interaction`, and `ProfileStats`.

#### Phase 1.2: Offline-First Repository & Sync Worker
*React Source:* `src/lib/db.ts` (IndexedDB Wrapper), `src/workers/*`
*Android Target:* `InteractionRepository`, `QuizRepository`, `SyncWorker` (WorkManager)
**Logic & Mapping:**
- Replace the browser IndexedDB implementation with Room DAOs.
- Implement a `SyncWorker` using Android WorkManager that routinely pulls delta updates from Supabase (`postgrest-kt`) and merges them into Room.
- **CRITICAL:** Ensure exact parity with the complex collision handling currently found in `src/lib/db.ts`.

#### Phase 1.3: Authentication & User Profile
*React Source:* `src/features/auth/context/AuthContext.tsx`, `useProfileStats.ts`, Login UIs.
*Android Target:* `AuthViewModel`, `LoginScreen.kt`, `SignupScreen.kt`, `ProfileStatsRepository`
**Logic & Mapping:**
- Listen to `supabase.gotrue.sessionStatus`. Store tokens securely via EncryptedSharedPreferences/DataStore.
- Ensure the offline "Stats" calculations mirror the logic in `useProfileStats.ts`. Build the UI mirroring `src/features/auth/components/*`.

---

### 🚀 Sprint 2: Core Routing, UI Shell & Dashboard
**Goal:** Recreate the main layout, navigation, and primary dashboard screens along with peripheral modules.

#### Phase 2.1: Navigation Scaffold & Settings
*React Source:* `src/routes/AppRoutes.tsx`, `src/layouts/MainLayout.tsx`, `src/stores/useSettingsStore.ts`
*Android Target:* `AppNavigation.kt`, `MainLayoutScreen.kt`, `SettingsDataStore.kt`
**Logic & Mapping:**
- Create a `NavHost` bridging bottom bar routing. Ensure deep links (`mindflow://`) match PWA URL routing.
- Implement the exact animated route transitions.
- Map global settings (dark mode, sound toggles) via Jetpack DataStore instead of `localStorage`. Ensure the UI exactly mirrors `SettingsModal.tsx`.

#### Phase 2.2: The Dashboard & Feature Entry Points
*React Source:* `src/features/dashboard/Dashboard.tsx`, `DashboardSVGs.tsx`
*Android Target:* `DashboardScreen.kt`, `DashboardSVGs.kt` (VectorDrawables)
**Logic & Mapping:**
- Migrate the complex Grid layouts to Jetpack Compose `LazyVerticalGrid`.
- Map the beautiful SVGs into Compose `ImageVector` paths.
- Connect the live UI stats (Total Questions Attempted, Accuracy) to Room DB via `ProfileStatsRepository.getFlow()`.

#### Phase 2.3: About, School, & Notifications Module
*React Source:* `src/features/about/*`, `src/features/school/*`, `src/features/notifications/*`
*Android Target:* `AboutScreen.kt`, `SchoolConfigScreen.kt`, `NotificationSystem.kt`
**Logic & Mapping:**
- Map the static information pages exactly.
- For notifications, mirror `src/features/notifications/hooks/useNotifications.ts` with a `NotificationRepository.kt`.
- UIs like `AdminNotificationDashboard` (if applicable to the client) or standard bell dropdowns must be ported to Compose Modals/Drawers.

---

### 🚀 Sprint 3: The Quiz Engine & Execution
**Goal:** Translate the complex React state-machine and plugin system into a highly performant Android ViewModel architecture.

#### Phase 3.1: Quiz Engine Domain Logic
*React Source:* `src/features/quiz/engine/quizEngine.ts`, `TestEngineController.ts`, `plugins/*`
*Android Target:* `QuizEngine.kt`, `PluginRegistry.kt`, `McqPlugin.kt`
**Logic & Mapping:**
- The React app uses a Strategy/Plugin pattern for different question types. Map this directly to Kotlin interfaces (`interface QuizPlugin`).
- Port `EvaluateAnswerUseCase` that encapsulates scoring, lifelines (50-50), and time-tracking exactly as done in `quizEngine.ts`.

#### Phase 3.2: State Management (Zustand -> ViewModel)
*React Source:* `src/features/quiz/stores/useQuizSessionStore.ts`, `useTimer.ts`
*Android Target:* `QuizViewModel.kt`, `TimerWorker.kt`
**Logic & Mapping:**
- Convert the massive Zustand store into a tightly controlled `MutableStateFlow<QuizState>`.
- Handle complex state transitions (Pause, Resume, Timers) via Kotlin `suspend` functions inside the `viewModelScope`.
- Implement a robust `TimerWorker` utilizing Coroutines that survives configuration changes (Activity death/recreation).

#### Phase 3.3: Interactive Quiz UI & Components
*React Source:* `src/features/quiz/components/QuizQuestionDisplay.tsx`, `QuizOption.tsx`, `QuizExplanation.tsx`, `QuizLayout.tsx`
*Android Target:* `QuizScreen.kt`, `QuestionDisplay.kt`, `QuizOption.kt`
**Logic & Mapping:**
- Render Markdown/LaTeX using `io.noties.markwon` or a specialized Webview if KaTeX is heavily used.
- Implement exact UI parity for selected vs. correct vs. wrong option highlighting using Compose `Modifier.background()` animations.
- Integrate native `TextToSpeech` APIs to replace browser SpeechSynthesis.

---

### 🚀 Sprint 4: Advanced Quiz Analytics & Edge Cases
**Goal:** Recreate all specialized quiz modes, result screens, and complex post-quiz analytics.

#### Phase 4.1: Results, Mock Mode, & God Mode Analytics
*React Source:* `MockQuizResult.tsx`, `GodQuizResult.tsx`, `QuizStats.tsx`
*Android Target:* `ResultScreen.kt`, `GodResultScreen.kt`, `AnalyticsViewModel.kt`
**Logic & Mapping:**
- Complex data grids showing "Time spent per question", "Sectional Accuracy" must be built using Compose Custom Layouts.
- Mirror the exact charting libraries (or write custom Canvas drawings in Compose) to match the React UI exactly.
- God Mode analysis requires pulling extensive historical data; optimize Room queries to handle this without UI jank.

#### Phase 4.2: Live Quiz Room (Multiplayer/Sync)
*React Source:* `src/features/quiz/live/LiveQuizRoom.tsx`, `useLiveQuiz.ts`
*Android Target:* `LiveQuizScreen.kt`, `LiveQuizViewModel.kt`
**Logic & Mapping:**
- The React PWA uses Supabase Realtime for live sessions. Map this using `supabase.realtime` in Kotlin.
- Use Coroutine `Channels` and `StateFlow` to handle live event broadcasting to the UI (player joins, score updates, leaderboard sync).
- Ensure network resilience; if WebSockets drop, handle reconnection gracefully mirroring the PWA's logic.

#### Phase 4.3: Review System & Bookmarks
*React Source:* `src/features/quiz/components/QuizReview.tsx`, `AttemptedQuizzes.tsx`
*Android Target:* `QuizReviewScreen.kt`, `BookmarkDao.kt`, `HistoryScreen.kt`
**Logic & Mapping:**
- Port the UI for reviewing past mistakes and flagged questions.
- Establish bilateral sync with the Room Database and Supabase for bookmarks.
- Filter and list attempted quizzes identically to the React implementation.

---

### 🚀 Sprint 5: Flashcards Mastery & AI Interactions
**Goal:** Implement the Spaced Repetition systems and the complex Gemini Multimodal integrations with strict 1:1 parity.

#### Phase 5.1: Flashcards (Idioms & OWS) UI & Logic
*React Source:* `src/features/idioms/*`, `src/features/ows/*`, `src/features/flashcards/components/Flashcard.tsx`, `useIdiomProgress.ts`
*Android Target:* `FlashcardViewModel.kt`, `FlashcardScreen.kt`, `IdiomsConfigScreen.kt`
**Logic & Mapping:**
- Match the CSS 3D transform (`rotateY`) identically in Compose using `Modifier.graphicsLayer { rotationY = animatable.value }`. Implement drag-to-swipe using `Modifier.pointerInput`.
- Implement the exact SRS (Spaced Repetition System) logic and mastery calculations currently housed in React hooks into a Kotlin Domain UseCase backed by Room.

#### Phase 5.2: AI Context Passing & Text Chat
*React Source:* `src/features/ai/chat/AIChatPage.tsx`, `useAIChat.ts`, `ChatInput.tsx`, `useQuota.ts`
*Android Target:* `AIChatScreen.kt`, `AITutorViewModel.kt`, `QuotaManager.kt`
**Logic & Mapping:**
- Ensure the "Ask AI Tutor" button actively passes the current question context string into `AIChatScreen` via Navigation arguments or a SharedViewModel.
- Implement UI for Markdown chat bubbles (using `Markwon`).
- **Crucial:** Implement the "Grounding with Google" toggles, Model Selection dropdowns, and PDF Export feature from `AIChatPage.tsx` using Google GenAI Android SDK.
- Mirror `useQuota.ts` exactly into `QuotaManager.kt` using DataStore.

#### Phase 5.3: AI Multimodal Voice Talk
*React Source:* `src/features/ai/talk/VoiceBlobVisualizer.tsx`, `useLiveAPI.ts`
*Android Target:* `AILiveVoiceScreen.kt`, `VoiceBlobVisualizer.kt` (Canvas), `LiveVoiceViewModel.kt`
**Logic & Mapping:**
- Implement the Gemini Live Multimodal API via WebSockets/Android SDK.
- Use Android `AudioRecord` to stream audio buffers.
- Convert the React `VoiceBlobVisualizer` to a Jetpack Compose `Canvas` drawing that accurately reacts to raw PCM amplitude data, mapping states (`idle`, `listening`, `speaking`).

---

### 🚀 Sprint 6: Productivity Tools & Final Optimization
**Goal:** Port the final standalone utility features and conduct rigorous performance profiling.

#### Phase 6.1: Generators (PDF, PPT, Bilingual)
*React Source:* `src/features/tools/quiz-pdf-ppt-generator/*`, `src/features/tools/bilingual-pdf-maker/*`, `pdfGenerator.ts`, `pptGenerator.ts`
*Android Target:* `PdfGeneratorTool.kt`, `PptGeneratorTool.kt`, `BilingualPdfScreen.kt`
**Logic & Mapping:**
- In React, this uses libraries like `jsPDF` and `PptxGenJS`.
- In Android, use native `android.graphics.pdf.PdfDocument` for PDF generation, or integrate a third-party Java PDF/PPTX library (like Apache POI for PPTX) to achieve exact output parity. Build the complex UI configuring these exports (`GeneratorModal.tsx`).

#### Phase 6.2: Text Exporter & Flashcard Maker
*React Source:* `src/features/tools/text-exporter/TextExporter.tsx`, `src/features/tools/flashcard-maker/FlashcardMaker.tsx`, `canvasDrawing.ts`
*Android Target:* `TextExporterScreen.kt`, `FlashcardMakerScreen.kt`, `CanvasDrawingUtils.kt`
**Logic & Mapping:**
- The Text Exporter requires a robust Markdown editor natively, complete with live preview mapping to `react-markdown`.
- Flashcard maker involves complex HTML5 Canvas drawing in React. Map this directly to Jetpack Compose `Canvas` or Android `Bitmap` manipulation for rendering text, drawing borders, and exporting custom flashcard images to the device gallery.

#### Phase 6.3: System Optimization & Memory Parity
**Goal:** Ensure the Android app handles garbage collection gracefully and matches the PWA's resilience.
*React Source:* Global architecture, Service Workers.
*Android Target:* Entire application layer, `SyncWorker`.
**Logic & Mapping:**
- Audit all `StateFlow` collections to ensure `collectAsStateWithLifecycle()` is used over `collectAsState()` to prevent background memory leaks.
- Profile Compose recompositions for UI jank, especially in heavy lists like the Dashboard and Flashcards.
- Thoroughly test the WorkManager `SyncWorker` in Airplane mode to verify 100% offline parity with the IndexedDB implementation.

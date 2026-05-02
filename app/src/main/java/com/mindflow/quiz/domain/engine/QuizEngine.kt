package com.mindflow.quiz.domain.engine

import com.mindflow.quiz.domain.engine.plugins.PluginRegistry
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class QuizEngine(
    private val pluginRegistry: PluginRegistry
) {
    private val _stateFlow = MutableStateFlow<QuizState>(QuizState.Loading)
    val stateFlow: StateFlow<QuizState> = _stateFlow.asStateFlow()

    fun dispatch(event: QuizEvent) {
        val currentState = _stateFlow.value
        val nextState = reduce(currentState, event)
        _stateFlow.value = nextState
    }

    // Allow initializing with an existing state (useful when restoring from SavedStateHandle)
    fun restoreState(state: QuizState) {
        _stateFlow.value = state
    }

    private fun reduce(state: QuizState, event: QuizEvent): QuizState {
        // Handle global events that don't depend on the Active state
        if (event is QuizEvent.StartQuiz) {
            return startQuiz(event)
        }

        if (event is QuizEvent.LoadSavedQuiz) {
            return event.state
        }

        if (state !is QuizState.Active) {
            return state // Most events require the quiz to be active
        }

        return when (event) {
            is QuizEvent.AnswerQuestion,
            is QuizEvent.UseFiftyFifty -> handlePluginEvent(state, event)

            is QuizEvent.NextQuestion -> handleNavigation(state, delta = 1)
            is QuizEvent.PrevQuestion -> handleNavigation(state, delta = -1)
            is QuizEvent.JumpToQuestion -> handleJump(state, event.index)

            is QuizEvent.ToggleBookmark -> handleBookmark(state, event.questionId)
            is QuizEvent.ToggleReview -> handleReview(state, event.questionId)

            is QuizEvent.PauseQuiz -> state.copy(timer = state.timer.copy(isPaused = true))
            is QuizEvent.ResumeQuiz -> state.copy(timer = state.timer.copy(isPaused = false))

            is QuizEvent.TimerTick -> handleTimerTick(state, event.deltaSeconds)

            is QuizEvent.FinishQuiz -> finishQuiz(state)
            is QuizEvent.RestartQuiz -> restartQuiz(state)
            is QuizEvent.WindowFocusChanged -> handleWindowFocus(state, event.hasFocus)

            is QuizEvent.StartQuiz,
            is QuizEvent.LoadSavedQuiz -> state // Already handled
        }
    }

    private fun startQuiz(event: QuizEvent.StartQuiz): QuizState {
        if (event.questions.isEmpty()) return QuizState.Loading

        val totalTime = if (event.mode == QuizMode.MOCK) event.questions.size * 60 else 0
        val remainingTimes = if (event.mode == QuizMode.LEARNING) {
            event.questions.associate { it.id to 60 }
        } else {
            emptyMap()
        }

        return QuizState.Active(
            mode = event.mode,
            questions = event.questions,
            filters = event.filters,
            timer = TimerState(
                quizTimeRemaining = totalTime,
                questionTime = remainingTimes
            )
        )
    }

    private fun handlePluginEvent(state: QuizState.Active, event: QuizEvent): QuizState {
        val currentQuestion = state.questions.getOrNull(state.progress.currentIndex)
            ?: return state

        val plugin = pluginRegistry.getPlugin(currentQuestion)
        return plugin.process(state, event)
    }

    private fun handleNavigation(state: QuizState.Active, delta: Int): QuizState {
        val newIndex = state.progress.currentIndex + delta
        if (newIndex in state.questions.indices) {
            return state.copy(progress = state.progress.copy(currentIndex = newIndex))
        } else if (newIndex >= state.questions.size) {
             return finishQuiz(state)
        }
        return state
    }

    private fun handleJump(state: QuizState.Active, index: Int): QuizState {
        if (index in state.questions.indices) {
            return state.copy(progress = state.progress.copy(currentIndex = index))
        }
        return state
    }

    private fun handleBookmark(state: QuizState.Active, questionId: String): QuizState {
        val currentBookmarks = state.progress.bookmarks.toMutableSet()
        if (!currentBookmarks.add(questionId)) {
            currentBookmarks.remove(questionId) // toggle off
        }
        return state.copy(progress = state.progress.copy(bookmarks = currentBookmarks))
    }

    private fun handleReview(state: QuizState.Active, questionId: String): QuizState {
        val currentReviews = state.progress.markedForReview.toMutableSet()
        if (!currentReviews.add(questionId)) {
            currentReviews.remove(questionId) // toggle off
        }
        return state.copy(progress = state.progress.copy(markedForReview = currentReviews))
    }

    private fun handleTimerTick(state: QuizState.Active, deltaSeconds: Int): QuizState {
        if (state.timer.isPaused) return state

        val currentQuestionId = state.questions.getOrNull(state.progress.currentIndex)?.id ?: return state
        val timerState = state.timer
        val progress = state.progress

        // Update time taken for current question
        val newTimeTaken = progress.timeTaken.toMutableMap()
        newTimeTaken[currentQuestionId] = (newTimeTaken[currentQuestionId] ?: 0) + deltaSeconds
        val updatedProgress = progress.copy(timeTaken = newTimeTaken)

        if (state.mode == QuizMode.LEARNING) {
            val prevRemaining = timerState.questionTime[currentQuestionId] ?: 60
            if (prevRemaining > 0) {
                val newRemainingMap = timerState.questionTime + (currentQuestionId to (prevRemaining - deltaSeconds).coerceAtLeast(0))
                return state.copy(
                    progress = updatedProgress,
                    timer = timerState.copy(questionTime = newRemainingMap)
                )
            }
            return state.copy(progress = updatedProgress)
        } else {
            // MOCK mode
            if (timerState.quizTimeRemaining > 0) {
                val newRemaining = (timerState.quizTimeRemaining - deltaSeconds).coerceAtLeast(0)
                val newState = state.copy(
                    progress = updatedProgress,
                    timer = timerState.copy(quizTimeRemaining = newRemaining)
                )
                if (newRemaining == 0) {
                    return finishQuiz(newState) // auto finish
                }
                return newState
            }
        }
        return state.copy(progress = updatedProgress)
    }

    private fun handleWindowFocus(state: QuizState.Active, hasFocus: Boolean): QuizState {
        if (hasFocus) return state

        val newFaults = state.progress.cheatFaults + 1
        val newState = state.copy(progress = state.progress.copy(cheatFaults = newFaults))

        if (newFaults >= 3) {
            return finishQuiz(newState)
        }
        return newState
    }

    private fun finishQuiz(state: QuizState.Active): QuizState {
        // Score is now tracked dynamically in progress.score, but we can verify it here or just use it.
        val finalScore = state.progress.score

        return QuizState.Finished(
            mode = state.mode,
            questions = state.questions,
            progress = state.progress,
            score = finalScore,
            timer = state.timer
        )
    }

    private fun restartQuiz(state: QuizState.Active): QuizState {
        val startEvent = QuizEvent.StartQuiz(questions = state.questions, mode = state.mode)
        return startQuiz(startEvent)
    }
}

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

            is QuizEvent.StartQuiz -> state // Already handled, just to satisfy exhaustive when
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

        if (state.mode == QuizMode.LEARNING) {
            val prevRemaining = timerState.questionTime[currentQuestionId] ?: 60
            if (prevRemaining > 0) {
                val newRemainingMap = timerState.questionTime + (currentQuestionId to (prevRemaining - deltaSeconds).coerceAtLeast(0))
                return state.copy(timer = timerState.copy(questionTime = newRemainingMap))
            }
            return state
        } else {
            // MOCK mode
            if (timerState.quizTimeRemaining > 0) {
                val newRemaining = (timerState.quizTimeRemaining - deltaSeconds).coerceAtLeast(0)
                val newState = state.copy(timer = timerState.copy(quizTimeRemaining = newRemaining))
                if (newRemaining == 0) {
                    return finishQuiz(newState) // auto finish
                }
                return newState
            }
        }
        return state
    }

    private fun finishQuiz(state: QuizState.Active): QuizState {
        // Calculate basic score
        var score = 0
        state.questions.forEach { q ->
            val answer = state.progress.answers[q.id]
            if (answer is AnswerPayload.Single && answer.option == q.correctAnswer) {
                score++
            }
        }

        // Mock time taken calculation. This should really be tracked per-question in the progress if needed.
        // For now, we'll keep it simple as per original requirements or pass an empty map.
        val timeTakenMap = emptyMap<String, Int>()

        return QuizState.Finished(
            mode = state.mode,
            questions = state.questions,
            progress = state.progress,
            score = score,
            timer = state.timer
        )
    }

    private fun restartQuiz(state: QuizState.Active): QuizState {
        val startEvent = QuizEvent.StartQuiz(questions = state.questions, mode = state.mode)
        return startQuiz(startEvent)
    }
}

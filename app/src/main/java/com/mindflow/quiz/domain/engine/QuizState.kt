package com.mindflow.quiz.domain.engine

enum class QuizMode {
    LEARNING,
    MOCK
}

data class QuizProgress(
    val currentIndex: Int = 0,
    val answers: Map<String, AnswerPayload> = emptyMap(),
    val markedForReview: Set<String> = emptySet(),
    val bookmarks: Set<String> = emptySet()
)

data class TimerState(
    val quizTimeRemaining: Int = 0,
    val questionTime: Map<String, Int> = emptyMap(),
    val isPaused: Boolean = false
)

data class LifelineState(
    val usedFiftyFifty: Set<String> = emptySet(),
    val hiddenOptions: Map<String, List<String>> = emptyMap()
)

sealed class QuizState {
    data object Loading : QuizState()

    data class Active(
        val mode: QuizMode,
        val questions: List<Question>,
        val progress: QuizProgress = QuizProgress(),
        val timer: TimerState = TimerState(),
        val lifelines: LifelineState = LifelineState()
    ) : QuizState()

    data class Finished(
        val mode: QuizMode,
        val questions: List<Question>,
        val progress: QuizProgress,
        val score: Int,
        val timer: TimerState
    ) : QuizState()
}

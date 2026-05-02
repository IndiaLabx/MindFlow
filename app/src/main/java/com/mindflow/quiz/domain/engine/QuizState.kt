package com.mindflow.quiz.domain.engine


data class InitialFilters(
    val subject: String? = null,
    val topic: String? = null,
    val subTopic: String? = null,
    val difficulty: String? = null,
    val questionType: String? = null,
    val examName: String? = null,
    val examYear: String? = null,
    val examDateShift: String? = null,
    val tags: List<String> = emptyList()
)

enum class QuizMode {
    LEARNING,
    MOCK
}

data class QuizProgress(
    val currentIndex: Int = 0,
    val answers: Map<String, AnswerPayload> = emptyMap(),
    val markedForReview: Set<String> = emptySet(),
    val bookmarks: Set<String> = emptySet(),
    val timeTaken: Map<String, Int> = emptyMap(),
    val score: Int = 0,
    val cheatFaults: Int = 0
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
        val filters: InitialFilters? = null,
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

package com.mindflow.quiz.domain.engine

sealed class AnswerPayload {
    data class Single(val option: String) : AnswerPayload()
    data class Multiple(val options: List<String>) : AnswerPayload()
    data class Text(val value: String) : AnswerPayload()
}

sealed class QuizEvent {
    data class StartQuiz(val questions: List<Question>, val filters: InitialFilters? = null, val mode: QuizMode = QuizMode.LEARNING) : QuizEvent()
    data class AnswerQuestion(val questionId: String, val answer: AnswerPayload) : QuizEvent()
    data object NextQuestion : QuizEvent()
    data object PrevQuestion : QuizEvent()
    data class JumpToQuestion(val index: Int) : QuizEvent()
    data class ToggleBookmark(val questionId: String) : QuizEvent()
    data class ToggleReview(val questionId: String) : QuizEvent()
    data class UseFiftyFifty(val questionId: String) : QuizEvent()
    data object PauseQuiz : QuizEvent()
    data object ResumeQuiz : QuizEvent()
    data object FinishQuiz : QuizEvent()
    data object RestartQuiz : QuizEvent()
    data class TimerTick(val deltaSeconds: Int = 1) : QuizEvent()
    data class WindowFocusChanged(val hasFocus: Boolean) : QuizEvent()
    data class LoadSavedQuiz(val state: QuizState.Active) : QuizEvent()
}

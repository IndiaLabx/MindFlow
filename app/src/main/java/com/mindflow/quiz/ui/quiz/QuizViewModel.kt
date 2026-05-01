package com.mindflow.quiz.ui.quiz

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mindflow.quiz.data.local.dao.QuizHistoryDao
import com.mindflow.quiz.data.local.entity.QuizHistoryEntity
import com.mindflow.quiz.data.local.entity.SubjectStats
import com.mindflow.quiz.data.repository.QuizRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.util.UUID

class QuizViewModel(
    private val repository: QuizRepository,
    private val quizHistoryDao: QuizHistoryDao,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val _uiState = MutableStateFlow(
        savedStateHandle.get<QuizState>("quiz_state") ?: QuizState()
    )
    val uiState: StateFlow<QuizState> = _uiState.asStateFlow()

    private var timerJob: Job? = null

    init {
        val state = _uiState.value
        if (state.status == "quiz" && !state.isPaused) {
            startTimer()
        }
    }

    fun startQuizForSubject(subject: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            // Get first emission from Flow
            val questions = repository.getQuestionsBySubject(subject).firstOrNull() ?: emptyList()

            val newState = QuizState(
                status = "quiz",
                activeQuestions = questions,
                isLoading = false,
                quizTimeRemaining = questions.size * 60 // 1 min per question default
            )
            _uiState.value = newState
            savedStateHandle["quiz_state"] = newState
            startTimer()
        }
    }

    fun onEvent(event: QuizEvent) {
        val currentState = _uiState.value
        when (event) {
            is QuizEvent.StartQuiz -> {
                val questions = event.questions
                val remainingTimes = if (event.mode == "learning") {
                    questions.associate { it.id to 60 } // Default 60s per question in learning
                } else {
                    emptyMap()
                }

                val globalTime = if (event.mode == "mock" || event.mode == "god") {
                    questions.size * 60 // 1 min per question
                } else 0

                val newState = currentState.copy(
                    status = "quiz",
                    mode = event.mode,
                    activeQuestions = questions,
                    currentQuestionIndex = 0,
                    score = 0,
                    answers = emptyMap(),
                    timeTaken = emptyMap(),
                    quizTimeRemaining = globalTime,
                    remainingTimes = remainingTimes,
                    bookmarks = emptyList(),
                    markedForReview = emptyList(),
                    hiddenOptions = emptyMap(),
                    isPaused = false
                )
                _uiState.value = newState
                savedStateHandle["quiz_state"] = newState
                startTimer()
            }
            is QuizEvent.AnswerQuestion -> {
                val question = currentState.activeQuestions.find { it.id == event.questionId }
                val isCorrect = question?.correct == event.answer

                val prevAnswer = currentState.answers[event.questionId]
                var newScore = currentState.score

                if (prevAnswer == null) {
                    if (isCorrect) newScore++
                } else {
                    val wasCorrect = question?.correct == prevAnswer
                    if (wasCorrect && !isCorrect) newScore--
                    if (!wasCorrect && isCorrect) newScore++
                }

                val prevTime = currentState.timeTaken[event.questionId] ?: 0

                val newState = currentState.copy(
                    answers = currentState.answers + (event.questionId to event.answer),
                    timeTaken = currentState.timeTaken + (event.questionId to (prevTime + event.timeTaken)),
                    score = newScore
                )
                _uiState.value = newState
                savedStateHandle["quiz_state"] = newState
            }
            is QuizEvent.LogTimeSpent -> {
                val prevTime = currentState.timeTaken[event.questionId] ?: 0
                val newState = currentState.copy(
                    timeTaken = currentState.timeTaken + (event.questionId to (prevTime + event.timeTaken))
                )
                _uiState.value = newState
                savedStateHandle["quiz_state"] = newState
            }
            is QuizEvent.SaveTimer -> {
                val newState = currentState.copy(
                    remainingTimes = currentState.remainingTimes + (event.questionId to event.time)
                )
                _uiState.value = newState
                savedStateHandle["quiz_state"] = newState
            }
            is QuizEvent.SyncGlobalTimer -> {
                val newState = currentState.copy(
                    quizTimeRemaining = event.time
                )
                _uiState.value = newState
                savedStateHandle["quiz_state"] = newState
            }
            is QuizEvent.NextQuestion -> {
                val nextIndex = currentState.currentQuestionIndex + 1
                if (nextIndex >= currentState.activeQuestions.size) {
                    finishQuiz(currentState)
                } else {
                    val newState = currentState.copy(currentQuestionIndex = nextIndex)
                    _uiState.value = newState
                    savedStateHandle["quiz_state"] = newState
                }
            }
            is QuizEvent.PrevQuestion -> {
                val prevIndex = maxOf(0, currentState.currentQuestionIndex - 1)
                val newState = currentState.copy(currentQuestionIndex = prevIndex)
                _uiState.value = newState
                savedStateHandle["quiz_state"] = newState
            }
            is QuizEvent.JumpToQuestion -> {
                val newState = currentState.copy(currentQuestionIndex = event.index)
                _uiState.value = newState
                savedStateHandle["quiz_state"] = newState
            }
            is QuizEvent.ToggleBookmark -> {
                val isBookmarked = currentState.bookmarks.contains(event.questionId)
                val newBookmarks = if (isBookmarked) {
                    currentState.bookmarks.filter { it != event.questionId }
                } else {
                    currentState.bookmarks + event.questionId
                }
                val newState = currentState.copy(bookmarks = newBookmarks)
                _uiState.value = newState
                savedStateHandle["quiz_state"] = newState
            }
            is QuizEvent.ToggleReview -> {
                val isMarked = currentState.markedForReview.contains(event.questionId)
                val newMarked = if (isMarked) {
                    currentState.markedForReview.filter { it != event.questionId }
                } else {
                    currentState.markedForReview + event.questionId
                }
                val newState = currentState.copy(markedForReview = newMarked)
                _uiState.value = newState
                savedStateHandle["quiz_state"] = newState
            }
            is QuizEvent.UseFiftyFifty -> {
                val newState = currentState.copy(
                    hiddenOptions = currentState.hiddenOptions + (event.questionId to event.hiddenOptions)
                )
                _uiState.value = newState
                savedStateHandle["quiz_state"] = newState
            }
            is QuizEvent.PauseQuiz -> {
                var newRemainingTimes = currentState.remainingTimes
                if (event.questionId != null && event.remainingTime != null) {
                    newRemainingTimes = newRemainingTimes + (event.questionId to event.remainingTime)
                }
                val newState = currentState.copy(
                    isPaused = true,
                    remainingTimes = newRemainingTimes
                )
                _uiState.value = newState
                savedStateHandle["quiz_state"] = newState
            }
            is QuizEvent.ResumeQuiz -> {
                val newState = currentState.copy(isPaused = false)
                _uiState.value = newState
                savedStateHandle["quiz_state"] = newState
            }
            is QuizEvent.FinishQuiz -> {
                finishQuiz(currentState)
            }
            is QuizEvent.RestartQuiz -> {
                val globalTime = if (currentState.mode == "mock" || currentState.mode == "god") {
                    currentState.activeQuestions.size * 60
                } else 0

                val remainingTimes = if (currentState.mode == "learning") {
                    currentState.activeQuestions.associate { it.id to 60 }
                } else emptyMap()

                val newState = currentState.copy(
                    status = "quiz",
                    currentQuestionIndex = 0,
                    score = 0,
                    answers = emptyMap(),
                    timeTaken = emptyMap(),
                    quizTimeRemaining = globalTime,
                    remainingTimes = remainingTimes,
                    bookmarks = emptyList(),
                    markedForReview = emptyList(),
                    hiddenOptions = emptyMap(),
                    isPaused = false
                )
                _uiState.value = newState
                savedStateHandle["quiz_state"] = newState
                startTimer()
            }
        }
    }

    private fun finishQuiz(currentState: QuizState) {
        stopTimer()
        val newState = currentState.copy(status = "result")
        _uiState.value = newState
        savedStateHandle["quiz_state"] = newState

        // Save History
        viewModelScope.launch {
            val totalQuestions = currentState.activeQuestions.size
            val totalCorrect = currentState.score
            val totalAnswered = currentState.answers.size
            val totalIncorrect = totalAnswered - totalCorrect
            val totalSkipped = totalQuestions - totalAnswered
            val totalTimeSpent = currentState.timeTaken.values.sum()
            val overallAccuracy = if (totalAnswered > 0) totalCorrect.toDouble() / totalAnswered else 0.0

            val subjectStatsMap = mutableMapOf<String, SubjectStats>()
            currentState.activeQuestions.forEach { q ->
                val answer = currentState.answers[q.id]
                val currentStats = subjectStatsMap[q.subject] ?: SubjectStats(0, 0, 0, 0, 0.0)

                val updatedStats = if (answer != null) {
                    if (answer == q.correct) {
                        currentStats.copy(correct = currentStats.correct + 1, attempted = currentStats.attempted + 1)
                    } else {
                        currentStats.copy(incorrect = currentStats.incorrect + 1, attempted = currentStats.attempted + 1)
                    }
                } else {
                    currentStats.copy(skipped = currentStats.skipped + 1)
                }

                // Recalculate accuracy for the subject
                val accuracy = if (updatedStats.attempted > 0) updatedStats.correct.toDouble() / updatedStats.attempted else 0.0
                subjectStatsMap[q.subject] = updatedStats.copy(accuracy = accuracy)
            }

            val historyEntry = QuizHistoryEntity(
                id = UUID.randomUUID().toString(),
                date = System.currentTimeMillis(),
                totalQuestions = totalQuestions,
                totalCorrect = totalCorrect,
                totalIncorrect = totalIncorrect,
                totalSkipped = totalSkipped,
                totalTimeSpent = totalTimeSpent,
                overallAccuracy = overallAccuracy,
                difficulty = "Mixed", // Basic implementation
                subjectStats = subjectStatsMap,
                isSynced = false // We need to sync this to server later
            )

            quizHistoryDao.insertHistory(historyEntry)
        }
    }


    private fun startTimer() {
        stopTimer()
        timerJob = viewModelScope.launch {
            while (isActive) {
                delay(1000)
                tickTimer()
            }
        }
    }

    private fun stopTimer() {
        timerJob?.cancel()
        timerJob = null
    }

    private fun tickTimer() {
        val currentState = _uiState.value
        if (currentState.isPaused || currentState.status != "quiz" || currentState.activeQuestions.isEmpty()) return

        val currentQuestionId = currentState.activeQuestions.getOrNull(currentState.currentQuestionIndex)?.id ?: return

        // Always update time taken for current question
        val prevTimeTaken = currentState.timeTaken[currentQuestionId] ?: 0
        val newTimeTakenMap = currentState.timeTaken + (currentQuestionId to (prevTimeTaken + 1))

        if (currentState.mode == "learning") {
            val prevRemaining = currentState.remainingTimes[currentQuestionId] ?: 60
            if (prevRemaining > 0) {
                val newRemainingMap = currentState.remainingTimes + (currentQuestionId to (prevRemaining - 1))
                val newState = currentState.copy(
                    timeTaken = newTimeTakenMap,
                    remainingTimes = newRemainingMap
                )
                _uiState.value = newState
                savedStateHandle["quiz_state"] = newState
            } else {
                val newState = currentState.copy(
                    timeTaken = newTimeTakenMap
                )
                _uiState.value = newState
                savedStateHandle["quiz_state"] = newState
            }
        } else if (currentState.mode == "mock" || currentState.mode == "god") {
            if (currentState.quizTimeRemaining > 0) {
                val newState = currentState.copy(
                    timeTaken = newTimeTakenMap,
                    quizTimeRemaining = currentState.quizTimeRemaining - 1
                )
                _uiState.value = newState
                savedStateHandle["quiz_state"] = newState
            } else if (currentState.mode == "mock") {
                // Auto finish if time is up in mock mode
                onEvent(QuizEvent.FinishQuiz)
            } else {
                // God mode - time can go negative or stop
                val newState = currentState.copy(
                    timeTaken = newTimeTakenMap
                )
                _uiState.value = newState
                savedStateHandle["quiz_state"] = newState
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        stopTimer()
    }
}

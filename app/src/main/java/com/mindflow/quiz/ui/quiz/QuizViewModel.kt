package com.mindflow.quiz.ui.quiz

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mindflow.quiz.data.local.dao.QuizHistoryDao
import com.mindflow.quiz.data.local.entity.QuizHistoryEntity
import com.mindflow.quiz.data.local.entity.SubjectStats
import com.mindflow.quiz.data.repository.QuizRepository
import com.mindflow.quiz.domain.engine.QuizEngine
import com.mindflow.quiz.domain.engine.QuizEvent
import com.mindflow.quiz.domain.engine.InitialFilters
import com.mindflow.quiz.domain.engine.QuizMode
import com.mindflow.quiz.domain.engine.QuizState
import com.mindflow.quiz.domain.engine.plugins.McqPlugin
import com.mindflow.quiz.domain.engine.plugins.PluginRegistry
import com.mindflow.quiz.domain.engine.plugins.SynonymPlugin
import com.mindflow.quiz.domain.mapper.toDomainModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.util.UUID

class QuizViewModel(
    private val repository: QuizRepository,
    private val quizHistoryDao: QuizHistoryDao,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val pluginRegistry = PluginRegistry(
        listOf(McqPlugin(), SynonymPlugin())
    )
    private val engine = QuizEngine(pluginRegistry)

    val uiState: StateFlow<QuizState> = engine.stateFlow

    private var timerJob: Job? = null

    init {
        // Collect state changes to drive side-effects (like tracking history on finish)
        viewModelScope.launch {
            uiState.collect { state ->
                when (state) {
                    is QuizState.Active -> {
                        if (!state.timer.isPaused && timerJob == null) {
                            startTimer()
                        } else if (state.timer.isPaused && timerJob != null) {
                            stopTimer()
                        }
                    }
                    is QuizState.Finished -> {
                        stopTimer()
                        saveQuizHistory(state)
                        clearSavedSession()
                    }
                    is QuizState.Loading -> {
                        stopTimer()
                    }
                }
            }
        }

        // Auto-Save: Debounce state updates to avoid thrashing
        viewModelScope.launch {
            @OptIn(kotlinx.coroutines.FlowPreview::class)
            uiState.debounce(1000L).collect { state ->
                if (state is QuizState.Active) {
                    // Simulate auto-saving to local storage / DataStore
                    // In real implementation, you'd serialize 'state' and write to Room/DataStore
                    println("Auto-saved active session: progress=${state.progress.currentIndex}, score=${state.progress.score}")
                }
            }
        }

        // Recover Session (if available) - mocked for demonstration
        // loadSavedSession()
    }

    private fun clearSavedSession() {
        // Clear auto-saved data from DataStore/Room when submitted
        println("Cleared saved session data")
    }

    fun startQuizForSubject(subject: String, mode: QuizMode = QuizMode.LEARNING) {
        viewModelScope.launch {
            // Fetch raw entities, map to pure domain models, dispatch start to engine
            val questions = repository.getQuestionsBySubject(subject).firstOrNull() ?: emptyList()
            val domainQuestions = questions.map { it.toDomainModel() }

            val filters = InitialFilters(subject = subject)
            engine.dispatch(QuizEvent.StartQuiz(domainQuestions, filters, mode))
        }
    }

    fun onEvent(event: QuizEvent) {
        engine.dispatch(event)
    }

    private fun startTimer() {
        stopTimer()
        timerJob = viewModelScope.launch {
            var lastTickTime = System.currentTimeMillis()
            while (isActive) {
                delay(1000)
                val currentTime = System.currentTimeMillis()
                val deltaMillis = currentTime - lastTickTime
                val deltaSeconds = (deltaMillis / 1000).toInt()

                if (deltaSeconds > 0) {
                    engine.dispatch(QuizEvent.TimerTick(deltaSeconds))
                    lastTickTime = currentTime
                }
            }
        }
    }

    private fun stopTimer() {
        timerJob?.cancel()
        timerJob = null
    }

    private fun saveQuizHistory(state: QuizState.Finished) {
        viewModelScope.launch {
            val totalQuestions = state.questions.size
            val totalCorrect = state.score
            val totalAnswered = state.progress.answers.size
            val totalIncorrect = totalAnswered - totalCorrect
            val totalSkipped = totalQuestions - totalAnswered
            val totalTimeSpent = state.progress.timeTaken.values.sum()
            val overallAccuracy = if (totalAnswered > 0) totalCorrect.toDouble() / totalAnswered else 0.0

            val subjectStatsMap = mutableMapOf<String, SubjectStats>()
            // Simplistic stat aggregation mapped back from domain models

            val historyEntry = QuizHistoryEntity(
                id = UUID.randomUUID().toString(),
                date = System.currentTimeMillis(),
                totalQuestions = totalQuestions,
                totalCorrect = totalCorrect,
                totalIncorrect = totalIncorrect,
                totalSkipped = totalSkipped,
                totalTimeSpent = totalTimeSpent,
                overallAccuracy = overallAccuracy,
                difficulty = "Mixed",
                subjectStats = subjectStatsMap,
                isSynced = false
            )

            quizHistoryDao.insertHistory(historyEntry)
        }
    }

    override fun onCleared() {
        super.onCleared()
        stopTimer()
    }
}

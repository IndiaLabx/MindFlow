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
import com.mindflow.quiz.domain.engine.QuizMode
import com.mindflow.quiz.domain.engine.QuizState
import com.mindflow.quiz.domain.engine.plugins.McqPlugin
import com.mindflow.quiz.domain.engine.plugins.PluginRegistry
import com.mindflow.quiz.domain.engine.plugins.SynonymPlugin
import com.mindflow.quiz.domain.mapper.toDomainModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
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
                    }
                    is QuizState.Loading -> {
                        stopTimer()
                    }
                }
            }
        }
    }

    fun startQuizForSubject(subject: String, mode: QuizMode = QuizMode.LEARNING) {
        viewModelScope.launch {
            // Fetch raw entities, map to pure domain models, dispatch start to engine
            val questions = repository.getQuestionsBySubject(subject).firstOrNull() ?: emptyList()
            val domainQuestions = questions.map { it.toDomainModel() }

            engine.dispatch(QuizEvent.StartQuiz(domainQuestions, mode))
        }
    }

    fun onEvent(event: QuizEvent) {
        engine.dispatch(event)
    }

    private fun startTimer() {
        stopTimer()
        timerJob = viewModelScope.launch {
            while (isActive) {
                delay(1000)
                engine.dispatch(QuizEvent.TimerTick(1))
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
            val totalTimeSpent = 0 // Needs to be calculated from timer metrics realistically
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

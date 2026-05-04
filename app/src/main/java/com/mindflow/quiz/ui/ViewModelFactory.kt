package com.mindflow.quiz.ui

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.createSavedStateHandle
import androidx.lifecycle.viewmodel.CreationExtras
import com.mindflow.quiz.data.local.AppDatabase
import com.mindflow.quiz.data.repository.ProfileStatsRepository
import com.mindflow.quiz.data.repository.QuizRepository
import com.mindflow.quiz.data.repository.IdiomsRepository
import com.mindflow.quiz.data.repository.OneWordRepository
import com.mindflow.quiz.ui.dashboard.MainViewModel
import com.mindflow.quiz.ui.dashboard.DashboardViewModel
import com.mindflow.quiz.ui.quiz.QuizViewModel
import com.mindflow.quiz.ui.flashcards.FlashcardViewModel
import com.mindflow.quiz.ui.ai.AITutorViewModel

class ViewModelFactory(private val context: Context) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
        val database = AppDatabase.getDatabase(context)

        if (modelClass.isAssignableFrom(DashboardViewModel::class.java)) {
            val profileStatsRepository = ProfileStatsRepository(database.quizHistoryDao())
            @Suppress("UNCHECKED_CAST")
            return DashboardViewModel(profileStatsRepository) as T
        }
        if (modelClass.isAssignableFrom(QuizViewModel::class.java)) {
            val quizRepository = QuizRepository(database.questionDao())
            val savedStateHandle = extras.createSavedStateHandle()
            @Suppress("UNCHECKED_CAST")
            return QuizViewModel(quizRepository, database.quizHistoryDao(), savedStateHandle) as T
        }
        if (modelClass.isAssignableFrom(FlashcardViewModel::class.java)) {
            val idiomsRepository = IdiomsRepository(database.idiomDao())
            val oneWordRepository = OneWordRepository(database.oneWordDao())
            @Suppress("UNCHECKED_CAST")
            val interactionRepository = com.mindflow.quiz.data.repository.InteractionRepository(database.interactionDao())
            return FlashcardViewModel(idiomsRepository, oneWordRepository, interactionRepository) as T
        }
        if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
            val savedStateHandle = extras.createSavedStateHandle()
            @Suppress("UNCHECKED_CAST")
            return MainViewModel(savedStateHandle) as T
        }
        if (modelClass.isAssignableFrom(AITutorViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return AITutorViewModel(context) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

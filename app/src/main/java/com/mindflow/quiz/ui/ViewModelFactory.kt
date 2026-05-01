package com.mindflow.quiz.ui

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.createSavedStateHandle
import androidx.lifecycle.viewmodel.CreationExtras
import com.mindflow.quiz.data.local.AppDatabase
import com.mindflow.quiz.data.repository.ProfileStatsRepository
import com.mindflow.quiz.data.repository.QuizRepository
import com.mindflow.quiz.ui.dashboard.DashboardViewModel
import com.mindflow.quiz.ui.quiz.QuizViewModel

class ViewModelFactory(private val context: Context) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
        if (modelClass.isAssignableFrom(DashboardViewModel::class.java)) {
            val database = AppDatabase.getDatabase(context)
            val profileStatsRepository = ProfileStatsRepository(database.quizHistoryDao())
            @Suppress("UNCHECKED_CAST")
            return DashboardViewModel(profileStatsRepository) as T
        }
        if (modelClass.isAssignableFrom(QuizViewModel::class.java)) {
            val database = AppDatabase.getDatabase(context)
            val quizRepository = QuizRepository(database.questionDao())
            val savedStateHandle = extras.createSavedStateHandle()
            @Suppress("UNCHECKED_CAST")
            return QuizViewModel(savedStateHandle, quizRepository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

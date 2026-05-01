package com.mindflow.quiz.ui.settings

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class SettingsViewModel(application: Application) : AndroidViewModel(application) {
    private val dataStore = SettingsDataStore(application)

    val isBgAnimationsEnabled: StateFlow<Boolean> = dataStore.isBgAnimationsEnabled
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), true)

    val isSoundEnabled: StateFlow<Boolean> = dataStore.isSoundEnabled
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), true)

    val isDarkModeEnabled: StateFlow<Boolean> = dataStore.isDarkModeEnabled
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    fun toggleBgAnimations(enabled: Boolean) = viewModelScope.launch {
        dataStore.setBgAnimationsEnabled(enabled)
    }

    fun toggleSound(enabled: Boolean) = viewModelScope.launch {
        dataStore.setSoundEnabled(enabled)
    }

    fun toggleDarkMode(enabled: Boolean) = viewModelScope.launch {
        dataStore.setDarkModeEnabled(enabled)
    }
}

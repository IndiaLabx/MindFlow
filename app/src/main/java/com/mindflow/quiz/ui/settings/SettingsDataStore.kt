package com.mindflow.quiz.ui.settings

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.settingsDataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class SettingsDataStore(private val context: Context) {
    companion object {
        val BG_ANIMATIONS_ENABLED = booleanPreferencesKey("bg_animations_enabled")
        val SOUND_ENABLED = booleanPreferencesKey("sound_enabled")
        val DARK_MODE_ENABLED = booleanPreferencesKey("dark_mode_enabled")
    }

    val isBgAnimationsEnabled: Flow<Boolean> = context.settingsDataStore.data.map { it[BG_ANIMATIONS_ENABLED] ?: true }
    val isSoundEnabled: Flow<Boolean> = context.settingsDataStore.data.map { it[SOUND_ENABLED] ?: true }
    val isDarkModeEnabled: Flow<Boolean> = context.settingsDataStore.data.map { it[DARK_MODE_ENABLED] ?: false }

    suspend fun setBgAnimationsEnabled(enabled: Boolean) {
        context.settingsDataStore.edit { it[BG_ANIMATIONS_ENABLED] = enabled }
    }

    suspend fun setSoundEnabled(enabled: Boolean) {
        context.settingsDataStore.edit { it[SOUND_ENABLED] = enabled }
    }

    suspend fun setDarkModeEnabled(enabled: Boolean) {
        context.settingsDataStore.edit { it[DARK_MODE_ENABLED] = enabled }
    }
}

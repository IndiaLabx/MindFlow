package com.mindflow.quiz.ui.ai

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

private val Context.quotaDataStore: DataStore<Preferences> by preferencesDataStore(name = "quota_prefs")

data class ModelConfig(
    val id: String,
    val displayName: String,
    val rpm: Int,
    val tpm: Int,
    val rpd: Int
)

object ModelConfigs {
    val GEMINI_2_5_FLASH_LITE = ModelConfig(
        id = "gemini-2.5-flash-lite",
        displayName = "Fast 2x",
        rpm = 10,
        tpm = 250000,
        rpd = 20
    )
}

class QuotaManager(private val context: Context) {
    companion object {
        private val REQUESTS_TODAY = intPreferencesKey("requests_today")
        private val LAST_RESET_DATE = stringPreferencesKey("last_reset_date")
    }

    private val dataStore = context.quotaDataStore

    // In-memory RPM tracking
    private val requestsLastMinute = mutableListOf<Long>()

    private fun getCurrentDateString(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        return sdf.format(Date())
    }

    suspend fun checkCanRequest(modelConfig: ModelConfig = ModelConfigs.GEMINI_2_5_FLASH_LITE): Result<Unit> {
        val today = getCurrentDateString()
        val prefs = dataStore.data.first()
        val lastReset = prefs[LAST_RESET_DATE] ?: ""
        var requestsToday = prefs[REQUESTS_TODAY] ?: 0

        if (lastReset != today) {
            // Reset daily count
            requestsToday = 0
            dataStore.edit { preferences ->
                preferences[REQUESTS_TODAY] = 0
                preferences[LAST_RESET_DATE] = today
            }
        }

        if (requestsToday >= (modelConfig.rpd - 1)) {
            return Result.failure(Exception("Daily limit reached for \${modelConfig.displayName}. Please switch models."))
        }

        // Clean up old timestamps for RPM check
        val now = System.currentTimeMillis()
        val oneMinAgo = now - 60000
        requestsLastMinute.removeAll { it < oneMinAgo }

        if (requestsLastMinute.size >= (modelConfig.rpm - 1)) {
            return Result.failure(Exception("You are speaking too fast. Please wait a minute."))
        }

        return Result.success(Unit)
    }

    suspend fun trackRequest() {
        val today = getCurrentDateString()

        dataStore.edit { preferences ->
            val lastReset = preferences[LAST_RESET_DATE] ?: ""
            val currentRequests = if (lastReset == today) (preferences[REQUESTS_TODAY] ?: 0) else 0

            preferences[REQUESTS_TODAY] = currentRequests + 1
            preferences[LAST_RESET_DATE] = today
        }

        requestsLastMinute.add(System.currentTimeMillis())
    }
}

package com.mindflow.quiz.ui.quiz

import androidx.lifecycle.SavedStateHandle
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class TimerWorker(private val savedStateHandle: SavedStateHandle) {

    private var job: Job? = null

    // Using SavedStateHandle to survive configuration changes and process death
    private val lastTickTimeKey = "timer_last_tick_time"
    private val isRunningKey = "timer_is_running"

    private val _tickFlow = MutableStateFlow(0)
    val tickFlow: StateFlow<Int> = _tickFlow.asStateFlow()

    fun start(scope: CoroutineScope, onTick: (Int) -> Unit) {
        if (savedStateHandle.get<Boolean>(isRunningKey) == true && job != null) return

        savedStateHandle[isRunningKey] = true

        // Calculate catch-up time if we were killed
        val lastTickTime = savedStateHandle.get<Long>(lastTickTimeKey) ?: System.currentTimeMillis()
        val currentTime = System.currentTimeMillis()
        val missedTicks = ((currentTime - lastTickTime) / 1000).toInt()

        if (missedTicks > 0) {
            onTick(missedTicks)
        }

        savedStateHandle[lastTickTimeKey] = currentTime

        job = scope.launch {
            while (isActive) {
                delay(1000)
                savedStateHandle[lastTickTimeKey] = System.currentTimeMillis()
                _tickFlow.value += 1
                onTick(1)
            }
        }
    }

    fun stop() {
        job?.cancel()
        job = null
        savedStateHandle[isRunningKey] = false
        savedStateHandle.remove<Long>(lastTickTimeKey)
    }
}

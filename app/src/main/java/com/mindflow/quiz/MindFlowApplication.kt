package com.mindflow.quiz

import android.app.Application
import android.util.Log

class MindFlowApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        Log.d("MindFlowApplication", "Application started. Sync worker disabled for UI-first MVP phase.")
        // setupSyncWorker() // Commented out for MVP UI dev
    }

    /*
    private fun setupSyncWorker() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        // Periodic Sync (Every 24 hours)
        val periodicSyncRequest = PeriodicWorkRequestBuilder<SyncWorker>(24, TimeUnit.HOURS)
            .setConstraints(constraints)
            .build()

        val workManager = WorkManager.getInstance(this)

        workManager.enqueueUniquePeriodicWork(
            "PeriodicDataSync",
            ExistingPeriodicWorkPolicy.KEEP,
            periodicSyncRequest
        )

        // Bootstrapping: Also enqueue a one-time request to run immediately (if needed)
        // WorkManager handles uniqueness and network availability.
        val immediateSyncRequest = OneTimeWorkRequestBuilder<SyncWorker>()
            .setConstraints(constraints)
            .build()

        workManager.enqueueUniqueWork(
            "ImmediateDataSync",
            ExistingWorkPolicy.KEEP,
            immediateSyncRequest
        )
    }
    */
}

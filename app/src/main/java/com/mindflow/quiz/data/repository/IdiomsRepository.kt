package com.mindflow.quiz.data.repository

import com.mindflow.quiz.data.local.dao.IdiomDao
import com.mindflow.quiz.data.local.entity.IdiomEntity
import com.mindflow.quiz.data.remote.SupabaseClientConfig
import com.mindflow.quiz.data.remote.dto.IdiomDto
import com.mindflow.quiz.data.remote.dto.toEntity
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.onStart

class IdiomsRepository(
    private val idiomDao: IdiomDao
) {
    fun observeAllIdioms(): Flow<List<IdiomEntity>> = idiomDao.observeAllIdioms().onStart {
        fetchFromRemote()
    }

    suspend fun fetchFromRemote() {
        try {
            val remoteData = SupabaseClientConfig.client.postgrest["idiom"]
                .select().decodeList<IdiomDto>()

            val entities = remoteData.map { it.toEntity() }
            idiomDao.insertIdioms(entities)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun updateIdiomStatus(id: String, status: String) {
        idiomDao.updateStatus(id, status, System.currentTimeMillis(), "PENDING_UPDATE")
        // Ideally, we trigger a SyncWorker or attempt a network call here
        // For now, we update local and mark syncStatus as PENDING_UPDATE
    }
}

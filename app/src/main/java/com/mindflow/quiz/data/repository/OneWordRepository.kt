package com.mindflow.quiz.data.repository

import com.mindflow.quiz.data.local.dao.OneWordDao
import com.mindflow.quiz.data.local.entity.OneWordEntity
import com.mindflow.quiz.data.remote.SupabaseClientConfig
import com.mindflow.quiz.data.remote.dto.OneWordDto
import com.mindflow.quiz.data.remote.dto.toEntity
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.onStart

class OneWordRepository(
    private val oneWordDao: OneWordDao
) {
    fun observeAllOneWords(): Flow<List<OneWordEntity>> = oneWordDao.observeAllOneWords().onStart {
        fetchFromRemote()
    }

    suspend fun fetchFromRemote() {
        try {
            val remoteData = SupabaseClientConfig.client.postgrest["ows"]
                .select().decodeList<OneWordDto>()

            val entities = remoteData.map { it.toEntity() }
            oneWordDao.insertOneWords(entities)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun updateOneWordStatus(id: String, status: String) {
        oneWordDao.updateStatus(id, status, System.currentTimeMillis(), "PENDING_UPDATE")
    }
}

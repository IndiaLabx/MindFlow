package com.mindflow.quiz.data.repository

import com.mindflow.quiz.data.local.dao.InteractionDao
import com.mindflow.quiz.data.local.entity.InteractionEntity
import kotlinx.coroutines.flow.Flow

class InteractionRepository(
    private val interactionDao: InteractionDao
) {
    fun observeInteractionsByType(type: String): Flow<List<InteractionEntity>> {
        return interactionDao.observeInteractionsByType(type)
    }

    suspend fun toggleReadStatus(itemId: String, type: String, currentStatus: Boolean) {
        val interaction = InteractionEntity(
            itemId = itemId,
            type = type,
            isRead = !currentStatus,
            lastInteractedAt = System.currentTimeMillis(),
            isSynced = false
        )
        interactionDao.insertInteraction(interaction)
    }

    suspend fun markAsRead(itemId: String, type: String) {
        val interaction = InteractionEntity(
            itemId = itemId,
            type = type,
            isRead = true,
            lastInteractedAt = System.currentTimeMillis(),
            isSynced = false
        )
        interactionDao.insertInteraction(interaction)
    }
}

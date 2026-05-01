package com.mindflow.quiz.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.mindflow.quiz.data.local.entity.InteractionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface InteractionDao {
    @Query("SELECT * FROM interactions WHERE type = :type")
    fun observeInteractionsByType(type: String): Flow<List<InteractionEntity>>

    @Query("SELECT * FROM interactions WHERE isSynced = 0")
    suspend fun getUnsyncedInteractions(): List<InteractionEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertInteraction(interaction: InteractionEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertInteractions(interactions: List<InteractionEntity>)

    @Query("UPDATE interactions SET isSynced = 1 WHERE itemId IN (:itemIds)")
    suspend fun markAsSynced(itemIds: List<String>)
}

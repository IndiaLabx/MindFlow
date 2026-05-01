package com.mindflow.quiz.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.mindflow.quiz.data.local.entity.OneWordEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface OneWordDao {
    @Query("SELECT * FROM one_words")
    fun observeAllOneWords(): Flow<List<OneWordEntity>>

    @Query("SELECT * FROM one_words")
    suspend fun getAllOneWords(): List<OneWordEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOneWords(oneWords: List<OneWordEntity>)

    @Query("UPDATE one_words SET status = :status, updatedAt = :updatedAt, syncStatus = :syncStatus WHERE id = :id")
    suspend fun updateStatus(id: String, status: String, updatedAt: Long, syncStatus: String)

    @Query("DELETE FROM one_words")
    suspend fun clearAll()
}

package com.mindflow.quiz.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.mindflow.quiz.data.local.entity.IdiomEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface IdiomDao {
    @Query("SELECT * FROM idioms")
    fun observeAllIdioms(): Flow<List<IdiomEntity>>

    @Query("SELECT * FROM idioms")
    suspend fun getAllIdioms(): List<IdiomEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertIdioms(idioms: List<IdiomEntity>)

    @Query("UPDATE idioms SET status = :status, updatedAt = :updatedAt, syncStatus = :syncStatus WHERE id = :id")
    suspend fun updateStatus(id: String, status: String, updatedAt: Long, syncStatus: String)

    @Query("DELETE FROM idioms")
    suspend fun clearAll()
}

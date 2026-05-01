package com.mindflow.quiz.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "interactions")
data class InteractionEntity(
    @PrimaryKey val itemId: String, // idiomId or wordId
    val type: String, // "idiom" or "ows"
    val isRead: Boolean,
    val lastInteractedAt: Long,
    val isSynced: Boolean = false
)

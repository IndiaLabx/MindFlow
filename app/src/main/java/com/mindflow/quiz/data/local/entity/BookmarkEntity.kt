package com.mindflow.quiz.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "bookmarks")
data class BookmarkEntity(
    @PrimaryKey val questionId: String,
    val bookmarkedAt: Long,
    val isSynced: Boolean = false
)

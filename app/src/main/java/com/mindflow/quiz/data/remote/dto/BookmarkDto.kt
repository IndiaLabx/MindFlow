package com.mindflow.quiz.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class BookmarkDto(
    @SerialName("question_id") val questionId: String,
    @SerialName("bookmarked_at") val bookmarkedAt: Long
)

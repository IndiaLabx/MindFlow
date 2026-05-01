package com.mindflow.quiz.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class InteractionDto(
    @SerialName("item_id") val itemId: String,
    @SerialName("type") val type: String,
    @SerialName("is_read") val isRead: Boolean,
    @SerialName("last_interacted_at") val lastInteractedAt: Long
)

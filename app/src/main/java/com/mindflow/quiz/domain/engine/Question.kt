package com.mindflow.quiz.domain.engine

data class Question(
    val id: String,
    val type: String,
    val text: String,
    val options: List<String>,
    val correctAnswer: String,
    val metadata: Map<String, String> = emptyMap(),
    val explanation: String? = null,
    val subject: String = ""
)

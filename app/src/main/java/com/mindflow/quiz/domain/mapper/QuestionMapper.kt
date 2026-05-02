package com.mindflow.quiz.domain.mapper

import com.mindflow.quiz.data.local.entity.QuestionEntity
import com.mindflow.quiz.domain.engine.Question

fun QuestionEntity.toDomainModel(): Question {
    return Question(
        id = this.id,
        type = this.questionType,
        text = this.questionEn,
        options = this.optionsEn,
        correctAnswer = this.correct,
        subject = this.subject,
        explanation = this.explanation?.summary,
        metadata = mapOf(
            "examName" to this.examName,
            "difficulty" to this.difficulty
        )
    )
}

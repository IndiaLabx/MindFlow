package com.mindflow.quiz.data.remote.dto

import com.mindflow.quiz.data.local.entity.QuestionEntity
import com.mindflow.quiz.data.local.entity.QuestionExplanation
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

fun QuestionDto.toEntity(): QuestionEntity {
    val explanationObj = explanation?.jsonObject

    return QuestionEntity(
        id = id,
        v1Id = v1Id,
        examName = examName ?: "",
        examYear = examYear ?: 0,
        examDateShift = examDateShift,
        subject = subject ?: "",
        topic = topic ?: "",
        subTopic = subTopic,
        tags = tags ?: emptyList(),
        difficulty = difficulty ?: "",
        questionType = questionType ?: "",
        questionEn = question ?: "",
        questionHi = questionHi,
        optionsEn = options ?: emptyList(),
        optionsHi = optionsHi,
        correct = correct ?: "",

        explanation = if (explanationObj != null) {
            QuestionExplanation(
                summary = explanationObj["summary"]?.jsonPrimitive?.content,
                analysisCorrect = explanationObj["analysis_correct"]?.jsonPrimitive?.content,
                analysisIncorrect = explanationObj["analysis_incorrect"]?.jsonPrimitive?.content,
                conclusion = explanationObj["conclusion"]?.jsonPrimitive?.content,
                fact = explanationObj["fact"]?.jsonPrimitive?.content
            )
        } else {
            null
        },

        updatedAt = System.currentTimeMillis(), // We could parse `createdAt` but System time works for simple sync.
        syncStatus = "SYNCED"
    )
}

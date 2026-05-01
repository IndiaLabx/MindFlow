package com.mindflow.quiz.data.local.entity

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import kotlinx.serialization.Serializable

@Serializable
@Parcelize
data class QuestionExplanation(
    val summary: String? = null,
    val analysisCorrect: String? = null,
    val analysisIncorrect: String? = null,
    val conclusion: String? = null,
    val fact: String? = null
) : Parcelable

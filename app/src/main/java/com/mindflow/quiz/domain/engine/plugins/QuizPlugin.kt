package com.mindflow.quiz.domain.engine.plugins

import com.mindflow.quiz.domain.engine.Question
import com.mindflow.quiz.domain.engine.QuizEvent
import com.mindflow.quiz.domain.engine.QuizState

interface QuizPlugin {
    fun supports(question: Question): Boolean
    fun process(state: QuizState.Active, event: QuizEvent): QuizState
}

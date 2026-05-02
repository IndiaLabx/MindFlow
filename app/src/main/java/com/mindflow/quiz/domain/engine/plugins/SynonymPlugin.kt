package com.mindflow.quiz.domain.engine.plugins

import com.mindflow.quiz.domain.engine.AnswerPayload
import com.mindflow.quiz.domain.engine.Question
import com.mindflow.quiz.domain.engine.QuizEvent
import com.mindflow.quiz.domain.engine.QuizState

class SynonymPlugin : QuizPlugin {
    override fun supports(question: Question): Boolean {
        return question.type.equals("synonym", ignoreCase = true)
    }

    override fun process(state: QuizState.Active, event: QuizEvent): QuizState {
        val currentQuestion = state.questions.getOrNull(state.progress.currentIndex)
            ?: return state

        return when (event) {
            is QuizEvent.AnswerQuestion -> {
                if (event.questionId != currentQuestion.id) return state

                val newAnswers = state.progress.answers.toMutableMap()
                newAnswers[currentQuestion.id] = event.answer

                state.copy(
                    progress = state.progress.copy(answers = newAnswers)
                )
            }
            // Synonyms might not support 50-50, or if they do, we'd handle it here
            else -> state
        }
    }
}

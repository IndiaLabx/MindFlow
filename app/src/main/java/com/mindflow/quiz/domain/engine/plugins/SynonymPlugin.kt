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
                val previousAnswer = newAnswers[currentQuestion.id]
                newAnswers[currentQuestion.id] = event.answer

                val newAnswerPayload = event.answer
                var newScore = state.progress.score

                val isNowCorrect = newAnswerPayload is AnswerPayload.Single && newAnswerPayload.option == currentQuestion.correctAnswer
                val wasCorrect = previousAnswer is AnswerPayload.Single && previousAnswer.option == currentQuestion.correctAnswer

                if (previousAnswer == null) {
                    if (isNowCorrect) newScore++
                } else {
                    if (wasCorrect && !isNowCorrect) newScore--
                    if (!wasCorrect && isNowCorrect) newScore++
                }

                state.copy(
                    progress = state.progress.copy(
                        answers = newAnswers,
                        score = newScore
                    )
                )
            }
            // Synonyms might not support 50-50, or if they do, we'd handle it here
            else -> state
        }
    }
}

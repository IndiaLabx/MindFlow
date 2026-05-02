package com.mindflow.quiz.domain.engine.plugins

import com.mindflow.quiz.domain.engine.AnswerPayload
import com.mindflow.quiz.domain.engine.LifelineState
import com.mindflow.quiz.domain.engine.Question
import com.mindflow.quiz.domain.engine.QuizEvent
import com.mindflow.quiz.domain.engine.QuizProgress
import com.mindflow.quiz.domain.engine.QuizState

class McqPlugin : QuizPlugin {
    override fun supports(question: Question): Boolean {
        // Handle single-choice MCQ types. Adapt condition as per actual DB types.
        return question.type == "mcq" || question.type.isBlank()
    }

    override fun process(state: QuizState.Active, event: QuizEvent): QuizState {
        val currentQuestion = state.questions.getOrNull(state.progress.currentIndex)
            ?: return state

        return when (event) {
            is QuizEvent.AnswerQuestion -> handleAnswer(state, currentQuestion, event)
            is QuizEvent.UseFiftyFifty -> handleFiftyFifty(state, currentQuestion, event)
            else -> state
        }
    }

    private fun handleAnswer(
        state: QuizState.Active,
        currentQuestion: Question,
        event: QuizEvent.AnswerQuestion
    ): QuizState {
        if (event.questionId != currentQuestion.id) return state

        val newAnswers = state.progress.answers.toMutableMap()
        newAnswers[currentQuestion.id] = event.answer

        return state.copy(
            progress = state.progress.copy(answers = newAnswers)
        )
    }

    private fun handleFiftyFifty(
        state: QuizState.Active,
        currentQuestion: Question,
        event: QuizEvent.UseFiftyFifty
    ): QuizState {
        if (event.questionId != currentQuestion.id) return state

        val usedList = state.lifelines.usedFiftyFifty
        if (usedList.contains(currentQuestion.id)) return state // Already used

        // Calculate options to hide. We hide exactly 2 wrong options assuming 4 total.
        val options = currentQuestion.options
        val correctAnswer = currentQuestion.correctAnswer
        val incorrectOptions = options.filter { it != correctAnswer }

        val hidden = if (incorrectOptions.size >= 2) {
            incorrectOptions.shuffled().take(2)
        } else {
            incorrectOptions
        }

        val newHiddenOptions = state.lifelines.hiddenOptions.toMutableMap()
        newHiddenOptions[currentQuestion.id] = hidden

        val newUsed = usedList.toMutableSet()
        newUsed.add(currentQuestion.id)

        return state.copy(
            lifelines = state.lifelines.copy(
                usedFiftyFifty = newUsed,
                hiddenOptions = newHiddenOptions
            )
        )
    }
}

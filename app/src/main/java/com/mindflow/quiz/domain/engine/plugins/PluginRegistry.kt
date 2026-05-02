package com.mindflow.quiz.domain.engine.plugins

import com.mindflow.quiz.domain.engine.Question

class PluginRegistry(
    private val plugins: List<QuizPlugin>
) {
    fun getPlugin(question: Question): QuizPlugin {
        return plugins.firstOrNull { it.supports(question) }
            ?: throw IllegalArgumentException("No suitable plugin found for question type: ${question.type}")
    }
}

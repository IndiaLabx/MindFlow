package com.mindflow.quiz.ui.ai

import android.content.Context
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import com.mindflow.quiz.domain.engine.Question
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import com.mindflow.quiz.BuildConfig
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch


@Serializable
data class AiExplanationResponse(
    val correct_answer: String? = null,
    val reasoning: String? = null,
    val exam_facts: List<String>? = null,
    val recent_news: String? = null,
    val interesting_facts: List<String>? = null,
    val fun_fact: String? = null
)

data class ChatMessage(
    val id: String,
    val text: String,
    val isUser: Boolean,
    val isError: Boolean = false
)

data class AITutorState(
    val messages: List<ChatMessage> = emptyList(),
    val isLoading: Boolean = false,
    val activeModel: ModelConfig = ModelConfigs.GEMINI_2_5_FLASH,
    val groundingEnabled: Boolean = false
)

class AITutorViewModel(private val context: Context) : ViewModel() {
    private val quotaManager = QuotaManager(context)

    private val _uiState = MutableStateFlow(AITutorState())
    val uiState: StateFlow<AITutorState> = _uiState.asStateFlow()

    private val generativeModel = GenerativeModel(
        modelName = "gemini-2.5-flash-lite",
        apiKey = BuildConfig.GEMINI_API_KEY
    )

    // We maintain a Chat instance to preserve context natively
    private val chat = generativeModel.startChat(
        history = listOf(
            content(role = "user") { text("I am studying for competitive exams.") },
            content(role = "model") { text("I am MindFlow AI, your highly adaptive and helpful learning assistant. How can I help you today?") }
        )
    )

    fun setModel(modelConfig: ModelConfig) {
        _uiState.value = _uiState.value.copy(activeModel = modelConfig)
        // Usually we would re-initialize the generative model here and preserve history.
        // For brevity we update state. In full parity we need a GenAI builder wrapper.
    }

    fun setGrounding(enabled: Boolean) {
        _uiState.value = _uiState.value.copy(groundingEnabled = enabled)
    }

    init {
        // Initial greeting
        _uiState.value = AITutorState(
            messages = listOf(
                ChatMessage(
                    id = java.util.UUID.randomUUID().toString(),
                    text = "I am MindFlow AI, your highly adaptive and helpful learning assistant. How can I help you today?",
                    isUser = false
                )
            )
        )
    }

fun sendMessage(userMessage: String, contextData: String? = null) {
        if (userMessage.isBlank()) return

        val newMessage = ChatMessage(
            id = java.util.UUID.randomUUID().toString(),
            text = userMessage,
            isUser = true
        )

        _uiState.value = _uiState.value.copy(
            messages = _uiState.value.messages + newMessage,
            isLoading = true
        )

        viewModelScope.launch {
            try {
                val quotaCheck = quotaManager.checkCanRequest(_uiState.value.activeModel)
                if (quotaCheck.isFailure) {
                    throw Exception(quotaCheck.exceptionOrNull()?.message ?: "Quota exceeded")
                }
                quotaManager.trackRequest()

                var fullPrompt = if (contextData != null) {
                    "Context: $contextData\n\nQuestion: $userMessage"
                } else {
                    userMessage
                }

                if (_uiState.value.groundingEnabled) {
                     fullPrompt += "\n\n[Please use your knowledge to provide up-to-date information.]"
                }

                val response = chat.sendMessage(fullPrompt)

                val aiResponse = ChatMessage(
                    id = java.util.UUID.randomUUID().toString(),
                    text = response.text ?: "I am sorry, I couldn't generate a response.",
                    isUser = false
                )

                _uiState.value = _uiState.value.copy(
                    messages = _uiState.value.messages + aiResponse,
                    isLoading = false
                )
            } catch (e: Exception) {
                val errorResponse = ChatMessage(
                    id = java.util.UUID.randomUUID().toString(),
                    text = "Error communicating with AI: ${e.localizedMessage}",
                    isUser = false,
                    isError = true
                )

                _uiState.value = _uiState.value.copy(
                    messages = _uiState.value.messages + errorResponse,
                    isLoading = false
                )
            }
        }
    }


    private val jsonFormatter = Json { ignoreUnknownKeys = true }

    fun generateStructuredExplanation(question: Question, onResult: (AiExplanationResponse?) -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch {
            try {
                val quotaCheck = quotaManager.checkCanRequest()
                if (quotaCheck.isFailure) {
                    onError(quotaCheck.exceptionOrNull()?.message ?: "Quota exceeded")
                    return@launch
                }
                quotaManager.trackRequest()

                val prompt = """
You are a knowledgeable and helpful tutor. Analyze this multiple-choice question and provide a detailed explanation.
Output must be strictly valid JSON.

Question: "\${question.text}"
Options: \${question.options}
Correct Answer: "\${question.correctAnswer}"

JSON Schema:
{
  "correct_answer": "The exact correct answer text",
  "reasoning": "Detailed explanation of why the answer is correct and why others are wrong. Use markdown for formatting (bullet points, bold, math equations if any).",
  "exam_facts": ["PYQ Fact 1 based on SSC CGL/UPSC/NDA/CDS etc.", "Fact 2"],
  "recent_news": "A short summary of recent news related to the topic. If none, write null.",
  "interesting_facts": ["Fact 1", "Fact 2"],
  "fun_fact": "A short fun fact related to the topic"
}
"""

                val response = generativeModel.generateContent(prompt)

                // Parse the response text which should be JSON
                val responseText = response.text ?: ""
                val jsonString = responseText.replace("```json", "").replace("```", "").trim()

                val explanationResponse = jsonFormatter.decodeFromString<AiExplanationResponse>(jsonString)
                onResult(explanationResponse)

            } catch (e: Exception) {
                onError("Failed to fetch explanation: \${e.localizedMessage}")
            }
        }
    }
}

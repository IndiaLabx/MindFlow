package com.mindflow.quiz.ui.quiz

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.outlined.Star
import androidx.compose.material.icons.outlined.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.mindflow.quiz.utils.TTSManager
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.ui.graphics.Color
import com.mindflow.quiz.ui.quiz.QuizExplanation

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuizScreen(
    quizViewModel: QuizViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToResult: () -> Unit,
    onNavigateToAI: () -> Unit = {}
) {
    val uiState by quizViewModel.uiState.collectAsState()
    val context = LocalContext.current
    val ttsManager = remember { TTSManager(context) }

    DisposableEffect(Unit) {
        onDispose { ttsManager.shutdown() }
    }

    LaunchedEffect(uiState.status) {
        if (uiState.status == "result") {
            onNavigateToResult()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (uiState.mode == "learning") "Learning Mode" else "Mock Quiz") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.Close, contentDescription = "Exit Quiz")
                    }
                },
                actions = {
                    IconButton(onClick = onNavigateToAI) {
                        Icon(Icons.Default.Star, contentDescription = "Ask AI")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            )
        }
    ) { innerPadding ->
        if (uiState.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (uiState.activeQuestions.isNotEmpty() && uiState.status == "quiz") {
            val currentQuestion = uiState.activeQuestions[uiState.currentQuestionIndex]
            val selectedAnswer = uiState.answers[currentQuestion.id]

            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(16.dp)
            ) {
                item {
                // Progress Indicator
                LinearProgressIndicator(
                    progress = (uiState.currentQuestionIndex + 1).toFloat() / uiState.activeQuestions.size,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp),
                    color = MaterialTheme.colorScheme.primary
                )

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Question ${uiState.currentQuestionIndex + 1} of ${uiState.activeQuestions.size}",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(8.dp))

Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = currentQuestion.questionEn,
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.weight(1f)
                    )
                    IconButton(onClick = { ttsManager.speak(currentQuestion.questionEn) }) {
                        Icon(Icons.Default.PlayArrow, contentDescription = "Read Question aloud")
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    val isBookmarked = uiState.bookmarks.contains(currentQuestion.id)
                    val isMarkedForReview = uiState.markedForReview.contains(currentQuestion.id)

                    IconButton(onClick = { quizViewModel.onEvent(QuizEvent.ToggleReview(currentQuestion.id)) }) {
                        Icon(
                            imageVector = if (isMarkedForReview) Icons.Filled.Warning else Icons.Outlined.Warning,
                            contentDescription = "Mark for Review",
                            tint = if (isMarkedForReview) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    IconButton(onClick = { quizViewModel.onEvent(QuizEvent.ToggleBookmark(currentQuestion.id)) }) {
                        Icon(
                            imageVector = if (isBookmarked) Icons.Filled.Star else Icons.Outlined.Star,
                            contentDescription = "Bookmark Question",
                            tint = if (isBookmarked) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))

                }

                items(currentQuestion.optionsEn) { option ->
                    val isSelected = selectedAnswer == option
                    val isCorrect = currentQuestion.correct == option
                    val showResult = selectedAnswer != null && uiState.mode == "learning"

                    val backgroundColor = when {
                        showResult && isCorrect -> Color(0xFFE8F5E9) // Green for correct
                        showResult && isSelected && !isCorrect -> Color(0xFFFFEBEE) // Red for incorrect selected
                        isSelected -> MaterialTheme.colorScheme.primaryContainer
                        else -> MaterialTheme.colorScheme.surface
                    }

                    val borderColor = when {
                        showResult && isCorrect -> Color(0xFF4CAF50)
                        showResult && isSelected && !isCorrect -> Color(0xFFF44336)
                        isSelected -> MaterialTheme.colorScheme.primary
                        else -> Color.Transparent
                    }

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp)
                            .clickable(enabled = selectedAnswer == null) {
                                quizViewModel.onEvent(QuizEvent.AnswerQuestion(currentQuestion.id, option, 10)) // Using 10 as dummy time Taken
                            },
                        border = if (borderColor != Color.Transparent) BorderStroke(2.dp, borderColor) else null,
                        colors = CardDefaults.cardColors(containerColor = backgroundColor),
                        shape = RoundedCornerShape(8.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = if (isSelected) 4.dp else 1.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = isSelected,
                                onClick = { if(selectedAnswer == null) quizViewModel.onEvent(QuizEvent.AnswerQuestion(currentQuestion.id, option, 10)) },
                                colors = RadioButtonDefaults.colors(
                                    selectedColor = if (showResult && isCorrect) Color(0xFF4CAF50) else if (showResult && isSelected && !isCorrect) Color(0xFFF44336) else MaterialTheme.colorScheme.primary
                                )
                            )
                            Spacer(modifier = Modifier.width(16.dp))
                            Text(text = option, style = MaterialTheme.typography.bodyLarge)
                        }
                    }
                }

                if (selectedAnswer != null && uiState.mode == "learning") {
                    item {
                        QuizExplanation(question = currentQuestion)
                    }
                }

                item {
                    Spacer(modifier = Modifier.height(32.dp))

                    Button(
                        onClick = { quizViewModel.onEvent(QuizEvent.NextQuestion) },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = selectedAnswer != null
                    ) {
                        val buttonText = if (uiState.currentQuestionIndex == uiState.activeQuestions.size - 1) "Finish Quiz" else "Next"
                        Text(text = buttonText, modifier = Modifier.padding(8.dp))
                    }
                }
            }
        }
    }
}

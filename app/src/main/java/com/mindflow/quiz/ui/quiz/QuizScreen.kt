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
import androidx.compose.ui.viewinterop.AndroidView
import io.noties.markwon.Markwon
import android.widget.TextView
import androidx.compose.ui.platform.LocalContext
import com.mindflow.quiz.domain.engine.QuizState
import com.mindflow.quiz.domain.engine.QuizEvent
import com.mindflow.quiz.domain.engine.QuizMode
import com.mindflow.quiz.domain.engine.AnswerPayload

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

    LaunchedEffect(uiState) {
        if (uiState is QuizState.Finished) {
            onNavigateToResult()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    val titleText = when (val state = uiState) {
                        is QuizState.Active -> if (state.mode == QuizMode.LEARNING) "Learning Mode" else "Mock Quiz"
                        else -> "Quiz"
                    }
                    Text(titleText)
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                },
                actions = {
                    IconButton(onClick = onNavigateToAI) {
                        Icon(Icons.Default.Star, contentDescription = "AI Tutor") // Using Star as a placeholder for AI
                    }
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp)
        ) {
            when (val state = uiState) {
                is QuizState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }
                is QuizState.Active -> {
                    if (state.questions.isNotEmpty()) {
                        val currentQuestion = state.questions[state.progress.currentIndex]
                        val selectedAnswer = state.progress.answers[currentQuestion.id]

                        // Header (Timer, Progress)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            val timeText = if (state.mode == QuizMode.LEARNING) {
                                val remaining = state.timer.questionTime[currentQuestion.id] ?: 60
                                "Time: ${remaining}s"
                            } else {
                                "Time: ${state.timer.quizTimeRemaining / 60}:${(state.timer.quizTimeRemaining % 60).toString().padStart(2, '0')}"
                            }
                            Text(text = timeText, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)

                            LinearProgressIndicator(
                                progress = (state.progress.currentIndex + 1).toFloat() / state.questions.size,
                                modifier = Modifier
                                    .weight(1f)
                                    .padding(horizontal = 16.dp)
                            )

                            Text(
                                text = "Question ${state.progress.currentIndex + 1} of ${state.questions.size}",
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        // Actions (TTS, 50-50, Bookmark, Review)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.End
                        ) {
                            if (state.timer.isPaused) {
                                IconButton(onClick = { quizViewModel.onEvent(QuizEvent.ResumeQuiz) }) {
                                    Icon(Icons.Default.PlayArrow, contentDescription = "Resume")
                                }
                            } else {
                                IconButton(onClick = { ttsManager.speak(currentQuestion.text) }) {
                                    Icon(Icons.Default.PlayArrow, contentDescription = "TTS")
                                }

                                if (state.mode == QuizMode.LEARNING && !state.lifelines.usedFiftyFifty.contains(currentQuestion.id)) {
                                    TextButton(onClick = { quizViewModel.onEvent(QuizEvent.UseFiftyFifty(currentQuestion.id)) }) {
                                        Text("50-50")
                                    }
                                }

                                val isBookmarked = state.progress.bookmarks.contains(currentQuestion.id)
                                val isMarkedForReview = state.progress.markedForReview.contains(currentQuestion.id)

                                IconButton(onClick = { quizViewModel.onEvent(QuizEvent.ToggleBookmark(currentQuestion.id)) }) {
                                    Icon(
                                        imageVector = if (isBookmarked) Icons.Filled.Star else Icons.Outlined.Star,
                                        contentDescription = "Bookmark",
                                        tint = if (isBookmarked) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }

                                IconButton(onClick = { quizViewModel.onEvent(QuizEvent.ToggleReview(currentQuestion.id)) }) {
                                    Icon(
                                        imageVector = if (isMarkedForReview) Icons.Filled.Warning else Icons.Outlined.Warning,
                                        contentDescription = "Review",
                                        tint = if (isMarkedForReview) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Question Area
                        if (state.timer.isPaused) {
                            Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                                Text("Quiz Paused", style = MaterialTheme.typography.headlineMedium)
                            }
                        } else {
                            val context = LocalContext.current
                            val markwon = remember(context) { Markwon.create(context) }
                            AndroidView(
                                factory = { ctx ->
                                    TextView(ctx).apply {
                                        setTextAppearance(android.R.style.TextAppearance_Material_Headline)
                                    }
                                },
                                update = { textView ->
                                    markwon.setMarkdown(textView, currentQuestion.text)
                                }
                            )

                            Spacer(modifier = Modifier.height(32.dp))

                            val hiddenOptions = state.lifelines.hiddenOptions[currentQuestion.id] ?: emptyList()
                            val showResult = selectedAnswer != null && state.mode == QuizMode.LEARNING
                            val selectedSingleOption = (selectedAnswer as? AnswerPayload.Single)?.option

                            LazyColumn(
                                modifier = Modifier.weight(1f),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                items(currentQuestion.options) { option ->
                                    if (!hiddenOptions.contains(option)) {
                                        val isSelected = option == selectedSingleOption
                                        val isCorrect = option == currentQuestion.correctAnswer

                                        val containerColor = if (showResult) {
                                            if (isCorrect) Color(0xFFE8F5E9) else if (isSelected) Color(0xFFFFEBEE) else MaterialTheme.colorScheme.surfaceVariant
                                        } else {
                                            if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant
                                        }

                                        val borderColor = if (showResult) {
                                            if (isCorrect) Color(0xFF4CAF50) else if (isSelected) Color(0xFFF44336) else Color.Transparent
                                        } else {
                                            if (isSelected) MaterialTheme.colorScheme.primary else Color.Transparent
                                        }

                                        Card(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .clickable(enabled = !showResult) {
                                                    quizViewModel.onEvent(QuizEvent.AnswerQuestion(currentQuestion.id, AnswerPayload.Single(option)))
                                                },
                                            shape = RoundedCornerShape(12.dp),
                                            colors = CardDefaults.cardColors(containerColor = containerColor),
                                            border = BorderStroke(1.dp, borderColor)
                                        ) {
                                            Text(
                                                text = option,
                                                modifier = Modifier.padding(16.dp),
                                                style = MaterialTheme.typography.bodyLarge
                                            )
                                        }
                                    }
                                }

                                if (selectedAnswer != null && state.mode == QuizMode.LEARNING) {
                                    item {
                                        QuizExplanation(question = currentQuestion)
                                    }
                                }
                            }
                        }

                        // Bottom Navigation
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            TextButton(
                                onClick = { quizViewModel.onEvent(QuizEvent.PrevQuestion) },
                                enabled = state.progress.currentIndex > 0
                            ) {
                                Text("Previous")
                            }

                            Button(
                                onClick = {
                                    if (state.progress.currentIndex == state.questions.size - 1) {
                                        quizViewModel.onEvent(QuizEvent.FinishQuiz)
                                    } else {
                                        quizViewModel.onEvent(QuizEvent.NextQuestion)
                                    }
                                }
                            ) {
                                val buttonText = if (state.progress.currentIndex == state.questions.size - 1) "Finish Quiz" else "Next"
                                Text(buttonText)
                            }
                        }
                    } else {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text("No questions found.")
                        }
                    }
                }
                is QuizState.Finished -> {
                    // Handled by LaunchedEffect
                }
            }
        } // End of Box
    }
}

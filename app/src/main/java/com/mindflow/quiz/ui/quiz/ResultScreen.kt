package com.mindflow.quiz.ui.quiz

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.mindflow.quiz.domain.engine.AnswerPayload
import com.mindflow.quiz.domain.engine.QuizEvent
import com.mindflow.quiz.domain.engine.QuizState

data class SubjectPerformance(
    val name: String,
    val total: Int,
    val attempted: Int,
    val correct: Int,
    val timeSpent: Int
) {
    val accuracy: Int get() = if (attempted > 0) ((correct.toFloat() / attempted) * 100).toInt() else 0
}

@Composable
fun ResultScreen(
    quizViewModel: QuizViewModel,
    onNavigateHome: () -> Unit,
    onRestartQuiz: () -> Unit
) {
    val uiState by quizViewModel.uiState.collectAsState()

    if (uiState !is QuizState.Finished) {
         Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
             CircularProgressIndicator()
         }
         return
    }

    val state = uiState as QuizState.Finished
    val totalQuestions = state.questions.size
    val correctAnswers = state.score
    val answeredQuestions = state.progress.answers.size
    val incorrectAnswers = answeredQuestions - correctAnswers
    val unattempted = totalQuestions - answeredQuestions

    val accuracy = if (answeredQuestions > 0) {
        (correctAnswers.toFloat() / answeredQuestions.toFloat()) * 100
    } else 0f

    var totalTime = 0
    var totalCorrectTime = 0
    var totalIncorrectTime = 0

    val subjectMap = mutableMapOf<String, SubjectPerformance>()

    state.progress.timeTaken.forEach { (questionId, time) ->
        totalTime += time
        val question = state.questions.find { it.id == questionId }
        val answer = state.progress.answers[questionId]

        if (question != null) {
            val subjectName = question.subject.ifEmpty { "General" }
            val currentPerf = subjectMap.getOrDefault(subjectName, SubjectPerformance(subjectName, 0, 0, 0, 0))

            var isCorrect = false
            var isAttempted = false

            if (answer is AnswerPayload.Single) {
                isAttempted = true
                if (answer.option == question.correctAnswer) {
                     isCorrect = true
                     totalCorrectTime += time
                 } else {
                     totalIncorrectTime += time
                 }
            }

            subjectMap[subjectName] = currentPerf.copy(
                total = currentPerf.total + 1, // Will recount later correctly
                attempted = currentPerf.attempted + (if (isAttempted) 1 else 0),
                correct = currentPerf.correct + (if (isCorrect) 1 else 0),
                timeSpent = currentPerf.timeSpent + time
            )
        }
    }

    // Correct total questions per subject
    val correctSubjectMap = mutableMapOf<String, SubjectPerformance>()
    state.questions.forEach { q ->
        val subjectName = q.subject.ifEmpty { "General" }
        val perf = correctSubjectMap.getOrDefault(subjectName, SubjectPerformance(subjectName, 0, 0, 0, 0))
        correctSubjectMap[subjectName] = perf.copy(total = perf.total + 1)
    }

    val finalSubjectPerformance = correctSubjectMap.map { (name, initialPerf) ->
        val actualPerf = subjectMap[name]
        if (actualPerf != null) {
            initialPerf.copy(
                attempted = actualPerf.attempted,
                correct = actualPerf.correct,
                timeSpent = actualPerf.timeSpent
            )
        } else {
            initialPerf
        }
    }.sortedByDescending { it.total }

    val totalSkippedTime = totalTime - (totalCorrectTime + totalIncorrectTime)

    val avgOverall = if (totalQuestions > 0) totalTime / totalQuestions else 0
    val avgCorrect = if (correctAnswers > 0) totalCorrectTime / correctAnswers else 0
    val avgIncorrect = if (incorrectAnswers > 0) totalIncorrectTime / incorrectAnswers else 0

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            Text(
                text = "Mission Accomplished",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )
            Spacer(modifier = Modifier.height(24.dp))
        }

        // Overview Grid
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                StatCard(
                    modifier = Modifier.weight(1f),
                    title = "Hits",
                    value = correctAnswers.toString(),
                    icon = Icons.Default.CheckCircle,
                    color = Color(0xFF4CAF50) // Emerald
                )
                StatCard(
                    modifier = Modifier.weight(1f),
                    title = "Misses",
                    value = incorrectAnswers.toString(),
                    icon = Icons.Default.Clear,
                    color = Color(0xFFF44336) // Red
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                StatCard(
                    modifier = Modifier.weight(1f),
                    title = "Evaded",
                    value = unattempted.toString(),
                    icon = Icons.Default.Warning,
                    color = Color(0xFFFFC107) // Amber
                )
                StatCard(
                    modifier = Modifier.weight(1f),
                    title = "Precision",
                    value = "${accuracy.toInt()}%",
                    icon = Icons.Default.Star,
                    color = Color(0xFF2196F3) // Blue
                )
            }
            Spacer(modifier = Modifier.height(24.dp))
        }

        // Time Management Grid
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Info, contentDescription = "Time", tint = MaterialTheme.colorScheme.primary)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Time Management",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        TimeColumn("Total", formatSecs(totalTime), "100%")
                        TimeColumn("Correct", formatSecs(totalCorrectTime), "${if(totalTime>0) (totalCorrectTime*100/totalTime) else 0}%", Color(0xFF4CAF50))
                        TimeColumn("Incorrect", formatSecs(totalIncorrectTime), "${if(totalTime>0) (totalIncorrectTime*100/totalTime) else 0}%", Color(0xFFF44336))
                        TimeColumn("Skipped", formatSecs(totalSkippedTime), "${if(totalTime>0) (totalSkippedTime*100/totalTime) else 0}%", Color(0xFFFFC107))
                    }

                    Divider(modifier = Modifier.padding(vertical = 16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        TimeMetricBox("Avg / Q", formatSecs(avgOverall))
                        TimeMetricBox("Avg Correct", formatSecs(avgCorrect))
                        TimeMetricBox("Avg Incorrect", formatSecs(avgIncorrect))
                    }
                }
            }
            Spacer(modifier = Modifier.height(24.dp))
        }

        // Sectional Summary
        if (finalSubjectPerformance.isNotEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.List, contentDescription = "Summary", tint = MaterialTheme.colorScheme.primary)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Sectional Summary",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.height(16.dp))

                        // Header Row
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Subject", modifier = Modifier.weight(2f), fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelSmall)
                            Text("Q's", modifier = Modifier.weight(1f), fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelSmall)
                            Text("Acc", modifier = Modifier.weight(1f), fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelSmall)
                            Text("Time", modifier = Modifier.weight(1f), fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelSmall)
                        }
                        Divider(modifier = Modifier.padding(vertical = 8.dp))
                    }
                }
            }

            items(finalSubjectPerformance) { subject ->
                Card(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Row(modifier = Modifier.fillMaxWidth().padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text(subject.name, modifier = Modifier.weight(2f), style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
                        Text("${subject.total}", modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                        Text("${subject.accuracy}%", modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium, color = if (subject.accuracy >= 75) Color(0xFF4CAF50) else if (subject.accuracy >= 50) Color(0xFFFFC107) else Color(0xFFF44336))
                        Text(formatSecs(subject.timeSpent), modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
            item { Spacer(modifier = Modifier.height(32.dp)) }
        }

        // Actions
        item {
            Button(
                onClick = {
                    quizViewModel.onEvent(QuizEvent.RestartQuiz)
                    onRestartQuiz()
                },
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(8.dp)
            ) {
                Icon(Icons.Default.Refresh, contentDescription = "Restart")
                Spacer(modifier = Modifier.width(8.dp))
                Text("New Run", fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedButton(
                onClick = onNavigateHome,
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(8.dp)
            ) {
                Icon(Icons.Default.Home, contentDescription = "Home")
                Spacer(modifier = Modifier.width(8.dp))
                Text("Command Center", fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun StatCard(modifier: Modifier = Modifier, title: String, value: String, icon: ImageVector, color: Color) {
    Card(
        modifier = modifier.height(120.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(icon, contentDescription = title, tint = color, modifier = Modifier.size(32.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = value, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Black)
            Text(text = title.uppercase(), style = MaterialTheme.typography.labelSmall, color = color, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun TimeColumn(title: String, time: String, percentage: String, color: Color = Color.Unspecified) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(title.uppercase(), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(time, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = if(color != Color.Unspecified) color else MaterialTheme.colorScheme.onSurface)
        Text(percentage, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f))
    }
}

@Composable
fun TimeMetricBox(title: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(title, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(modifier = Modifier.height(4.dp))
        Text(value, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
    }
}

fun formatSecs(seconds: Int): String {
    if (seconds < 60) return "${seconds}s"
    val m = seconds / 60
    val s = seconds % 60
    return if (s > 0) "${m}m ${s}s" else "${m}m"
}

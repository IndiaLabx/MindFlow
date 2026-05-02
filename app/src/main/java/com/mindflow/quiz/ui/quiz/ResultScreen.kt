package com.mindflow.quiz.ui.quiz

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.mindflow.quiz.domain.engine.QuizState
import com.mindflow.quiz.domain.engine.QuizEvent

@Composable
fun ResultScreen(
    quizViewModel: QuizViewModel,
    onNavigateHome: () -> Unit,
    onRestartQuiz: () -> Unit
) {
    val uiState by quizViewModel.uiState.collectAsState()

    if (uiState !is QuizState.Finished) {
         // Should not happen, but just in case
         Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
             Text("Loading Results...")
         }
         return
    }

    val state = uiState as QuizState.Finished

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Quiz Completed!",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )

        Spacer(modifier = Modifier.height(32.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Your Score",
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = "${state.score} / ${state.questions.size}",
                    style = MaterialTheme.typography.displayMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSecondaryContainer
                )

                Spacer(modifier = Modifier.height(16.dp))

                val percentage = if (state.questions.isNotEmpty()) {
                    (state.score.toFloat() / state.questions.size.toFloat()) * 100
                } else 0f

                Text(
                    text = "Accuracy: ${percentage.toInt()}%",
                    style = MaterialTheme.typography.bodyLarge
                )
            }
        }

        Spacer(modifier = Modifier.height(48.dp))

        Button(
            onClick = {
                quizViewModel.onEvent(QuizEvent.RestartQuiz)
                onRestartQuiz()
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Restart Quiz")
        }

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedButton(
            onClick = onNavigateHome,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Back to Dashboard")
        }
    }
}

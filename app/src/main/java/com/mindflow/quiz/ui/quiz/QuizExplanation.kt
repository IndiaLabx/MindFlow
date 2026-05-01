package com.mindflow.quiz.ui.quiz

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.mindflow.quiz.data.local.entity.QuestionEntity

@Composable
fun QuizExplanation(question: QuestionEntity) {
    val explanation = question.explanation
    if (explanation == null) return

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        if (!explanation.summary.isNullOrBlank()) {
            ExplanationSection(
                title = "Answer",
                content = explanation.summary,
                backgroundColor = MaterialTheme.colorScheme.primaryContainer,
                contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                borderColor = MaterialTheme.colorScheme.primary
            )
        }

        if (!explanation.analysisCorrect.isNullOrBlank()) {
            ExplanationSection(
                title = "Why this is correct",
                content = explanation.analysisCorrect,
                backgroundColor = Color(0xFFE8F5E9),
                contentColor = Color(0xFF2E7D32),
                borderColor = Color(0xFF81C784),
                icon = {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = Color(0xFF2E7D32),
                        modifier = Modifier.padding(end = 8.dp)
                    )
                }
            )
        }

        if (!explanation.analysisIncorrect.isNullOrBlank()) {
            ExplanationSection(
                title = "Why other options are incorrect",
                content = explanation.analysisIncorrect,
                backgroundColor = Color(0xFFFFEBEE),
                contentColor = Color(0xFFC62828),
                borderColor = Color(0xFFE57373),
                icon = {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = null,
                        tint = Color(0xFFC62828),
                        modifier = Modifier.padding(end = 8.dp)
                    )
                }
            )
        }

        if (!explanation.conclusion.isNullOrBlank()) {
            ExplanationSection(
                title = "Key Takeaway",
                content = explanation.conclusion,
                backgroundColor = Color(0xFFE3F2FD),
                contentColor = Color(0xFF1565C0),
                borderColor = Color(0xFF64B5F6),
                icon = {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = null,
                        tint = Color(0xFF1565C0),
                        modifier = Modifier.padding(end = 8.dp)
                    )
                }
            )
        }

        if (!explanation.fact.isNullOrBlank()) {
            ExplanationSection(
                title = "Did you know?",
                content = explanation.fact,
                backgroundColor = Color(0xFFFFF8E1),
                contentColor = Color(0xFFF57F17),
                borderColor = Color(0xFFFFD54F),
                icon = {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = null,
                        tint = Color(0xFFF57F17),
                        modifier = Modifier.padding(end = 8.dp)
                    )
                }
            )
        }
    }
}

@Composable
fun ExplanationSection(
    title: String,
    content: String,
    backgroundColor: Color,
    contentColor: Color,
    borderColor: Color,
    icon: @Composable (() -> Unit)? = null
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(backgroundColor)
            .border(1.dp, borderColor, RoundedCornerShape(8.dp))
            .padding(16.dp)
    ) {
        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (icon != null) {
                    icon()
                }
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = contentColor
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = content,
                style = MaterialTheme.typography.bodyMedium,
                color = contentColor.copy(alpha = 0.8f)
            )
        }
    }
}

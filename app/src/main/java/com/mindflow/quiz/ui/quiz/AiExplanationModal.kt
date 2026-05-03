package com.mindflow.quiz.ui.quiz

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.mindflow.quiz.ui.ai.AiExplanationResponse
import com.mindflow.quiz.ui.ai.TypingIndicator
import io.noties.markwon.Markwon

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AiExplanationModal(
    explanationData: AiExplanationResponse?,
    isLoading: Boolean,
    error: String?,
    onDismiss: () -> Unit,
    onRetry: () -> Unit
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "AI Tutor Explanation",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                IconButton(onClick = onDismiss) {
                    Icon(Icons.Default.Close, contentDescription = "Close")
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (isLoading) {
                Box(
                    modifier = Modifier.fillMaxWidth().height(200.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        TypingIndicator()
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("Consulting the AI Tutor...", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            } else if (error != null) {
                Box(
                    modifier = Modifier.fillMaxWidth().height(200.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Failed to load explanation", color = MaterialTheme.colorScheme.error)
                        Text(error, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onErrorContainer)
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = onRetry) {
                            Text("Try Again")
                        }
                    }
                }
            } else if (explanationData != null) {
                LazyColumn(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    contentPadding = PaddingValues(bottom = 32.dp)
                ) {
                    // Correct Answer
                    explanationData.correct_answer?.let { correctAnswer ->
                        item {
                            AiSectionCard(
                                title = "✅ Correct Answer",
                                content = correctAnswer,
                                bgColor = Color(0xFFE8F5E9),
                                borderColor = Color(0xFFA5D6A7),
                                titleColor = Color(0xFF2E7D32)
                            )
                        }
                    }

                    // Reasoning
                    explanationData.reasoning?.let { reasoning ->
                        item {
                            AiSectionCard(
                                title = "🧠 Analysis & Reasoning",
                                content = reasoning,
                                bgColor = MaterialTheme.colorScheme.surfaceVariant,
                                borderColor = MaterialTheme.colorScheme.outlineVariant,
                                titleColor = MaterialTheme.colorScheme.primary
                            )
                        }
                    }

                    // Exam Facts
                    explanationData.exam_facts?.takeIf { it.isNotEmpty() }?.let { facts ->
                        item {
                            AiListCard(
                                title = "📚 Exam Special Facts (PYQs)",
                                items = facts,
                                bgColor = Color(0xFFE3F2FD),
                                borderColor = Color(0xFF90CAF9),
                                titleColor = Color(0xFF1565C0)
                            )
                        }
                    }

                    // Recent News
                    explanationData.recent_news?.let { news ->
                        item {
                            AiSectionCard(
                                title = "📰 Recent News & Updates",
                                content = news,
                                bgColor = Color(0xFFFFEBEE),
                                borderColor = Color(0xFFEF9A9A),
                                titleColor = Color(0xFFC62828)
                            )
                        }
                    }

                    // Interesting Facts
                    explanationData.interesting_facts?.takeIf { it.isNotEmpty() }?.let { facts ->
                        item {
                            AiListCard(
                                title = "💡 Did You Know?",
                                items = facts,
                                bgColor = Color(0xFFFFF8E1),
                                borderColor = Color(0xFFFFE082),
                                titleColor = Color(0xFFF57F17)
                            )
                        }
                    }

                    // Fun Fact
                    explanationData.fun_fact?.let { funFact ->
                        item {
                            AiSectionCard(
                                title = "🎉 Fun Fact",
                                content = funFact,
                                bgColor = Color(0xFFF3E5F5),
                                borderColor = Color(0xFFCE93D8),
                                titleColor = Color(0xFF6A1B9A)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AiSectionCard(title: String, content: String, bgColor: Color, borderColor: Color, titleColor: Color) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .border(1.dp, borderColor, RoundedCornerShape(12.dp))
            .padding(16.dp)
    ) {
        Column {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = titleColor
            )
            Spacer(modifier = Modifier.height(8.dp))
            MarkdownText(content = content, color = Color.DarkGray)
        }
    }
}

@Composable
fun AiListCard(title: String, items: List<String>, bgColor: Color, borderColor: Color, titleColor: Color) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .border(1.dp, borderColor, RoundedCornerShape(12.dp))
            .padding(16.dp)
    ) {
        Column {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = titleColor
            )
            Spacer(modifier = Modifier.height(8.dp))
            items.forEach { item ->
                Row(modifier = Modifier.padding(bottom = 4.dp)) {
                    Text("• ", color = titleColor, fontWeight = FontWeight.Bold)
                    MarkdownText(content = item, color = Color.DarkGray)
                }
            }
        }
    }
}

@Composable
fun MarkdownText(content: String, color: Color) {
    val context = LocalContext.current
    val markwon = remember(context) { Markwon.create(context) }

    AndroidView(
        factory = { ctx ->
            android.widget.TextView(ctx).apply {
                setTextColor(android.graphics.Color.DKGRAY)
                setTextAppearance(android.R.style.TextAppearance_Material_Body1)
            }
        },
        update = { textView ->
            markwon.setMarkdown(textView, content)
        }
    )
}

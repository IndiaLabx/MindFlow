package com.mindflow.quiz.ui.ai

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun TypingIndicator(modifier: Modifier = Modifier, dotColor: Color = MaterialTheme.colorScheme.primary) {
    val maxOffset = 8f

    val infiniteTransition = rememberInfiniteTransition(label = "typing")

    val dot1Offset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = maxOffset,
        animationSpec = infiniteRepeatable(
            animation = tween(300, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "dot1"
    )

    val dot2Offset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = maxOffset,
        animationSpec = infiniteRepeatable(
            animation = tween(300, easing = LinearEasing, delayMillis = 150),
            repeatMode = RepeatMode.Reverse
        ),
        label = "dot2"
    )

    val dot3Offset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = maxOffset,
        animationSpec = infiniteRepeatable(
            animation = tween(300, easing = LinearEasing, delayMillis = 300),
            repeatMode = RepeatMode.Reverse
        ),
        label = "dot3"
    )

    Row(
        modifier = modifier.padding(horizontal = 8.dp, vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Dot(offset = dot1Offset, color = dotColor)
        Dot(offset = dot2Offset, color = dotColor)
        Dot(offset = dot3Offset, color = dotColor)
    }
}

@Composable
private fun Dot(offset: Float, color: Color) {
    Box(
        modifier = Modifier
            .size(8.dp)
            .offset(y = (-offset).dp)
            .clip(CircleShape)
            .background(color)
    )
}

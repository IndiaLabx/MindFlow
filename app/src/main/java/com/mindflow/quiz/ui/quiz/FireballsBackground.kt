package com.mindflow.quiz.ui.quiz

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.unit.IntSize
import kotlin.math.sqrt
import kotlin.random.Random

data class BallStyle(val stops: List<Color>, val shadow: Color)

val BALL_STYLES = listOf(
    // #fireball1
    BallStyle(listOf(Color(0xFFFFCC00), Color(0xFFFF6600), Color(0xFFCC3300), Color(0xFF660000)), Color(0xFFFFCC00)),
    // #fireball2
    BallStyle(listOf(Color(0xFFE0BBE4), Color(0xFF957DAD), Color(0xFF6A0DAD), Color(0xFF301934)), Color(0xFFE0BBE4)),
    // #fireball3
    BallStyle(listOf(Color(0xFF44CCFF), Color(0xFF0088FF), Color(0xFF0044EE), Color(0xFF000099)), Color(0xFF44CCFF)),
    // #fireball4
    BallStyle(listOf(Color(0xFFCCFF44), Color(0xFF88FF00), Color(0xFF44EE00), Color(0xFF009900)), Color(0xFFCCFF44)),
    // #fireball5
    BallStyle(listOf(Color(0xFFFF44CC), Color(0xFFFF0088), Color(0xFFEE0044), Color(0xFF990000)), Color(0xFFFF44CC)),
    // #fireball6
    BallStyle(listOf(Color(0xFFFFFFFF), Color(0xFFDDDDDD), Color(0xFFBBBBBB), Color(0xFF888888)), Color(0xFFFFFFFF)),
    // #fireball7
    BallStyle(listOf(Color(0xFFFFEB99), Color(0xFFFFD700), Color(0xFFDAA520), Color(0xFFB8860B)), Color(0xFFFFEB99)),
    // #fireball8
    BallStyle(listOf(Color(0xFF626199), Color(0xFF003CFF), Color(0xFF00E6EE), Color(0xFF00998C)), Color(0xFF44FFC7)),
    // #fireball9
    BallStyle(listOf(Color(0xFFFF6347), Color(0xFFDC143C), Color(0xFFB22222), Color(0xFF800000)), Color(0xFFFF6347)),
    // #fireball10
    BallStyle(listOf(Color(0xFFC19A6B), Color(0xFFA0522D), Color(0xFF8B4513), Color(0xFF5D4037)), Color(0xFFC19A6B))
)

data class Ball(
    val id: Int,
    var x: Float,
    var y: Float,
    var vx: Float,
    var vy: Float,
    val radius: Float
)

@Composable
fun FireballsBackground(modifier: Modifier = Modifier) {
    var size by remember { mutableStateOf(IntSize.Zero) }

    // We only create the balls once the size is known.
    val balls = remember { mutableStateListOf<Ball>() }

    // Track initialization so we don't recreate on recomposition.
    var isInitialized by remember { mutableStateOf(false) }

    LaunchedEffect(size) {
        if (size.width > 0 && size.height > 0 && !isInitialized) {
            balls.clear()
            for (i in 0 until 10) {
                val radius = 30f // ~11px on web, slightly scaled for Android density
                balls.add(
                    Ball(
                        id = i,
                        x = Random.nextFloat() * (size.width - radius * 2) + radius,
                        y = Random.nextFloat() * (size.height - radius * 2) + radius,
                        vx = (Random.nextFloat() - 0.5f) * 6f, // scaled velocity
                        vy = (Random.nextFloat() - 0.5f) * 6f,
                        radius = radius
                    )
                )
            }
            isInitialized = true
        }
    }

    // Physics Update Loop
    LaunchedEffect(isInitialized) {
        if (!isInitialized) return@LaunchedEffect
        while (true) {
            withFrameNanos { _ ->
                // 1. Update positions and wall collisions
                for (ball in balls) {
                    ball.x += ball.vx
                    ball.y += ball.vy

                    // Wall collision
                    if (ball.x - ball.radius < 0) {
                        ball.x = ball.radius
                        ball.vx = -ball.vx
                    }
                    if (ball.x + ball.radius > size.width) {
                        ball.x = size.width - ball.radius
                        ball.vx = -ball.vx
                    }
                    if (ball.y - ball.radius < 0) {
                        ball.y = ball.radius
                        ball.vy = -ball.vy
                    }
                    if (ball.y + ball.radius > size.height) {
                        ball.y = size.height - ball.radius
                        ball.vy = -ball.vy
                    }
                }

                // 2. Check Ball-to-Ball Collisions
                for (i in 0 until balls.size) {
                    for (j in i + 1 until balls.size) {
                        val ball1 = balls[i]
                        val ball2 = balls[j]

                        val dx = ball1.x - ball2.x
                        val dy = ball1.y - ball2.y

                        val distance = sqrt((dx * dx + dy * dy).toDouble()).toFloat()
                        val sumOfRadii = ball1.radius + ball2.radius

                        if (distance < sumOfRadii && distance != 0f) {
                            // Overlap resolution
                            val overlap = sumOfRadii - distance
                            val nx = dx / distance
                            val ny = dy / distance

                            ball1.x += nx * overlap / 2
                            ball1.y += ny * overlap / 2
                            ball2.x -= nx * overlap / 2
                            ball2.y -= ny * overlap / 2

                            // Velocity exchange logic
                            val tx = -ny
                            val ty = nx

                            val dpTan1 = ball1.vx * tx + ball1.vy * ty
                            val dpTan2 = ball2.vx * tx + ball2.vy * ty

                            val dpNorm1 = ball1.vx * nx + ball1.vy * ny
                            val dpNorm2 = ball2.vx * nx + ball2.vy * ny

                            val m1 = dpNorm2
                            val m2 = dpNorm1

                            ball1.vx = tx * dpTan1 + nx * m1
                            ball1.vy = ty * dpTan1 + ny * m1
                            ball2.vx = tx * dpTan2 + nx * m2
                            ball2.vy = ty * dpTan2 + ny * m2
                        }
                    }
                }
            }
        }
    }

    Canvas(
        modifier = modifier
            .fillMaxSize()
            .onSizeChanged { size = it }
    ) {
        if (!isInitialized) return@Canvas

        for (ball in balls) {
            val style = BALL_STYLES[ball.id % BALL_STYLES.size]

            val colorStops = style.stops.mapIndexed { index, color ->
                Pair(index.toFloat() / (style.stops.size - 1), color)
            }.toTypedArray()

            val brush = Brush.radialGradient(
                colorStops = colorStops,
                center = Offset(ball.x, ball.y),
                radius = ball.radius
            )

            drawCircle(
                brush = brush,
                radius = ball.radius,
                center = Offset(ball.x, ball.y)
            )
        }
    }
}

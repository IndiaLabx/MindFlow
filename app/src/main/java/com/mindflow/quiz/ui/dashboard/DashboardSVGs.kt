package com.mindflow.quiz.ui.dashboard

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathFillType
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.path
import androidx.compose.ui.unit.dp

object DashboardSVGs {
    // We are converting the main ones used in DashboardFeature list

    val CreateQuizSVG: ImageVector
        get() = ImageVector.Builder(
            name = "CreateQuizSVG",
            defaultWidth = 48.dp,
            defaultHeight = 48.dp,
            viewportWidth = 48f,
            viewportHeight = 48f
        ).apply {
            path(
                fill = SolidColor(Color(0xFF6366F1)),
                stroke = SolidColor(Color(0xFF6366F1)),
                strokeLineWidth = 2f,
                strokeLineCap = StrokeCap.Round,
                strokeLineJoin = StrokeJoin.Round
            ) {
                moveTo(24f, 4f)
                lineTo(40f, 20f)
                lineTo(24f, 44f)
                lineTo(8f, 20f)
                close()
            }
        }.build()

    val EnglishZoneSVG: ImageVector
        get() = ImageVector.Builder(
            name = "EnglishZoneSVG",
            defaultWidth = 48.dp,
            defaultHeight = 48.dp,
            viewportWidth = 48f,
            viewportHeight = 48f
        ).apply {
            path(
                fill = SolidColor(Color(0xFFEAB308)),
                strokeAlpha = 1f,
                strokeLineWidth = 2f
            ) {
                moveTo(24f, 4f)
                lineTo(30f, 16f)
                lineTo(44f, 18f)
                lineTo(34f, 28f)
                lineTo(36f, 42f)
                lineTo(24f, 36f)
                lineTo(12f, 42f)
                lineTo(14f, 28f)
                lineTo(4f, 18f)
                lineTo(18f, 16f)
                close()
            }
        }.build()

    val GrammarQuizSVG: ImageVector
        get() = ImageVector.Builder(
            name = "GrammarQuizSVG",
            defaultWidth = 48.dp,
            defaultHeight = 48.dp,
            viewportWidth = 48f,
            viewportHeight = 48f
        ).apply {
            path(
                fill = SolidColor(Color(0xFF8B5CF6)),
                strokeAlpha = 1f,
                strokeLineWidth = 2f
            ) {
                moveTo(12f, 8f)
                lineTo(36f, 8f)
                lineTo(36f, 40f)
                lineTo(12f, 40f)
                close()
                moveTo(16f, 16f)
                lineTo(32f, 16f)
                moveTo(16f, 24f)
                lineTo(32f, 24f)
                moveTo(16f, 32f)
                lineTo(24f, 32f)
            }
        }.build()

    val EnglishMockSVG: ImageVector
        get() = ImageVector.Builder(
            name = "EnglishMockSVG",
            defaultWidth = 48.dp,
            defaultHeight = 48.dp,
            viewportWidth = 48f,
            viewportHeight = 48f
        ).apply {
            path(
                fill = SolidColor(Color(0xFF10B981)),
                strokeAlpha = 1f,
                strokeLineWidth = 2f
            ) {
                moveTo(24f, 24f)
                lineTo(24f, 24f) // placeholder for circle
            }
            // Simplified placeholder, since translating complex SVGs path by path is massive
        }.build()

    val SavedQuizzesSVG: ImageVector
        get() = ImageVector.Builder(
            name = "SavedQuizzesSVG",
            defaultWidth = 48.dp,
            defaultHeight = 48.dp,
            viewportWidth = 48f,
            viewportHeight = 48f
        ).apply {
            path(
                fill = SolidColor(Color(0xFFEC4899))
            ) {
                moveTo(24f, 8f)
                lineTo(32f, 16f)
                lineTo(24f, 40f)
                lineTo(16f, 16f)
                close()
            }
        }.build()

    val AdminSVG: ImageVector
        get() = ImageVector.Builder(
            name = "AdminSVG",
            defaultWidth = 48.dp,
            defaultHeight = 48.dp,
            viewportWidth = 48f,
            viewportHeight = 48f
        ).apply {
            path(
                fill = SolidColor(Color(0xFFEF4444))
            ) {
                moveTo(24f, 12f)
                // Head
                // Body
                lineTo(24f, 40f)
            }
        }.build()

    val DownloadSVG: ImageVector
        get() = ImageVector.Builder(
            name = "DownloadSVG",
            defaultWidth = 48.dp,
            defaultHeight = 48.dp,
            viewportWidth = 48f,
            viewportHeight = 48f
        ).apply {
            path(
                fill = SolidColor(Color(0xFF06B6D4))
            ) {
                moveTo(24f, 4f)
                lineTo(24f, 32f)
                moveTo(16f, 24f)
                lineTo(24f, 32f)
                lineTo(32f, 24f)
                moveTo(8f, 40f)
                lineTo(40f, 40f)
            }
        }.build()

    val AboutSVG: ImageVector
        get() = ImageVector.Builder(
            name = "AboutSVG",
            defaultWidth = 48.dp,
            defaultHeight = 48.dp,
            viewportWidth = 48f,
            viewportHeight = 48f
        ).apply {
            path(
                fill = SolidColor(Color(0xFF64748B))
            ) {
                moveTo(24f, 16f)
                lineTo(24f, 16f) // dot
                moveTo(24f, 24f)
                lineTo(24f, 40f)
            }
        }.build()
}

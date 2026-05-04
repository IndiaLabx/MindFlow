package com.mindflow.quiz.ui.dashboard

import androidx.compose.foundation.clickable
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

data class DashboardFeature(val id: String, val title: String, val icon: ImageVector, val description: String)

@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
    onNavigateToQuiz: () -> Unit = {},
    onNavigateToFlashcards: () -> Unit = {}
) {
    val stats by viewModel.profileStats.collectAsStateWithLifecycle()

    val features = listOf(
        DashboardFeature("card-mcqs", "Create Quiz", DashboardSVGs.CreateQuizSVG, "Customize subjects and topics"),
        DashboardFeature("card-3", "Vocab Master", DashboardSVGs.EnglishZoneSVG, "Synonyms & Antonyms"),
        DashboardFeature("card-4", "Grammar Hub", DashboardSVGs.GrammarQuizSVG, "English Grammar Tests"),
        DashboardFeature("card-5", "Mock Tests", DashboardSVGs.EnglishMockSVG, "Full length mocks"),
        DashboardFeature("card-6", "Saved Quizzes", DashboardSVGs.SavedQuizzesSVG, "Review your past attempts"),
        DashboardFeature("card-admin", "Admin Room", DashboardSVGs.AdminSVG, "Broadcast & Upload"),
        DashboardFeature("card-download", "Download", DashboardSVGs.DownloadSVG, "Get study materials & PDFs"),
        DashboardFeature("card-7", "About Us", DashboardSVGs.AboutSVG, "Developer info, Privacy Policy & Terms")
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Welcome Header
        Text(
            text = "Welcome back!",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Ready to master your subjects today?",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
        )

        // Statistics Cards Row (Real Data)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            StatCard(modifier = Modifier.weight(1f), title = "Total Quizzes", value = stats.quizzesCompleted.toString())
            StatCard(modifier = Modifier.weight(1f), title = "Avg Score", value = "${stats.averageScore}%")
            StatCard(modifier = Modifier.weight(1f), title = "Time Spent", value = stats.totalTimeSpentFormatted)
        }

        Spacer(modifier = Modifier.height(32.dp))

        Text(
            text = "Features",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        // Feature Grid
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(features) { feature ->
                FeatureCard(feature = feature) {
                    if (feature.id == "card-mcqs") onNavigateToQuiz()
                    else if (feature.id == "card-3") onNavigateToFlashcards()
                }
            }
        }
    }
}

@Composable
fun StatCard(modifier: Modifier = Modifier, title: String, value: String) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = value, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text(text = title, style = MaterialTheme.typography.labelSmall)
        }
    }
}

@Composable
fun FeatureCard(feature: DashboardFeature, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = feature.icon,
                contentDescription = feature.title,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.onSurfaceVariant // Or use Color.Unspecified if relying on SVG fills
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = feature.title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = feature.description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.align(Alignment.CenterHorizontally)
            )
        }
    }
}

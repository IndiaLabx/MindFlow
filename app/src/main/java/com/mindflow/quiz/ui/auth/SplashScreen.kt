package com.mindflow.quiz.ui.auth

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import io.github.jan.supabase.gotrue.SessionStatus
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    authViewModel: AuthViewModel,
    onNavigateToDashboard: () -> Unit,
    onNavigateToLogin: () -> Unit
) {
    val sessionStatus by authViewModel.sessionStatus.collectAsStateWithLifecycle(initialValue = SessionStatus.LoadingFromStorage)
    val alpha = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        // Fade in animation
        alpha.animateTo(
            targetValue = 1f,
            animationSpec = tween(durationMillis = 1000)
        )
        // Keep splash screen visible for at least 2 seconds
        delay(1000)

        // Wait until session status is resolved, then navigate
        while (true) {
            when (authViewModel.sessionStatus.value) {
                is SessionStatus.Authenticated -> {
                    onNavigateToDashboard()
                    break
                }
                is SessionStatus.NotAuthenticated, is SessionStatus.NetworkError -> {
                    onNavigateToLogin()
                    break
                }
                else -> {
                    // Still loading, check again shortly
                    delay(100)
                }
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.primary),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "MindFlow",
            color = MaterialTheme.colorScheme.onPrimary,
            fontSize = 48.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.alpha(alpha.value)
        )
    }
}

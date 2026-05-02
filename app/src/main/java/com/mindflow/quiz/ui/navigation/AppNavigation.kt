package com.mindflow.quiz.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.NavType
import androidx.navigation.navArgument
import androidx.navigation.navDeepLink
import androidx.navigation.compose.rememberNavController
import com.mindflow.quiz.ui.auth.AuthViewModel
import com.mindflow.quiz.ui.auth.LoginScreen
import com.mindflow.quiz.ui.auth.SignupScreen
import com.mindflow.quiz.ui.dashboard.MainLayoutScreen
import com.mindflow.quiz.ui.ai.AIChatScreen
import com.mindflow.quiz.ui.ai.AITutorViewModel
import com.mindflow.quiz.ui.quiz.QuizViewModel
import com.mindflow.quiz.ui.quiz.QuizScreen
import com.mindflow.quiz.ui.flashcards.FlashcardViewModel
import com.mindflow.quiz.ui.flashcards.FlashcardScreen
import com.mindflow.quiz.ui.quiz.ResultScreen
import io.github.jan.supabase.gotrue.SessionStatus
import androidx.compose.ui.platform.LocalContext
import com.mindflow.quiz.ui.ViewModelFactory

@Composable
fun AppNavigation(
    authViewModel: AuthViewModel = viewModel()
) {
    val aiTutorViewModel: AITutorViewModel = viewModel()
    val context = LocalContext.current
    val quizViewModel: QuizViewModel = viewModel(factory = ViewModelFactory(context))
    val flashcardViewModel: FlashcardViewModel = viewModel(factory = ViewModelFactory(context))
    val navController = rememberNavController()
    val sessionStatus by authViewModel.sessionStatus.collectAsState(initial = SessionStatus.LoadingFromStorage)

    LaunchedEffect(sessionStatus) {
        when (sessionStatus) {
            is SessionStatus.Authenticated -> {
                navController.navigate("dashboard") {
                    popUpTo("login") { inclusive = true }
                }
            }
            is SessionStatus.NotAuthenticated -> {
                navController.navigate("login") {
                    popUpTo(0) { inclusive = true }
                }
            }
            else -> {
                // Loading or Network Error state handling could go here.
            }
        }
    }

    NavHost(
        navController = navController,
        startDestination = "login"
    ) {
        composable("login") {
            LoginScreen(
                authViewModel = authViewModel,
                onNavigateToSignup = { navController.navigate("signup") }
            )
        }
        composable("signup") {
            SignupScreen(
                authViewModel = authViewModel,
                onNavigateToLogin = { navController.popBackStack() }
            )
        }
        composable("dashboard") {
            MainLayoutScreen(authViewModel = authViewModel, rootNavController = navController)
        }
        composable(
            "flashcards",
            deepLinks = listOf(navDeepLink { uriPattern = "mindflow://flashcards" })
        ) {
            FlashcardScreen(
                viewModel = flashcardViewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }
        composable(
            "quiz/{subject}",
            arguments = listOf(navArgument("subject") { type = NavType.StringType }),
            deepLinks = listOf(navDeepLink { uriPattern = "mindflow://quiz/{subject}" })
        ) { backStackEntry ->
            val subject = backStackEntry.arguments?.getString("subject") ?: "General Knowledge"
            LaunchedEffect(subject) {
                quizViewModel.startQuizForSubject(subject)
            }
            QuizScreen(
                quizViewModel = quizViewModel,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToResult = { navController.navigate("result") { popUpTo("quiz/{subject}") { inclusive = true } } },
                onNavigateToAI = { navController.navigate("ai_chat") }
            )
        }
        composable(
            "ai_chat",
            deepLinks = listOf(navDeepLink { uriPattern = "mindflow://ai_chat" })
        ) {
            AIChatScreen(
                viewModel = aiTutorViewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }
        composable("result") {
            ResultScreen(
                quizViewModel = quizViewModel,
                onNavigateHome = { navController.navigate("dashboard") { popUpTo(0) } },
                onRestartQuiz = { navController.popBackStack() }
            )
        }
    }
}

package com.mindflow.quiz.ui.navigation

import androidx.compose.runtime.Composable
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.compose.runtime.LaunchedEffect

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
import com.mindflow.quiz.ui.auth.SplashScreen
import com.mindflow.quiz.ui.auth.SubscriptionScreen
import com.mindflow.quiz.ui.auth.SupportScreen

import com.mindflow.quiz.ui.dashboard.MainLayoutScreen
import com.mindflow.quiz.ui.ai.AIChatScreen
import com.mindflow.quiz.ui.ai.AITutorViewModel
import com.mindflow.quiz.ui.quiz.QuizViewModel
import com.mindflow.quiz.ui.quiz.QuizScreen
import com.mindflow.quiz.ui.flashcards.FlashcardViewModel
import com.mindflow.quiz.ui.flashcards.FlashcardScreen
import com.mindflow.quiz.ui.flashcards.IdiomsConfigScreen
import com.mindflow.quiz.ui.flashcards.OWSConfigScreen
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

    // We no longer use LaunchedEffect here to observe sessionStatus.
    // That responsibility is now handled by the SplashScreen.

    NavHost(
        navController = navController,
        startDestination = "splash"
    ) {
        composable("splash") {
            SplashScreen(
                authViewModel = authViewModel,
                onNavigateToDashboard = {
                    navController.navigate("dashboard") {
                        popUpTo("splash") { inclusive = true }
                    }
                },
                onNavigateToLogin = {
                    navController.navigate("login") {
                        popUpTo("splash") { inclusive = true }
                    }
                }
            )
        }
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

        composable("subscription") {
            SubscriptionScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        composable("support") {
            SupportScreen(
                onNavigateBack = { navController.popBackStack() }
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
        composable("idioms_config") {
            IdiomsConfigScreen(
                viewModel = flashcardViewModel,
                onNavigateBack = { navController.popBackStack() },
                onStartFlashcards = {
                    navController.navigate("flashcards") {
                        popUpTo("idioms_config") { inclusive = true }
                    }
                }
            )
        }
        composable("ows_config") {
            OWSConfigScreen(
                viewModel = flashcardViewModel,
                onNavigateBack = { navController.popBackStack() },
                onStartFlashcards = {
                    navController.navigate("flashcards") {
                        popUpTo("ows_config") { inclusive = true }
                    }
                }
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
                onNavigateToAI = { contextData ->
                    // Set context on the view model before navigating
                    if (contextData.isNotEmpty()) {
                        aiTutorViewModel.sendMessage("Can you explain this question to me?", contextData)
                    }
                    navController.navigate("ai_chat")
                }
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

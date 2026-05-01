package com.mindflow.quiz.ui.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Build
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.mindflow.quiz.ui.auth.AuthViewModel
import com.mindflow.quiz.ui.ViewModelFactory

sealed class BottomNavItem(val route: String, val title: String, val icon: ImageVector) {
    object Home : BottomNavItem("home", "Home", Icons.Default.Home)
    object Flashcards : BottomNavItem("flashcards_tab", "School", Icons.Default.Build)
    object Profile : BottomNavItem("profile", "Profile", Icons.Default.Person)
}

@OptIn(ExperimentalMaterial3Api::class)
@SuppressWarnings("unused")
@Composable
fun MainLayoutScreen(
    authViewModel: AuthViewModel,
    rootNavController: NavController
) {
    val context = LocalContext.current
    val mainViewModel: MainViewModel = viewModel(factory = ViewModelFactory(context))
    val selectedTab by mainViewModel.selectedTab.collectAsState()

    val bottomNavController = rememberNavController()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("MindFlow") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        },
        bottomBar = {
            BottomAppBar(
                actions = {
                    NavigationBarItem(
                        selected = selectedTab == BottomNavItem.Home.route,
                        onClick = {
                            mainViewModel.onTabSelected(BottomNavItem.Home.route)
                            bottomNavController.navigate(BottomNavItem.Home.route) {
                                popUpTo(bottomNavController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(BottomNavItem.Home.icon, contentDescription = BottomNavItem.Home.title) },
                        label = { Text(BottomNavItem.Home.title) }
                    )
                    NavigationBarItem(
                        selected = selectedTab == BottomNavItem.Flashcards.route,
                        onClick = {
                            mainViewModel.onTabSelected(BottomNavItem.Flashcards.route)
                            bottomNavController.navigate(BottomNavItem.Flashcards.route) {
                                popUpTo(bottomNavController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(BottomNavItem.Flashcards.icon, contentDescription = BottomNavItem.Flashcards.title) },
                        label = { Text(BottomNavItem.Flashcards.title) }
                    )
                    Spacer(Modifier.weight(1f)) // Space for central FAB
                    NavigationBarItem(
                        selected = selectedTab == BottomNavItem.Profile.route,
                        onClick = {
                            mainViewModel.onTabSelected(BottomNavItem.Profile.route)
                            bottomNavController.navigate(BottomNavItem.Profile.route) {
                                popUpTo(bottomNavController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(BottomNavItem.Profile.icon, contentDescription = BottomNavItem.Profile.title) },
                        label = { Text(BottomNavItem.Profile.title) }
                    )
                },
                floatingActionButton = {
                    FloatingActionButton(
                        onClick = { rootNavController.navigate("ai_chat") },
                        containerColor = MaterialTheme.colorScheme.tertiaryContainer,
                        elevation = FloatingActionButtonDefaults.bottomAppBarFabElevation()
                    ) {
                        Text("AI", style = MaterialTheme.typography.titleMedium) // Central AI signature element
                    }
                }
            )
        }
    ) { innerPadding ->
        NavHost(
            navController = bottomNavController,
            startDestination = BottomNavItem.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(BottomNavItem.Home.route) {
                val dashboardViewModel: DashboardViewModel = viewModel(factory = ViewModelFactory(context))
                DashboardScreen(
                    viewModel = dashboardViewModel,
                    onNavigateToQuiz = { rootNavController.navigate("quiz/General Knowledge") },
                    onNavigateToFlashcards = { rootNavController.navigate("flashcards") }
                )
            }
            composable(BottomNavItem.Flashcards.route) {
                Text(text = "Flashcards Integration Screen", modifier = Modifier.padding(16.dp))
            }
            composable(BottomNavItem.Profile.route) {
                Text(text = "Profile Screen", modifier = Modifier.padding(16.dp))
            }
        }
    }
}

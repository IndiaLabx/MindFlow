package com.mindflow.quiz.ui.dashboard

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.StateFlow

class MainViewModel(
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {

    companion object {
        private const val SELECTED_TAB_KEY = "selected_tab"
    }

    val selectedTab: StateFlow<String> = savedStateHandle.getStateFlow(SELECTED_TAB_KEY, BottomNavItem.Home.route)

    fun onTabSelected(route: String) {
        savedStateHandle[SELECTED_TAB_KEY] = route
    }
}

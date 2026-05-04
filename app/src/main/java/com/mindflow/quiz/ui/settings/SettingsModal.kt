package com.mindflow.quiz.ui.settings

import androidx.compose.foundation.layout.*
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsModal(
    onDismissRequest: () -> Unit,
    viewModel: SettingsViewModel = viewModel()
) {
    val isBgAnimationsEnabled by viewModel.isBgAnimationsEnabled.collectAsStateWithLifecycle()
    val isSoundEnabled by viewModel.isSoundEnabled.collectAsStateWithLifecycle()
    val isDarkModeEnabled by viewModel.isDarkModeEnabled.collectAsStateWithLifecycle()

    ModalBottomSheet(onDismissRequest = onDismissRequest) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Settings",
                style = MaterialTheme.typography.headlineSmall
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Background Animations")
                Switch(checked = isBgAnimationsEnabled, onCheckedChange = { viewModel.toggleBgAnimations(it) })
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Sound Effects")
                Switch(checked = isSoundEnabled, onCheckedChange = { viewModel.toggleSound(it) })
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Dark Mode")
                Switch(checked = isDarkModeEnabled, onCheckedChange = { viewModel.toggleDarkMode(it) })
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

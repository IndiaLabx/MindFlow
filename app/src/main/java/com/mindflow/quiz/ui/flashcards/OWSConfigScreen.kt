package com.mindflow.quiz.ui.flashcards

import androidx.compose.foundation.layout.*
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.compose.foundation.selection.toggleable
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OWSConfigScreen(
    viewModel: FlashcardViewModel,
    onNavigateBack: () -> Unit,
    onStartFlashcards: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    var showMastered by remember { mutableStateOf(uiState.filters.includeMastered) }

    // Convert current selected options to mutable states
    val readStatusOptions = listOf("read", "unread")
    var selectedReadStatus by remember { mutableStateOf(uiState.filters.readStatus) }

    val difficultyOptions = listOf("Easy", "Medium", "Hard")
    var selectedDifficulty by remember { mutableStateOf(uiState.filters.difficulty) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("OWS Configuration", style = MaterialTheme.typography.headlineMedium)

        Spacer(modifier = Modifier.height(32.dp))

        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Include Mastered Words")
            Switch(
                checked = showMastered,
                onCheckedChange = { showMastered = it }
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text("Read Status", style = MaterialTheme.typography.titleMedium, modifier = Modifier.align(Alignment.Start))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            readStatusOptions.forEach { option ->
                FilterChip(
                    selected = selectedReadStatus.contains(option),
                    onClick = {
                        val current = selectedReadStatus.toMutableList()
                        if (current.contains(option)) {
                            current.remove(option)
                        } else {
                            current.add(option)
                        }
                        selectedReadStatus = current
                    },
                    label = { Text(option.capitalize()) }
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text("Difficulty Level", style = MaterialTheme.typography.titleMedium, modifier = Modifier.align(Alignment.Start))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            difficultyOptions.forEach { option ->
                FilterChip(
                    selected = selectedDifficulty.contains(option),
                    onClick = {
                        val current = selectedDifficulty.toMutableList()
                        if (current.contains(option)) {
                            current.remove(option)
                        } else {
                            current.add(option)
                        }
                        selectedDifficulty = current
                    },
                    label = { Text(option) }
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
            OutlinedButton(onClick = onNavigateBack) {
                Text("Cancel")
            }
            Button(onClick = {
                viewModel.setFilters(FlashcardFilters(
                    includeMastered = showMastered,
                    readStatus = selectedReadStatus,
                    difficulty = selectedDifficulty
                ))
                viewModel.setDeckType(FlashcardDeckType.ONE_WORDS)
                onStartFlashcards()
            }) {
                Text("Start Flashcards")
            }
        }
    }
}

package com.mindflow.quiz.ui.flashcards

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mindflow.quiz.data.repository.IdiomsRepository
import com.mindflow.quiz.data.repository.OneWordRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch

enum class FlashcardDeckType {
    IDIOMS, ONE_WORDS
}

data class FlashcardState(
    val deckType: FlashcardDeckType = FlashcardDeckType.IDIOMS,
    val items: List<FlashcardItem> = emptyList(),
    val currentIndex: Int = 0,
    val isFlipped: Boolean = false,
    val isLoading: Boolean = true
)

class FlashcardViewModel(
    private val idiomsRepository: IdiomsRepository,
    private val oneWordRepository: OneWordRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(FlashcardState())
    val uiState: StateFlow<FlashcardState> = _uiState.asStateFlow()

    init {
        observeData()
    }

    private fun observeData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)

            combine(
                idiomsRepository.observeAllIdioms(),
                oneWordRepository.observeAllOneWords(),
                _uiState
            ) { idioms, oneWords, state ->
                val items = when (state.deckType) {
                    FlashcardDeckType.IDIOMS -> idioms
                        .filter { it.status != "mastered" } // Filter out mastered items
                        .map { FlashcardItem.Idiom(it) }
                    FlashcardDeckType.ONE_WORDS -> oneWords
                        .filter { it.status != "mastered" } // Filter out mastered items
                        .map { FlashcardItem.OneWord(it) }
                }

                // Adjust currentIndex if it's now out of bounds
                val newIndex = if (items.isEmpty()) 0 else minOf(state.currentIndex, items.size - 1)

                state.copy(
                    items = items,
                    currentIndex = newIndex,
                    isLoading = false,
                    isFlipped = false // reset flip state on data update
                )
            }.collectLatest { newState ->
                _uiState.value = newState
            }
        }
    }

    fun setDeckType(deckType: FlashcardDeckType) {
        if (_uiState.value.deckType != deckType) {
            _uiState.value = _uiState.value.copy(
                deckType = deckType,
                currentIndex = 0,
                isFlipped = false,
                isLoading = true // will be cleared by combine flow
            )
        }
    }

    fun flipCard() {
        _uiState.value = _uiState.value.copy(isFlipped = !_uiState.value.isFlipped)
    }

    fun nextCard() {
        val currentState = _uiState.value
        if (currentState.currentIndex < currentState.items.size - 1) {
            _uiState.value = currentState.copy(
                currentIndex = currentState.currentIndex + 1,
                isFlipped = false
            )
        }
    }

    fun previousCard() {
        val currentState = _uiState.value
        if (currentState.currentIndex > 0) {
            _uiState.value = currentState.copy(
                currentIndex = currentState.currentIndex - 1,
                isFlipped = false
            )
        }
    }

    fun markCurrentCard(newStatus: String) {
        val currentState = _uiState.value
        if (currentState.items.isEmpty()) return

        val currentItem = currentState.items[currentState.currentIndex]

        viewModelScope.launch {
            when (currentItem) {
                is FlashcardItem.Idiom -> idiomsRepository.updateIdiomStatus(currentItem.id, newStatus)
                is FlashcardItem.OneWord -> oneWordRepository.updateOneWordStatus(currentItem.id, newStatus)
            }

            // Note: The UI state will automatically update because we are observing the flows in combine()
            // However, we might want to manually advance to the next card if they marked it.
            // When the flow emits, if the item was mastered it will be removed, and the index might shift.
            // If we just want to advance without waiting for the DB flow:
            // nextCard() -> actually we let the combine flow handle it. If an item is removed from the list,
            // the combine block adjust the index. But if it's just marked as "familiar", it might stay in the list.

            // If it's not filtered out, we should advance manually
            if (newStatus != "mastered") {
                 if (currentState.currentIndex < currentState.items.size - 1) {
                     _uiState.value = currentState.copy(
                         currentIndex = currentState.currentIndex + 1,
                         isFlipped = false
                     )
                 }
            }
        }
    }
}

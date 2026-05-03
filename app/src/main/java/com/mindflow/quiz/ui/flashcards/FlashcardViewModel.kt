package com.mindflow.quiz.ui.flashcards

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mindflow.quiz.data.repository.IdiomsRepository
import com.mindflow.quiz.data.repository.OneWordRepository
import com.mindflow.quiz.data.repository.InteractionRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch

enum class FlashcardDeckType {
    IDIOMS, ONE_WORDS
}

data class FlashcardFilters(
    val includeMastered: Boolean = false,
    val readStatus: List<String> = emptyList(), // "read", "unread"
    val difficulty: List<String> = emptyList() // "Easy", "Medium", "Hard"
)

data class FlashcardState(
    val deckType: FlashcardDeckType = FlashcardDeckType.IDIOMS,
    val items: List<FlashcardItem> = emptyList(),
    val currentIndex: Int = 0,
    val isFlipped: Boolean = false,
    val isLoading: Boolean = true,
    val filters: FlashcardFilters = FlashcardFilters(),
    val isCurrentCardRead: Boolean = false
)

class FlashcardViewModel(
    private val idiomsRepository: IdiomsRepository,
    private val oneWordRepository: OneWordRepository,
    private val interactionRepository: InteractionRepository
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
                interactionRepository.observeInteractionsByType("idiom"),
                interactionRepository.observeInteractionsByType("ows"),
                _uiState
            ) { idioms, oneWords, idiomInteractions, owsInteractions, state ->
                val idiomInteractionsMap = idiomInteractions.associateBy { it.itemId }
                val owsInteractionsMap = owsInteractions.associateBy { it.itemId }

                val items = when (state.deckType) {
                    FlashcardDeckType.IDIOMS -> idioms
                        .filter {
                            (state.filters.includeMastered || it.status != "mastered") &&
                            (state.filters.difficulty.isEmpty() || state.filters.difficulty.contains(it.difficulty)) &&
                            (state.filters.readStatus.isEmpty() || state.filters.readStatus.contains(if (idiomInteractionsMap[it.id]?.isRead == true) "read" else "unread"))
                        }
                        .map { FlashcardItem.Idiom(it) }
                    FlashcardDeckType.ONE_WORDS -> oneWords
                        .filter {
                            (state.filters.includeMastered || it.status != "mastered") &&
                            (state.filters.difficulty.isEmpty() || state.filters.difficulty.contains(it.difficulty)) &&
                            (state.filters.readStatus.isEmpty() || state.filters.readStatus.contains(if (owsInteractionsMap[it.id]?.isRead == true) "read" else "unread"))
                        }
                        .map { FlashcardItem.OneWord(it) }
                }

                val newIndex = if (items.isEmpty()) 0 else minOf(state.currentIndex, items.size - 1)

                var isRead = false
                if (items.isNotEmpty()) {
                    val currentItem = items[newIndex]
                    isRead = when (currentItem) {
                        is FlashcardItem.Idiom -> idiomInteractionsMap[currentItem.id]?.isRead == true
                        is FlashcardItem.OneWord -> owsInteractionsMap[currentItem.id]?.isRead == true
                    }
                }

                state.copy(
                    items = items,
                    currentIndex = newIndex,
                    isLoading = false,
                    isFlipped = state.isFlipped, // preserve flip state on data update
                    isCurrentCardRead = isRead
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
                isLoading = true
            )
        }
    }

    fun setFilters(filters: FlashcardFilters) {
        _uiState.value = _uiState.value.copy(
            filters = filters,
            currentIndex = 0,
            isFlipped = false,
            isLoading = true
        )
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

    fun toggleReadStatusCurrentCard() {
        val currentState = _uiState.value
        if (currentState.items.isEmpty()) return

        val currentItem = currentState.items[currentState.currentIndex]
        val currentReadStatus = currentState.isCurrentCardRead

        viewModelScope.launch {
            when (currentItem) {
                is FlashcardItem.Idiom -> interactionRepository.toggleReadStatus(currentItem.id, "idiom", currentReadStatus)
                is FlashcardItem.OneWord -> interactionRepository.toggleReadStatus(currentItem.id, "ows", currentReadStatus)
            }
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

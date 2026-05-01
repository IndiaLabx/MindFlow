package com.mindflow.quiz.ui.flashcards

import com.mindflow.quiz.data.local.entity.IdiomEntity
import com.mindflow.quiz.data.local.entity.OneWordEntity

sealed class FlashcardItem {
    abstract val id: String
    abstract val title: String // The main phrase or word
    abstract val difficulty: String
    abstract val status: String
    abstract val sourceInfo: String

    // Abstracting content for the front and back of the card
    abstract val meaningMain: String // Usually English
    abstract val meaningSecondary: String? // Usually Hindi
    abstract val usageExample: String

    data class Idiom(val entity: IdiomEntity) : FlashcardItem() {
        override val id: String = entity.id
        override val title: String = entity.phrase
        override val difficulty: String = entity.difficulty
        override val status: String = entity.status
        override val sourceInfo: String = "${entity.sourcePdf ?: "Unknown"} | ${entity.examYear}"

        override val meaningMain: String = entity.meaningEnglish
        override val meaningSecondary: String = entity.meaningHindi
        override val usageExample: String = entity.usage

        val mnemonic: String = entity.mnemonic
    }

    data class OneWord(val entity: OneWordEntity) : FlashcardItem() {
        override val id: String = entity.id
        override val title: String = entity.word
        override val difficulty: String = entity.difficulty
        override val status: String = entity.status
        override val sourceInfo: String = "${entity.sourcePdf ?: "Unknown"} | ${entity.examYear}"

        override val meaningMain: String = entity.meaningEn
        override val meaningSecondary: String = entity.meaningHi
        override val usageExample: String = entity.usageSentences.firstOrNull() ?: ""

        val pos: String = entity.pos
        val synonyms: List<String> = entity.synonyms
        val antonyms: List<String> = entity.antonyms
    }
}

package com.mindflow.quiz.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.mindflow.quiz.data.local.converters.RoomConverters
import com.mindflow.quiz.data.local.dao.IdiomDao
import com.mindflow.quiz.data.local.dao.OneWordDao
import com.mindflow.quiz.data.local.dao.InteractionDao
import com.mindflow.quiz.data.local.dao.BookmarkDao
import com.mindflow.quiz.data.local.dao.QuestionDao
import com.mindflow.quiz.data.local.dao.QuizHistoryDao
import com.mindflow.quiz.data.local.entity.IdiomEntity
import com.mindflow.quiz.data.local.entity.OneWordEntity
import com.mindflow.quiz.data.local.entity.InteractionEntity
import com.mindflow.quiz.data.local.entity.BookmarkEntity
import com.mindflow.quiz.data.local.entity.QuestionEntity
import com.mindflow.quiz.data.local.entity.QuizHistoryEntity

@Database(
    entities = [
        QuestionEntity::class,
        IdiomEntity::class,
        OneWordEntity::class,
        InteractionEntity::class,
        BookmarkEntity::class,
        QuizHistoryEntity::class
    ],
    version = 4,
    exportSchema = false
)
@TypeConverters(RoomConverters::class)
abstract class AppDatabase : RoomDatabase() {

    abstract fun questionDao(): QuestionDao
    abstract fun idiomDao(): IdiomDao
    abstract fun oneWordDao(): OneWordDao
    abstract fun interactionDao(): InteractionDao
    abstract fun bookmarkDao(): BookmarkDao
    abstract fun quizHistoryDao(): QuizHistoryDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "mindflow_database"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}

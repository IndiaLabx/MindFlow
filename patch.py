with open("app/src/main/java/com/mindflow/quiz/ui/quiz/QuizViewModel.kt", "r") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "is QuizEvent.NextQuestion -> {" in line:
        for j in range(i, i + 15):
            if "val newState = currentState.copy(status = \"result\")" in lines[j]:
                lines[j] = lines[j].replace("                val newState", "                    val newState")
            if "stopTimer()" in lines[j]:
                lines[j - 1] = lines[j - 1].replace("                savedStateHandle", "                    savedStateHandle")
                lines[j - 2] = lines[j - 2].replace("                _uiState", "                    _uiState")
            if "} else {" in lines[j]:
                lines[j + 1] = lines[j + 1].replace("                val newState", "                    val newState")
                lines[j + 2] = lines[j + 2].replace("                _uiState", "                    _uiState")
                lines[j + 3] = lines[j + 3].replace("                savedStateHandle", "                    savedStateHandle")
        break

with open("app/src/main/java/com/mindflow/quiz/ui/quiz/QuizViewModel.kt", "w") as f:
    f.writelines(lines)

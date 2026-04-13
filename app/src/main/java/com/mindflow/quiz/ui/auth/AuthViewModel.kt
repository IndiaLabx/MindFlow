package com.mindflow.quiz.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mindflow.quiz.data.remote.SupabaseClientConfig
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.SessionStatus
import io.github.jan.supabase.gotrue.providers.builtin.Email
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    data class Success(val message: String) : AuthState()
    data class Error(val error: String) : AuthState()
}

class AuthViewModel : ViewModel() {

    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    // Observe Supabase's built-in session state
    val sessionStatus: StateFlow<SessionStatus> = SupabaseClientConfig.client.auth.sessionStatus

    fun signUp(emailInput: String, passwordInput: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            try {
                SupabaseClientConfig.client.auth.signUpWith(Email) {
                    email = emailInput
                    password = passwordInput
                }
                _authState.value = AuthState.Success("Sign up successful. Please check your email if verification is required.")
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.localizedMessage ?: "An error occurred during sign up.")
            }
        }
    }

    fun signIn(emailInput: String, passwordInput: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            try {
                SupabaseClientConfig.client.auth.signInWith(Email) {
                    email = emailInput
                    password = passwordInput
                }
                _authState.value = AuthState.Success("Signed in successfully.")
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.localizedMessage ?: "Invalid login credentials.")
            }
        }
    }

    fun signOut() {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            try {
                SupabaseClientConfig.client.auth.signOut()
                _authState.value = AuthState.Idle
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.localizedMessage ?: "Error signing out.")
            }
        }
    }

    fun resetState() {
        _authState.value = AuthState.Idle
    }
}

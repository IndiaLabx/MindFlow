package com.mindflow.quiz.ui.auth

import android.content.Context
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.mindflow.quiz.data.remote.SupabaseClientConfig
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.SessionStatus
import io.github.jan.supabase.gotrue.providers.builtin.IDToken
import io.github.jan.supabase.gotrue.providers.Google
import io.github.jan.supabase.gotrue.providers.builtin.Email
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.security.MessageDigest
import java.util.UUID

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

    fun signInWithGoogle(context: Context) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            try {
                val credentialManager = CredentialManager.create(context)

                // You should generate a random nonce for security
                val rawNonce = UUID.randomUUID().toString()
                val bytes = rawNonce.toByteArray()
                val md = MessageDigest.getInstance("SHA-256")
                val digest = md.digest(bytes)
                val hashedNonce = digest.joinToString("") { "%02x".format(it) }

                // The server client ID from Google Cloud Console.
                // Hardcoding for now, ideally should come from BuildConfig or strings.xml
                val serverClientId = "92014022634-11111111111111111111111111111111.apps.googleusercontent.com" // Placeholder!

                val googleIdOption: GetGoogleIdOption = GetGoogleIdOption.Builder()
                    .setFilterByAuthorizedAccounts(false)
                    .setServerClientId(serverClientId)
                    .setNonce(hashedNonce)
                    .build()

                val request: GetCredentialRequest = GetCredentialRequest.Builder()
                    .addCredentialOption(googleIdOption)
                    .build()

                val result = credentialManager.getCredential(
                    request = request,
                    context = context,
                )

                val credential = result.credential
                if (credential is CustomCredential &&
                    credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
                ) {
                    val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                    val idToken = googleIdTokenCredential.idToken

                    SupabaseClientConfig.client.auth.signInWith(IDToken) {
                        this.idToken = idToken
                        provider = Google
                        nonce = rawNonce
                    }
                    _authState.value = AuthState.Success("Signed in with Google successfully.")
                } else {
                    _authState.value = AuthState.Error("Unexpected credential type")
                }
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.localizedMessage ?: "Google Sign In failed.")
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

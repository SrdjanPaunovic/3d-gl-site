import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { auth } from '@/firebase'
import type { AdminUser } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AdminUser | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  function initAuth(): void {
    onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        user.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || ''
        }
      } else {
        user.value = null
      }
      initialized.value = true
    })
  }

  async function init(): Promise<void> {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (firebaseUser: User | null) => {
        if (firebaseUser) {
          user.value = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || ''
          }
        } else {
          user.value = null
        }
        initialized.value = true
        resolve()
      })
    })
  }

  async function login(email: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || ''
      }
      return true
    } catch (err: any) {
      error.value = err.code === 'auth/invalid-credential' 
        ? 'Invalid email or password' 
        : 'Login failed. Please try again.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    await signOut(auth)
    user.value = null
  }

  return {
    user,
    loading,
    error,
    initialized,
    isAuthenticated,
    init,
    initAuth,
    login,
    logout
  }
})

import { ref, computed, onMounted } from 'vue'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { getFirebaseAuth } from '../firebase'

const currentUser = ref<User | null>(null)
const isAdmin = ref(false)
const authInitialized = ref(false)

export function useAuth() {
  const auth = getFirebaseAuth()

  // Initialize auth state listener
  onMounted(() => {
    if (typeof window !== 'undefined' && auth) {
      onAuthStateChanged(auth, async (user: User | null) => {
        currentUser.value = user
        authInitialized.value = true

        if (user) {
          // Check for admin custom claim
          const idTokenResult = await user.getIdTokenResult()
          isAdmin.value = !!idTokenResult.claims.admin
        } else {
          isAdmin.value = false
        }
      })
    }
  })

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const idTokenResult = await userCredential.user.getIdTokenResult()
      isAdmin.value = !!idTokenResult.claims.admin

      if (!isAdmin.value) {
        await logout()
        throw new Error('User does not have admin privileges')
      }

      return userCredential.user
    } catch (error: any) {
      throw new Error(error.message || 'Login failed')
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      currentUser.value = null
      isAdmin.value = false
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed')
    }
  }

  const getIdToken = async (): Promise<string | null> => {
    if (!currentUser.value) return null
    try {
      return await currentUser.value.getIdToken()
    } catch (error) {
      console.error('Error getting ID token:', error)
      return null
    }
  }

  return {
    currentUser: computed(() => currentUser.value),
    isAdmin: computed(() => isAdmin.value),
    authInitialized: computed(() => authInitialized.value),
    login,
    logout,
    getIdToken,
  }
}

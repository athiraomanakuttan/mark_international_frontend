import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {UserType, UserState} from '../../../types/user-type';

const getTokenFromStorage = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken')
  }
  return null
}

const getUserFromStorage = (): UserType | null => {
  if (typeof window !== 'undefined') {
    try {
      const userData = localStorage.getItem('userData')
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Error parsing stored user data:', error)
      return null
    }
  }
  return null
}

const initialState: UserState = {
  user: getUserFromStorage(),
  token: getTokenFromStorage(),
  isAuthenticated: !!getTokenFromStorage() && !!getUserFromStorage(),
  loading: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: UserType; token: string,  }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = !!action?.payload?.user;
      state.loading = false
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', action.payload.token)
        localStorage.setItem('userData', JSON.stringify(action.payload.user))
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    clearUser: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.loading = false
      
      // Remove token and user data from localStorage (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('userData')
      }
    },
    updateUser: (state, action: PayloadAction<Partial<UserType>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    // Initialize user from localStorage on client-side hydration
    initializeAuth: (state) => {
      const token = getTokenFromStorage()
      const user = getUserFromStorage()
      
      if (token && user) {
        state.token = token
        state.user = user
        state.isAuthenticated = true
      } else {
        // If we don't have both token and user, clear everything
        state.token = null
        state.user = null
        state.isAuthenticated = false
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('userData')
        }
      }
    },
  },
})

export const { setUser, setLoading, clearUser, updateUser, initializeAuth } = userSlice.actions
export default userSlice.reducer


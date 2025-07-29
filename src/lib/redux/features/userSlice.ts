import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {UserType, UserState} from '../../../types/user-type';

const getTokenFromStorage = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken')
  }
  return null
}

const initialState: UserState = {
  user: null,
  token: getTokenFromStorage(),
  isAuthenticated: !!getTokenFromStorage(),
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
      
      // Remove token from localStorage (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
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
      if (token) {
        state.token = token
        state.isAuthenticated = true
      }
    },
  },
})

export const { setUser, setLoading, clearUser, updateUser, initializeAuth } = userSlice.actions
export default userSlice.reducer


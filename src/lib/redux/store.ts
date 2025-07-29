// src/lib/redux/store.ts
import { configureStore } from '@reduxjs/toolkit'
import userReducer from './features/userSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      // Add other reducers here
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST'],
        },
      }),
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
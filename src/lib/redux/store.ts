import { configureStore } from '@reduxjs/toolkit'
import userReducer from './features/userSlice'
import staffReducer from './features/staffSlice' // ✅ fix here

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      staff: staffReducer, // ✅ now points to the correct reducer
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

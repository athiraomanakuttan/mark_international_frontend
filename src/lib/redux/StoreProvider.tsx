// src/lib/redux/StoreProvider.tsx
'use client'
import { useRef, useEffect } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from './store'
import { initializeAuth } from './features/userSlice'

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore>(null)
  
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  useEffect(() => {
    // Initialize auth state from localStorage on client-side hydration
    if (storeRef.current) {
      storeRef.current.dispatch(initializeAuth())
    }
  }, [])

  return <Provider store={storeRef.current}>{children}</Provider>
}
"use client"

import { useState } from "react"

export function useFetchFormData<T extends Record<string, any>>(initialData?:T) {
  const [formData, setFormData] = useState<T>({} as T)

  const setForm = <K extends keyof T>(key: K, value: T[K]) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const resetForm = () => {
    setFormData(initialData || ({} as T))
  }

  const updateForm = (data: Partial<T>) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }))
  }

  return {
    formData,
    setForm,
    resetForm,
    updateForm,
  }
}

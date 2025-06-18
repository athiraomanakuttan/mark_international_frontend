import { useState } from "react";

export function useFetchFormData<T extends Record<string, any>>() {
  const [formData, setFormData] = useState<T>({} as T);

  const setForm = <K extends keyof T>(name: K, value: T[K]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return { formData, setForm };
}

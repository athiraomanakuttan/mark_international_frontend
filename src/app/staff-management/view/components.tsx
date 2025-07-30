import type React from "react"

export const DialogContent = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

export const SelectValue = ({ children }: { children: React.ReactNode }) => {
  return <span>{children}</span>
}

export const Flag = () => {
  return <span></span>
}

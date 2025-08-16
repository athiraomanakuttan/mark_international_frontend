"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ChartContainer({ className, children, ...props }: ChartContainerProps) {
  return (
    <div className={cn("h-[300px] w-full flex items-center justify-center", className)} {...props}>
      {children}
    </div>
  )
}

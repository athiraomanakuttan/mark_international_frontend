"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import  {changePassword}  from "@/service/admin/profileService"
import { toast } from "react-toastify"

export default function ResetPasswordForm() {
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!password || !confirmPassword) {
      setError("Please fill out both fields.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    try {
      setSubmitting(true)
      const data = await changePassword(password)
      if(data)
        toast.success("Password reset successfully")
      setPassword("")
      setConfirmPassword("")
    } catch (_err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="border-border">
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="grid gap-5" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              aria-describedby={error ? "reset-error" : undefined}
            />
            <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              aria-describedby={error ? "reset-error" : undefined}
            />
          </div>

          {error ? (
            <div id="reset-error" role="alert" aria-live="polite" className="text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Button type="submit" disabled={submitting} className="bg-teal-500 hover:bg-teal-600 text-white"> 
            {submitting ? "Updating..." : "Reset password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

import React from 'react'
import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar"
import ResetPasswordForm from '@/components/reset-password-form'
const page = () => {
  return (
    <ModernDashboardLayout>
         <main className="flex min-h-[calc(100svh-0rem)] justify-center  p-6">
      <section className="w-full max-w-md">
        <h1 className="mb-6 text-balance text-2xl font-semibold tracking-tight">Reset your password</h1>
        <ResetPasswordForm />
      </section>
    </main>
    </ModernDashboardLayout>
    
  )
}

export default page

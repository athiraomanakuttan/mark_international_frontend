"use client"

import { StudentRegistrationForm } from "@/components/student-registration-form"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function EventCreatePage() {
  const { eventId } = useParams<{ eventId: string }>()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-4 max-w-5xl">
        <Link
          href="/staff/event-management"
          className="inline-block mb-4 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Back to Events
        </Link>
        <StudentRegistrationForm eventId={String(eventId)} />
      </div>
    </div>
  )
}

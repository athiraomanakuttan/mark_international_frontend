"use client"

import { StudentRegistrationForm } from "@/components/student-registration-form"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function Home() {
    const router = useRouter()
    const {eventId} = useParams()
  return (
    
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

          <StudentRegistrationForm  eventId={String(eventId)}/>
        </div>
      </div>
    </div>
  )
}

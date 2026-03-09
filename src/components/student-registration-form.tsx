"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "react-toastify"
import { createStudent } from "@/service/studentService"
import { handleSafeFormSubmit } from "@/lib/formHelpers"

export interface StudentData {
  name: string
  phoneNumber: string
  preferredCountry: string[]
  address?: string
  email?: string
  eventId: string
}

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Japan",
  "South Korea",
  "China",
  "India",
  "Brazil",
  "Mexico",
  "Argentina",
  "South Africa",
  "Nigeria",
  "Egypt",
]

export function StudentRegistrationForm({ eventId}:{eventId:string}) {
  
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<StudentData>({
    name: "",
    phoneNumber: "",
    preferredCountry: [],
    address: "",
    email: "",
    eventId
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [])

  const handleInputChange = (field: keyof StudentData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCountryToggle = (country: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      preferredCountry: checked
        ? [...prev.preferredCountry, country]
        : prev.preferredCountry.filter((c) => c !== country),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    await handleSafeFormSubmit(
      e,
      async () => {
        if (!formData.name.trim()) {
          toast.error("Name is required")
          return
        }

        if (!formData.phoneNumber.trim()) {
          toast.error("Phone number is required")
          return
        }
        
        const response = await createStudent(formData)
        if(response.status){
          toast.success("Registration completed")
          resetForm()
        }
      },
      {
        onStart: () => setIsSubmitting(true),
        onError: (error) => {
          toast.error("Registration failed. Please try again.")
        },
        onSuccess: () => setIsSubmitting(false),
        preventRedirectHeaders: true
      }
    )
    setIsSubmitting(false)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      phoneNumber: "",
      preferredCountry: [],
      address: "",
      email: "",
      eventId
    })
    setCountrySearch("")
    nameInputRef.current?.focus()
  }

  const filteredCountries = countries.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase())
  )

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Student Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 lg:gap-x-8">
          {/* Left: Name, Phone, Email, Address */}
          <div className="space-y-4 lg:pr-8 lg:border-r lg:border-slate-300">
            <div>
              <Label htmlFor="name" className="text-base font-medium text-slate-700">
                Full Name *
              </Label>
              <Input
                ref={nameInputRef}
                id="name"
                type="text"
                placeholder="Student's full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="mt-2 h-12 text-base"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-base font-medium text-slate-700">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Phone number"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                className="mt-2 h-12 text-base"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-base font-medium text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="mt-2 h-12 text-base"
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-base font-medium text-slate-700">
                Address
              </Label>
              <textarea
                id="address"
                rows={4}
                placeholder="Enter full address..."
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="mt-2 h-[96px] w-full rounded-md border border-input bg-transparent px-4 py-3 text-base shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-y min-h-[96px] leading-relaxed"
              />
            </div>
          </div>

          {/* Right: Countries */}
          <div className="lg:pl-8 lg:flex lg:flex-col">
            <Label className="text-base font-medium text-slate-700 block mb-1">Preferred Countries</Label>
            <p className="text-sm text-slate-500 mb-3">Select one or more countries</p>
            <Input
              type="text"
              placeholder="Search countries..."
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              className="mb-3 h-10 text-base"
            />
            {formData.preferredCountry.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.preferredCountry.map((country) => (
                  <span
                    key={country}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    {country}
                    <button
                      type="button"
                      onClick={() => handleCountryToggle(country, false)}
                      className="rounded-full hover:bg-emerald-100 p-0.5 transition-colors"
                      aria-label={`Remove ${country}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[280px] lg:max-h-[280px] pr-2 border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
              {filteredCountries.map((country) => (
                <label
                  key={country}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-colors min-h-[48px]"
                >
                  <Checkbox
                    checked={formData.preferredCountry.includes(country)}
                    onCheckedChange={(checked) => handleCountryToggle(country, checked === true)}
                    className="h-5 w-5 shrink-0"
                  />
                  <span className="text-base">{country}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-1">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-12 text-base font-medium"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            className="h-12 px-6 text-base"
          >
            Clear
          </Button>
        </div>
      </form>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Phone, Mail, MapPin, Search, X } from "lucide-react"
import { toast } from "react-toastify"
import { createStudent } from "@/service/studentService"

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
  const [countrySearch, setCountrySearch] = useState("")
  const [formData, setFormData] = useState<StudentData>({
    name: "",
    phoneNumber: "",
    preferredCountry: [],
    address: "",
    email: "",
    eventId
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [])

  const filteredCountries = countries.filter((country) => country.toLowerCase().includes(countrySearch.toLowerCase()))

  const handleInputChange = (field: keyof StudentData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCountryChange = (country: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      preferredCountry: checked
        ? [...prev?.preferredCountry, country]
        : prev?.preferredCountry?.filter((c) => c !== country),
    }))
  }

  const removeCountry = (countryToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredCountry: prev?.preferredCountry?.filter((c) => c !== countryToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Name is required")
      return
    }

    if (!formData.phoneNumber.trim()) {
      toast.error("Phone number is required")
        
      return
    }

    setIsSubmitting(true)

    try {
      
      const response = await createStudent(formData)
      if(response.status){
        toast.success("Student registration completed successfully")

      setFormData({
        name: "",
        phoneNumber: "",
        preferredCountry: [],
        address: "",
        email: "",
        eventId
      })
      setCountrySearch("")
      if (nameInputRef.current) {
        nameInputRef.current.focus()
      }
      }
    } catch (error) {
      toast.error("Failed to register student. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <User className="h-4 w-4" />
          Student Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Required Fields Column */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-900 border-b border-slate-200 pb-1">
                Required Information
              </h3>

              <div className="space-y-1">
                <Label htmlFor="name" className="text-sm text-slate-700 font-medium">
                  Full Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-2 top-2.5 h-3 w-3 text-slate-400" />
                  <Input
                    ref={nameInputRef}
                    id="name"
                    type="text"
                    placeholder="Enter student's full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="pl-8 h-9 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-sm text-slate-700 font-medium">
                  Phone Number *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-2 top-2.5 h-3 w-3 text-slate-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="pl-8 h-9 text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm text-slate-700 font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-2.5 h-3 w-3 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-8 h-9 text-sm border-slate-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="address" className="text-sm text-slate-700 font-medium">
                  Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-2 top-2.5 h-3 w-3 text-slate-400" />
                  <Textarea
                    id="address"
                    placeholder="Enter full address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="pl-8 pt-2.5 min-h-[60px] text-sm border-slate-300 focus:border-green-500 focus:ring-green-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Countries Column */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-900 border-b border-slate-200 pb-1">Preferred Countries</h3>

              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-3 w-3 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search countries..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="pl-8 h-9 text-sm border-slate-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                {formData.preferredCountry.length > 0 && (
                  <div className="flex flex-wrap gap-1 p-2 bg-slate-50 rounded-md border border-slate-200 max-h-16 overflow-y-auto">
                    {formData.preferredCountry.map((country) => (
                      <div
                        key={country}
                        className="flex items-center gap-1 bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs"
                      >
                        {country}
                        <button
                          type="button"
                          onClick={() => removeCountry(country)}
                          className="ml-0.5 hover:bg-green-200 rounded-full p-0.5"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border border-slate-300 rounded-md p-2 max-h-32 overflow-y-auto bg-slate-50">
                  {filteredCountries.length > 0 ? (
                    <div className="grid grid-cols-1 gap-1.5">
                      {filteredCountries.map((country) => (
                        <div key={country} className="flex items-center space-x-2">
                          <Checkbox
                            id={country}
                            checked={formData.preferredCountry.includes(country)}
                            onCheckedChange={(checked) => handleCountryChange(country, checked as boolean)}
                            className="border-slate-400 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 h-3 w-3"
                          />
                          <Label
                            htmlFor={country}
                            className="text-sm text-slate-700 cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {country}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 py-2 text-xs">
                      No countries found matching "{countrySearch}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium h-9 text-sm"
            >
              {isSubmitting ? "Registering..." : "Register Student"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  name: "",
                  phoneNumber: "",
                  preferredCountry: [],
                  address: "",
                  email: "",
                  eventId
                })
                setCountrySearch("")
                if (nameInputRef.current) {
                  nameInputRef.current.focus()
                }
              }}
              className="px-4 h-9 text-sm border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

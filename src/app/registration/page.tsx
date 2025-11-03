"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Upload, User, Calendar, Phone, MapPin, FileText } from "lucide-react"
import { toast } from "react-toastify"
import { RegistrationFormData, DocumentUpload, RegistrationFormErrors } from "@/types/registration-types"
import { submitRegistration } from "@/service/registrationService"

export default function RegistrationPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: "",
    dateOfBirth: "",
    contactNumber: "",
    maritalStatus: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India"
    },
    documents: []
  })
  const [errors, setErrors] = useState<RegistrationFormErrors>({})

  // Generate unique ID for documents
  const generateId = () => Math.random().toString(36).substr(2, 9)

  // Add new document upload slot
  const addDocument = () => {
    const newDocument: DocumentUpload = {
      id: generateId(),
      title: "",
      file: null,
      fileName: ""
    }
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, newDocument]
    }))
  }

  // Remove document upload slot
  const removeDocument = (id: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== id)
    }))
    // Clear document errors
    setErrors(prev => ({
      ...prev,
      documents: prev.documents ? Object.fromEntries(
        Object.entries(prev.documents).filter(([key]) => !key.startsWith(id))
      ) : {}
    }))
  }

  // Update document title
  const updateDocumentTitle = (id: string, title: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map(doc => 
        doc.id === id ? { ...doc, title } : doc
      )
    }))
    // Clear title error
    clearDocumentError(id, 'title')
  }

  // Update document file
  const updateDocumentFile = (id: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map(doc => 
        doc.id === id ? { ...doc, file, fileName: file?.name || "" } : doc
      )
    }))
    // Clear file error
    clearDocumentError(id, 'file')
  }

  // Clear document-specific errors
  const clearDocumentError = (id: string, type: 'title' | 'file') => {
    setErrors(prev => ({
      ...prev,
      documents: prev.documents ? {
        ...prev.documents,
        [`${id}_${type}`]: undefined
      } : {}
    }))
  }

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
      // Clear address errors
      setErrors(prev => ({
        ...prev,
        address: prev.address ? {
          ...prev.address,
          [addressField]: undefined
        } : {}
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
      // Clear field error
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: RegistrationFormErrors = {}

    // Personal Information validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required"
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required"
    } else if (!/^\d{10}$/.test(formData.contactNumber.replace(/\s|-/g, ''))) {
      newErrors.contactNumber = "Please enter a valid 10-digit contact number"
    }

    if (!formData.maritalStatus) {
      newErrors.maritalStatus = "Marital status is required"
    }

    // Address validation
    const addressErrors: any = {}
    if (!formData.address.street.trim()) {
      addressErrors.street = "Street address is required"
    }
    if (!formData.address.city.trim()) {
      addressErrors.city = "City is required"
    }
    if (!formData.address.state.trim()) {
      addressErrors.state = "State is required"
    }
    if (!formData.address.pincode.trim()) {
      addressErrors.pincode = "Pincode is required"
    } else if (!/^\d{6}$/.test(formData.address.pincode)) {
      addressErrors.pincode = "Please enter a valid 6-digit pincode"
    }
    if (!formData.address.country.trim()) {
      addressErrors.country = "Country is required"
    }

    if (Object.keys(addressErrors).length > 0) {
      newErrors.address = addressErrors
    }

    // Document validation
    const documentErrors: any = {}
    formData.documents.forEach(doc => {
      if (!doc.title.trim()) {
        documentErrors[`${doc.id}_title`] = "Document title is required"
      }
      if (!doc.file) {
        documentErrors[`${doc.id}_file`] = "Please select a file"
      }
    })

    if (Object.keys(documentErrors).length > 0) {
      newErrors.documents = documentErrors
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    try {
      setLoading(true)
      
      // Create FormData for file uploads
      const submitData = new FormData()
      
      // Add personal information
      submitData.append('name', formData.name)
      submitData.append('dateOfBirth', formData.dateOfBirth)
      submitData.append('contactNumber', formData.contactNumber)
      submitData.append('maritalStatus', formData.maritalStatus)
      
      // Add address information
      submitData.append('address', JSON.stringify(formData.address))
      
      // Add documents
      formData.documents.forEach((doc, index) => {
        if (doc.file) {
          submitData.append(`documents[${index}][file]`, doc.file)
          submitData.append(`documents[${index}][title]`, doc.title)
        }
      })

      // Submit to API
      const response = await submitRegistration(submitData)
      
      if (!response.status) {
        throw new Error(response.message || "Registration failed")
      }
      
      toast.success("Registration submitted successfully!")
      
      // Reset form
      setFormData({
        name: "",
        dateOfBirth: "",
        contactNumber: "",
        maritalStatus: "",
        address: {
          street: "",
          city: "",
          state: "",
          pincode: "",
          country: "India"
        },
        documents: []
      })
      
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Failed to submit registration. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Form</h1>
          <p className="text-gray-600">Please fill in all the required information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">
                    Date of Birth <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    className={errors.dateOfBirth ? "border-red-500" : ""}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
                  )}
                </div>

                {/* Contact Number */}
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">
                    Contact Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contactNumber"
                    placeholder="Enter your contact number"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                    className={errors.contactNumber ? "border-red-500" : ""}
                  />
                  {errors.contactNumber && (
                    <p className="text-sm text-red-500">{errors.contactNumber}</p>
                  )}
                </div>

                {/* Marital Status */}
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">
                    Marital Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(value) => handleInputChange("maritalStatus", value)}
                  >
                    <SelectTrigger className={errors.maritalStatus ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.maritalStatus && (
                    <p className="text-sm text-red-500">{errors.maritalStatus}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Street Address */}
              <div className="space-y-2">
                <Label htmlFor="street">
                  Street Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="street"
                  placeholder="Enter your street address"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange("address.street", e.target.value)}
                  className={errors.address?.street ? "border-red-500" : ""}
                  rows={2}
                />
                {errors.address?.street && (
                  <p className="text-sm text-red-500">{errors.address.street}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="Enter city"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange("address.city", e.target.value)}
                    className={errors.address?.city ? "border-red-500" : ""}
                  />
                  {errors.address?.city && (
                    <p className="text-sm text-red-500">{errors.address.city}</p>
                  )}
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="state">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="state"
                    placeholder="Enter state"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange("address.state", e.target.value)}
                    className={errors.address?.state ? "border-red-500" : ""}
                  />
                  {errors.address?.state && (
                    <p className="text-sm text-red-500">{errors.address.state}</p>
                  )}
                </div>

                {/* Pincode */}
                <div className="space-y-2">
                  <Label htmlFor="pincode">
                    Pincode <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pincode"
                    placeholder="Enter pincode"
                    value={formData.address.pincode}
                    onChange={(e) => handleInputChange("address.pincode", e.target.value)}
                    className={errors.address?.pincode ? "border-red-500" : ""}
                    maxLength={6}
                  />
                  {errors.address?.pincode && (
                    <p className="text-sm text-red-500">{errors.address.pincode}</p>
                  )}
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="country"
                    placeholder="Enter country"
                    value={formData.address.country}
                    onChange={(e) => handleInputChange("address.country", e.target.value)}
                    className={errors.address?.country ? "border-red-500" : ""}
                  />
                  {errors.address?.country && (
                    <p className="text-sm text-red-500">{errors.address.country}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Upload Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Document Upload
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addDocument}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Document
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.documents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No documents added yet. Click "Add Document" to upload files.</p>
                </div>
              ) : (
                formData.documents.map((document) => (
                  <div key={document.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Document {formData.documents.indexOf(document) + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(document.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Document Title */}
                      <div className="space-y-2">
                        <Label htmlFor={`title-${document.id}`}>
                          Document Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`title-${document.id}`}
                          placeholder="e.g., Passport, ID Card, Certificate"
                          value={document.title}
                          onChange={(e) => updateDocumentTitle(document.id, e.target.value)}
                          className={errors.documents?.[`${document.id}_title`] ? "border-red-500" : ""}
                        />
                        {errors.documents?.[`${document.id}_title`] && (
                          <p className="text-sm text-red-500">{errors.documents[`${document.id}_title`]}</p>
                        )}
                      </div>

                      {/* File Upload */}
                      <div className="space-y-2">
                        <Label htmlFor={`file-${document.id}`}>
                          Select File <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id={`file-${document.id}`}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => updateDocumentFile(document.id, e.target.files?.[0] || null)}
                            className={`${errors.documents?.[`${document.id}_file`] ? "border-red-500" : ""} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
                          />
                        </div>
                        {document.fileName && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <Upload className="w-4 h-4 mr-1" />
                            {document.fileName}
                          </p>
                        )}
                        {errors.documents?.[`${document.id}_file`] && (
                          <p className="text-sm text-red-500">{errors.documents[`${document.id}_file`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Submitting Registration...
                </>
              ) : (
                "Submit Registration"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

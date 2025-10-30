"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { toast } from "react-toastify"
import { createBranch } from "@/service/branchService"
import { CreateBranchType, BranchType } from "@/types/branch-types"

interface AddBranchModalProps {
  onBranchAdded: (branch: BranchType) => void
}

export default function AddBranchModal({ onBranchAdded }: AddBranchModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateBranchType>({
    branchName: "",
    location: "",
    description: "",
  })
  const [errors, setErrors] = useState<Partial<CreateBranchType>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateBranchType> = {}

    if (!formData.branchName.trim()) {
      newErrors.branchName = "Branch name is required"
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof CreateBranchType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      const response = await createBranch(formData)
      
      if (response.status && response.data) {
        toast.success("Branch created successfully!")
        onBranchAdded(response.data as BranchType)
        setOpen(false)
        // Reset form
        setFormData({
          branchName: "",
          location: "",
          description: "",
        })
        setErrors({})
      } else {
        toast.error(response.message || "Failed to create branch")
      }
    } catch (error) {
      console.error("Error creating branch:", error)
      toast.error("Failed to create branch. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setOpen(false)
    setFormData({
      branchName: "",
      location: "",
      description: "",
    })
    setErrors({})
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Branch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Branch</DialogTitle>
          <DialogDescription>
            Create a new branch for your organization. Fill in all the required information below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Branch Name */}
          <div className="space-y-2">
            <Label htmlFor="branchName">
              Branch Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="branchName"
              placeholder="Enter branch name"
              value={formData.branchName}
              onChange={(e) => handleInputChange("branchName", e.target.value)}
              className={errors.branchName ? "border-red-500" : ""}
            />
            {errors.branchName && (
              <p className="text-sm text-red-500">{errors.branchName}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">
              Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              placeholder="Enter branch location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className={errors.location ? "border-red-500" : ""}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Enter branch description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={errors.description ? "border-red-500" : ""}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Branch
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
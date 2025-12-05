"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit } from "lucide-react"
import { toast } from "react-toastify"
import { updateBranch } from "@/service/branchService"
import { UpdateBranchType, BranchType, BranchPaginationResponseType } from "@/types/branch-types"

interface EditBranchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  branch: BranchType | null
  onBranchUpdated: () => void
}

export default function EditBranchModal({ 
  open, 
  onOpenChange, 
  branch, 
  onBranchUpdated 
}: EditBranchModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateBranchType>({
    branchName: "",
    location: "",
    description: "",
  })
  const [errors, setErrors] = useState<Partial<UpdateBranchType>>({})

  // Initialize form data when branch prop changes
  useEffect(() => {
    if (branch) {
      setFormData({
        branchName: branch.branchName || "",
        location: branch.location || "",
        description: branch.description || "",
      })
      setErrors({})
    }
  }, [branch])

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateBranchType> = {}

    if (!formData.branchName?.trim()) {
      newErrors.branchName = "Branch name is required"
    }

    if (!formData.location?.trim()) {
      newErrors.location = "Location is required"
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof UpdateBranchType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !branch?._id) {
      return
    }

    try {
      setLoading(true)
      const response: BranchPaginationResponseType = await updateBranch(branch._id, formData)
      if (response.status) {
        toast.success("Branch updated successfully!")
        onBranchUpdated()
        onOpenChange(false)
      } else {
        toast.error(response.message || "Failed to update branch")
      }
    } catch (error) {
      console.error("Error updating branch:", error)
      toast.error("Failed to update branch. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    // Reset form to original values
    if (branch) {
      setFormData({
        branchName: branch.branchName || "",
        location: branch.location || "",
        description: branch.description || "",
      })
    }
    setErrors({})
  }

  if (!branch) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Branch</DialogTitle>
          <DialogDescription>
            Update the branch information. Modify the fields below and save your changes.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Branch Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-branchName">
              Branch Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-branchName"
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
            <Label htmlFor="edit-location">
              Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-location"
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
            <Label htmlFor="edit-description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="edit-description"
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
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Branch
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
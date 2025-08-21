"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

interface AddFollowupModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}
interface FormDataType {
  called_date: string
  call_result: string
  leadType: string
  priority: string
  status: string
  remarks: string
}

export function AddFollowupModal({
  isOpen,
  onOpenChange,
}: AddFollowupModalProps) {
  const [formData, setFormData] = useState<FormDataType>({
    called_date: new Date().toISOString().slice(0, 16), // works with datetime-local
    call_result: "",
    leadType: "",
    priority: "",
    status: "",
    remarks: "",
  })

  const handleSubmit = () => {
    console.log("Submitting formData:", formData)
    
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Follow-up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Add Followup</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="calledDate" className="text-slate-700">
                Called Date *
              </Label>
              <Input
                id="calledDate"
                type="datetime-local"
                value={formData.called_date}
                onChange={(e) =>
                  setFormData({ ...formData, called_date: e.target.value })
                }
                className="border-slate-300 focus:border-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="callResult" className="text-slate-700">
                Call Result *
              </Label>
              <Select
                value={formData.call_result}
                onValueChange={(value) =>
                  setFormData({ ...formData, call_result: value })
                }
              >
                <SelectTrigger className="border-slate-300 focus:border-blue-500 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="answered">Answered</SelectItem>
                  <SelectItem value="not-answered">Not Answered</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="leadCategory">Lead Category</Label>
              <Select
                value={formData.leadType}
                onValueChange={(value) =>
                  setFormData({ ...formData, leadType: value })
                }
              >
                <SelectTrigger className="border-slate-300 focus:border-blue-500 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="study abroad">Study abroad</SelectItem>
                  <SelectItem value="immigration">Immigration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger className="border-slate-300 focus:border-blue-500 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="leadStatus">Lead Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="border-slate-300 focus:border-blue-500 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="remarks" className="text-slate-700">
              Remarks
            </Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              placeholder="Remarks"
              className="min-h-20 border-slate-300 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-300 text-slate-600 hover:bg-slate-50"
          >
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

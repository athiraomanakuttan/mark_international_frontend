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
import { updateLead } from "@/service/staff/leadService"
import { FollowUpType, LeadBasicType } from "@/types/lead-type"
import { CALL_RESULT, FOLLOWUP_STATUS, LEAD_PRIORITIES, LEAD_TYPES } from '@/data/Lead-data'
import { updatedFollowupType } from "@/service/followupService"

interface AddFollowupModalProps {
  isOpen: boolean,
  userId: string,
  onOpenChange: (open: boolean) => void
}

export function AddFollowupModal({
  isOpen,
  userId,
  onOpenChange,
}: AddFollowupModalProps) {
  const [formData, setFormData] = useState<LeadBasicType & FollowUpType>({
    called_date: new Date().toISOString().slice(0, 10), // only date part
    call_result: 2,
    leadType: 1,
    priority: 1,
    status: 1,
    remarks: "",
    followup_date: ""
  })

  const handleSubmit = async () => {
    console.log("Submitting formData:", formData)
    try {
      const response = await updatedFollowupType(userId, formData)
      console.log("response", response)
    } catch (err) {
      console.log("err", err)
    }
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
            {/* Called Date */}
            <div>
              <Label htmlFor="calledDate" className="text-slate-700">
                Called Date *
              </Label>
              <Input
                id="calledDate"
                type="date"
                value={String(formData.called_date)}
                onChange={(e) =>
                  setFormData({ ...formData, called_date: e.target.value })
                }
                className="border-slate-300 focus:border-blue-500"
              />
            </div>
            {/* Call Result */}
            <div>
              <Label htmlFor="callResult" className="text-slate-700">
                Call Result *
              </Label>
              <Select
                value={String(formData.call_result)}
                onValueChange={(value) =>
                  setFormData({ ...formData, call_result: Number(value) })
                }
              >
                <SelectTrigger className="border-slate-300 focus:border-blue-500 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {CALL_RESULT.map((item) => (
                    <SelectItem key={item.value} value={String(item.value)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lead Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="leadCategory">Lead Category</Label>
              <Select
                value={String(formData.leadType)}
                onValueChange={(value) =>
                  setFormData({ ...formData, leadType: Number(value) })
                }
              >
                <SelectTrigger className="border-slate-300 focus:border-blue-500 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_TYPES.map((item) => (
                    <SelectItem key={item.value} value={String(item.value)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={String(formData.priority)}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: Number(value) })
                }
              >
                <SelectTrigger className="border-slate-300 focus:border-blue-500 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_PRIORITIES.map((priority) => (
                    <SelectItem key={priority.value} value={String(priority.value)}>
                      {priority.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lead Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="leadStatus">Lead Status *</Label>
              <Select
                value={String(formData.status)}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: Number(value) })
                }
              >
                <SelectTrigger className="border-slate-300 focus:border-blue-500 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {FOLLOWUP_STATUS.map((status) => (
                    <SelectItem key={status.value} value={String(status.value)}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
                  {formData.status === 2 && (
              <div>
                <Label htmlFor="followupDate" className="text-slate-700">
                  Followup Date *
                </Label>
                <Input
                  id="followupDate"
                  type="date"
                  value={formData.followup_date}
                  onChange={(e) =>
                    setFormData({ ...formData, followup_date: e.target.value })
                  }
                  className="border-slate-300 focus:border-blue-500"
                />
              </div>
          )}   
            
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

        {/* Footer Buttons */}
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

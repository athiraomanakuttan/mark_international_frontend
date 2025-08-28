"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { EventType } from "@/types/event-types"
import { StaffBasicType } from "@/types/staff-type"

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Omit<EventType, "id"> | EventType) => void
  event?: EventType
  staff: StaffBasicType[]
}

export function EventModal({ isOpen, onClose, onSave, event, staff }: EventModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    location: "",
    staffIds: [] as string[],
  })

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name,
        date: event.date,
        location: event.location || "",
        staffIds: event.staffIds || [],
      })
    } else {
      setFormData({
        name: "",
        date: "",
        location: "",
        staffIds: [],
      })
    }
  }, [event, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (event) {
      onSave({ ...event, ...formData })
    } else {
      onSave(formData)
    }
    onClose()
  }

  const handleStaffToggle = (staffId: string) => {
    setFormData((prev) => ({
      ...prev,
      staffIds: prev.staffIds.includes(staffId)
        ? prev.staffIds.filter((id) => id !== staffId)
        : [...prev.staffIds, staffId],
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-slate-900">{event ? "Edit Event" : "Add New Event"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700">
              Event Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-slate-700">
              Event Date
            </Label>
            <Input
              id="date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              required
              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-slate-700">
              Location
            </Label>
            <Textarea
              id="location"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              required
              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700">Select Staff</Label>
            <ScrollArea className="h-32 border border-slate-200 rounded-md p-3 bg-slate-50">
              <div className="space-y-2">
                {staff.map((staffMember) => (
                  <div key={staffMember.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={staffMember.id}
                      checked={formData.staffIds.includes(staffMember.id!)}
                      onCheckedChange={() => handleStaffToggle(staffMember.id!)}
                      className="border-slate-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <Label htmlFor={staffMember.id} className="text-sm font-normal text-slate-600">
                      {staffMember.name} - <span className="text-slate-500">{staffMember.designation}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
            >
              {event ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

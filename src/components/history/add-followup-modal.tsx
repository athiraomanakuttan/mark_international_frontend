"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

interface AddFollowupModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AddFollowupModal({ isOpen, onOpenChange }: AddFollowupModalProps) {
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
                defaultValue="2025-08-19T17:55"
                className="border-slate-300 focus:border-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="callResult" className="text-slate-700">
                Call Result *
              </Label>
              <Select>
                <SelectTrigger className="border-slate-300 focus:border-blue-500">
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
              <Select defaultValue="study abroad">
                <SelectTrigger className="border-slate-300 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="study abroad">Study abroad</SelectItem>
                  <SelectItem value="immigration">Immigration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select defaultValue="normal">
                <SelectTrigger className="border-slate-300 focus:border-blue-500">
                  <SelectValue />
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
              <Select>
                <SelectTrigger className="border-slate-300 focus:border-blue-500">
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
            <Textarea id="remarks" placeholder="Remarks" className="min-h-20 border-slate-300 focus:border-blue-500" />
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
          <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

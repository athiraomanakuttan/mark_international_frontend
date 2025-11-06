"use client"

import type React from "react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Flag } from "lucide-react"
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react"
import { phoneCodes } from "@/data/phoneCodeData"
import type { LeadBasicType, LeadResponse } from "@/types/lead-type"
import { LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STATUS, LEAD_TYPES } from "@/data/Lead-data"
import { updateLead } from "@/service/admin/leadService"
import { toast } from "react-toastify"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/redux/store"
import { fetchAllStaffs } from "@/lib/redux/thunk/staffThunk"

interface EditLeadsModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  leadData: LeadResponse
  onLeadUpdated?: () => void
}

export default function EditLeadsModal({ open, setOpen, leadData, onLeadUpdated }: EditLeadsModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { staffList } = useSelector((state: RootState) => state.staff)

  const [formData, setFormData] = useState<LeadBasicType>({
    name: leadData.name || "",
    phoneNumber: "",
    phoneCode: "",
    leadType: leadData.category ? Number(leadData.category) : undefined,
    assignedAgent: leadData.assignedAgent || "",
    cost: leadData.cost || 0,
    priority: leadData.priority ? Number(leadData.priority) : undefined,
    address: leadData.address || "",
    remarks: leadData.remarks || "",
    leadSource: leadData.leadSource ? Number(leadData.leadSource) : undefined,
    status: leadData.status ? Number(leadData.status) : 1,
    referredBy: leadData.referredBy || "",
  })

  // Track original values for comparison
  const [originalData, setOriginalData] = useState<Partial<LeadBasicType>>({})
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPhoneCode, setSelectedPhoneCode] = useState({
    name: "India",
    code: "+91",
  })

  useEffect(() => {
    if (leadData.phoneNumber) {
      const matchingCode = phoneCodes.find((code) => leadData.phoneNumber?.startsWith(code.code))

      if (matchingCode) {
        setSelectedPhoneCode({
          name: matchingCode.name,
          code: matchingCode.code,
        })
        const phoneWithoutCode = leadData.phoneNumber.split(" ")[1]
        console.log("phoneWithoutCode",phoneWithoutCode)
        const updatedFormData = {
          name: leadData.name || "",
          phoneNumber: phoneWithoutCode,
          phoneCode: matchingCode.code,
          leadType: leadData.category ? Number(leadData.category) : undefined,
          assignedAgent: leadData.assignedAgent || "",
          cost: leadData.cost || 0,
          priority: leadData.priority ? Number(leadData.priority) : undefined,
          address: leadData.address || "",
          remarks: leadData.remarks || "",
          leadSource: leadData.leadSource ? Number(leadData.leadSource) : undefined,
          status: leadData.status ? Number(leadData.status) : 1,
          referredBy: leadData.referredBy || "",
        }
        setFormData(updatedFormData)
        // Store original data for comparison (with full phone number)
        setOriginalData({
          ...updatedFormData,
          phoneNumber: leadData.phoneNumber, // Store original full phone number
        })
      } else {
        console.log("phoneWithoutCode",leadData.phoneNumber.split(" "))
        const updatedFormData = {
          ...formData,
          phoneNumber: leadData.phoneNumber.split(" ")[1] || "",
        }
        setFormData(updatedFormData)
        setOriginalData(updatedFormData)
      }
    } else {
      // Set original data when no phone number exists
      setOriginalData(formData)
    }
  }, [leadData])

  useEffect(() => {
    if (staffList.length === 0) {
      dispatch(fetchAllStaffs())
    }
  }, [dispatch, staffList])

  const filteredPhoneCodes = useMemo(() => {
    if (!searchTerm) {
      return phoneCodes
    }
    return phoneCodes.filter(
      (code) => code.name.toLowerCase().includes(searchTerm.toLowerCase()) || code.code.includes(searchTerm),
    )
  }, [searchTerm])

  const setForm = (field: keyof LeadBasicType, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const getChangedFields = () => {
    const changes: Partial<LeadBasicType & { phoneNumber: string }> = {}
    const currentPhoneNumber = selectedPhoneCode.code +" "+ formData.phoneNumber

    if (formData.name !== (originalData.name || "")) {
      changes.name = formData.name
    }
    
    if (currentPhoneNumber !== (originalData.phoneNumber || "")) {
      changes.phoneNumber = currentPhoneNumber
    }
    
    if (formData.leadType !== (originalData.leadType || undefined)) {
      changes.leadType = formData.leadType
    }
    
    if (formData.assignedAgent !== (originalData.assignedAgent || "")) {
      changes.assignedAgent = formData.assignedAgent
    }
    
    if (formData.cost !== (originalData.cost || 0)) {
      changes.cost = formData.cost
    }
    
    if (formData.priority !== (originalData.priority || undefined)) {
      changes.priority = formData.priority
    }
    
    if (formData.address !== (originalData.address || "")) {
      changes.address = formData.address
    }
    
    if (formData.remarks !== (originalData.remarks || "")) {
      changes.remarks = formData.remarks
    }
    
    if (formData.leadSource !== (originalData.leadSource || undefined)) {
      changes.leadSource = formData.leadSource
    }
    
    if (formData.status !== (originalData.status || 1)) {
      changes.status = formData.status
    }
    
    if (formData.referredBy !== (originalData.referredBy || "")) {
      changes.referredBy = formData.referredBy
    }

    return changes
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const changedFields = getChangedFields()

    // If no changes, don't make API call
    if (Object.keys(changedFields).length === 0) {
      toast.info("No changes detected")
      return
    }

    try {
      console.log("Sending only changed fields:", changedFields)
      const response = await updateLead(leadData.id!, changedFields)
      console.log("response", response)
      if (response.status) {
        toast.success("Lead updated successfully")
        setOpen(false)
      }
    } catch (err: any) {
      toast.error("Error while updating lead")
      console.log("error while updating lead", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogDescription>Update the lead details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client-name">
                  Client Name<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="client-name"
                  placeholder="Client Name"
                  onChange={(e) => setForm("name", e.target.value)}
                  value={formData.name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-number">
                  Contact Number<span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center">
                  <Select
                    value={`${selectedPhoneCode.name}-${selectedPhoneCode.code}`}
                    onValueChange={(value) => {
                      const [countryName, phoneCode] = value.split("-")
                      const selectedCountry = {
                        name: countryName,
                        code: phoneCode,
                      }
                      setForm("phoneCode", phoneCode)
                      setSelectedPhoneCode(selectedCountry)
                    }}
                  >
                    <SelectTrigger className="w-[140px] flex-shrink-0">
                      <SelectValue asChild>
                        <div className="flex items-center gap-2">
                          <Flag className="h-4 w-4" />
                          <span>{selectedPhoneCode.code}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      <div className="px-2 py-1 sticky top-0 bg-white z-10 border-b border-slate-200">
                        <Input
                          placeholder="Search country name or country code..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="mb-2"
                        />
                      </div>
                      {filteredPhoneCodes.map((code, index) => (
                        <SelectItem key={`${code.name}-${index}`} value={`${code.name}-${code.code}`}>
                          <div className="flex items-center gap-2">
                            <Flag className="h-4 w-4" />
                            <span>
                              {code.name} {code.code}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="contact-number"
                    placeholder="Enter number"
                    className="flex-1 rounded-l-none"
                    value={formData.phoneNumber}
                    onChange={(e) => setForm("phoneNumber", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lead-type">Lead Type</Label>
                <Select
                  value={formData.leadType?.toString() || ""}
                  onValueChange={(value) => setForm("leadType", Number(value))}
                >
                  <SelectTrigger id="lead-type" className="w-full">
                    <SelectValue placeholder="Select Lead Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_TYPES.map((type: { name: string; value: number }, index) => (
                      <SelectItem key={index} value={type.value.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assign-agent">Assign Agent</Label>
                <Select
                  value={formData.assignedAgent || ""}
                  onValueChange={(value) => setForm("assignedAgent", value)}
                >
                  <SelectTrigger id="assign-agent" className="w-full">
                    <SelectValue placeholder="Assign Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map((staff) => (
                      <SelectItem value={staff.id || "unassigned"} key={staff.id || "unassigned"}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Cost</Label>
                <Input
                  id="cost"
                  placeholder="Cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setForm("cost", Number.parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority?.toString() || ""}
                  onValueChange={(value) => setForm("priority", Number.parseInt(value))}
                >
                  <SelectTrigger id="priority" className="w-full">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_PRIORITIES.map((priority, index) => (
                      <SelectItem key={index} value={priority.value.toString()}>
                        {priority.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Address"
                  className="min-h-[80px]"
                  value={formData.address}
                  onChange={(e) => setForm("address", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  placeholder="Remarks"
                  className="min-h-[80px]"
                  value={formData.remarks}
                  onChange={(e) => setForm("remarks", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lead-source">Lead Source</Label>
                <Select
                  value={formData.leadSource?.toString() || ""}
                  onValueChange={(value) => setForm("leadSource", Number.parseInt(value))}
                >
                  <SelectTrigger id="lead-source" className="w-full">
                    <SelectValue placeholder="Lead Source" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map((source, index) => (
                      <SelectItem key={index} value={source.value.toString()}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status?.toString() || ""}
                  onValueChange={(value) => setForm("status", Number.parseInt(value))}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUS.map((status, index) => (
                      <SelectItem key={index} value={status.value.toString()}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <h3 className="text-lg font-semibold">Additional Fields</h3>
              <Label htmlFor="referred-by">Referred BY</Label>
              <Input
                id="referred-by"
                placeholder="Referred BY"
                value={formData.referredBy}
                onChange={(e) => setForm("referredBy", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Lead</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
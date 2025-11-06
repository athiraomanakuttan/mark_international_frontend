"use client"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Flag } from "lucide-react" 
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { phoneCodes } from "@/data/phoneCodeData";
import {useFetchFormData} from '@/hook/FormHook'
import { LeadBasicType } from "@/types/lead-type"
import { LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STATUS, LEAD_TYPES } from "@/data/Lead-data"
import {createLead} from '@/service/admin/leadService'
import { toast } from "react-toastify"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/lib/redux/store"
import { fetchAllStaffs } from "@/lib/redux/thunk/staffThunk"
import { useRouter } from "next/navigation"



interface AddLeadsModalProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  pageRefresh?: () => void
}


export default function AddLeadsModal({ open, setOpen, pageRefresh }: AddLeadsModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    
      const { staffList } = useSelector((state: RootState) => state.staff);
    
      useEffect(() => {
        dispatch(fetchAllStaffs());
      }, []);
      // Example initial state
const initialLead: LeadBasicType = {
  name: "",
  phoneCode: "+91",
  phoneNumber: "",
  leadType: 0,
  assignedAgent: "",
  cost: 0,
  priority: 0,
  address: "",
  remarks: "",
  leadSource: 0,
  status: 0,
  referredBy: "",
};

const { formData, setForm } = useFetchFormData<LeadBasicType>(initialLead);


    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPhoneCode, setSelectedPhoneCode] = useState({
    name: "India",
    code: "+91",
  });
  
    useEffect(() => {
    if (staffList.length === 0) {
      dispatch(fetchAllStaffs());
    }
  }, [ staffList]);
    const filteredPhoneCodes = useMemo(() => {
    if (!searchTerm) {
      return phoneCodes;
    } 
    return phoneCodes.filter(
      (code) =>
        code.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.code.includes(searchTerm)
    );
  }, [searchTerm]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you can handle the form submission, e.g., send data to an API
    const finalFormData = {
    ...formData,
    phoneNumber: selectedPhoneCode.code +" "+ formData.phoneNumber,
  } ;
    try{
        const response = await createLead(finalFormData)
        console.log("response", response)
        if(response.status){
            toast.success("Lead created successfully")
            setOpen(false)
            if(pageRefresh)  pageRefresh()
        }
    }
    catch(err:any){
        toast.error("Error while creating lead ")
        console.log("error while creating lead", err)
    }
    
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Leads</DialogTitle>
          <DialogDescription>Fill in the details to add a new lead.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">
                Client Name<span className="text-red-500">*</span>
              </Label>
              <Input id="client-name" placeholder="Client Name" onChange={(e) => setForm("name", e.target.value)} value={formData.name || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-number">
                Contact Number<span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center">
                <Select defaultValue="India-+91"
                onValueChange={(value) => {
                        // Parse the value to get country name and phone code
                        const [countryName, phoneCode] = value.split("-");
                        const selectedCountry = {
                          name: countryName,
                          code: phoneCode,
                        };
                        setForm("phoneCode", phoneCode);
                        setSelectedPhoneCode(selectedCountry);
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
                                            <SelectItem
                                              key={`${code.name}-${index}`} // Unique key
                                              value={`${code.name}-${code.code}`} // Unique value combining country and code
                                            >
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
                <Input id="contact-number" placeholder="Enter number" className="flex-1 rounded-l-none" value={formData.phoneNumber || ""} onChange={(e) => setForm("phoneNumber", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead-type">Lead Type</Label>
              <Select defaultValue="" onValueChange={(value) => setForm("leadType", Number(value))}>
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
              <Select defaultValue="" onValueChange={(value) => setForm("assignedAgent", value)}>
                <SelectTrigger id="assign-agent" className="w-full">
                  <SelectValue placeholder="Assign Agent" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map(staff=>(
                  <SelectItem value={staff.id || "unassigned"} key={staff.id || "unassigned"}>{staff.name}</SelectItem>
                  ))}
                  
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input id="cost" placeholder="Cost" type="number"  value={formData.cost || 0} onChange={(e)=>setForm("cost",parseInt(e.target.value))}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select defaultValue="normal" onValueChange={(value) => setForm("priority", parseInt(value))}>
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_PRIORITIES.map((priority, index) => (
                  <SelectItem key={index} value={priority.value.toString()}>
                    {priority.name}{" "}
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Address" className="min-h-[80px]" value={formData.address || ""} onChange={(e) => setForm("address", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea id="remarks" placeholder="Remarks" className="min-h-[80px]" value={formData.remarks || ""} onChange={(e) => setForm("remarks", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead-source">Lead Source</Label>
              <Select defaultValue="direct-entry" onValueChange={(value) => setForm("leadSource", parseInt(value))}>
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
              <Select defaultValue="" onValueChange={(value) => setForm("status", parseInt(value))}>
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
            <Input id="referred-by" placeholder="Referred BY" value={formData.referredBy || ""} onChange={(e)=>setForm("referredBy",e.target.value)} />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
function dispatch(arg0: any) {
  throw new Error("Function not implemented.")
}


"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/lib/redux/store"
import { fetchAllStaffs } from "@/lib/redux/thunk/staffThunk"
import { toast } from "react-toastify"
import { assignLeads, trannsferLead, updateLead } from "@/service/admin/leadService"


interface LeadAssignProps {
    leadList: string[],
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  leadAssinedSuccess: ()=> void
}


export default function AssignLeadModal({ open, setOpen, leadList, leadAssinedSuccess }: LeadAssignProps) {
    const dispatch = useDispatch<AppDispatch>();
    
      const { staffList } = useSelector((state: RootState) => state.staff);

      const [selectedStaff, setSelectedStaff] = useState<string | null>(null)

      useEffect(() => {
          if (staffList.length === 0) {
            dispatch(fetchAllStaffs());
          }
        }, [ staffList]);

      const handleSubmit = async (e:React.FormEvent)=>{
        e.preventDefault()
        if(!selectedStaff){
          toast.error('select a staff')
          return
        }
        try {
           const response = await assignLeads(leadList,selectedStaff)
           console.log("response response", response)
            if(response.status){
              toast.success("Lead Assigning successfull")
              setOpen(false)
              leadAssinedSuccess() 
            }

        } catch (error){
          toast.error("unable to Assigning the lead. Try again")
        }
      }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Leads</DialogTitle>
          <DialogDescription>Select a new staff for this lead</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
         <div className="space-y-2 ">
              <Select defaultValue="" onValueChange={(value)=> setSelectedStaff(value)}>
                <SelectTrigger id="assign-agent" className="w-82">
                  <SelectValue placeholder="Assign Agent" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map(staff=>(
                  <SelectItem value={staff.id || ""} key={staff.id}>{staff.name}</SelectItem>
                  ))}
                  
                </SelectContent>
              </Select>
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


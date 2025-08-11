"use client"

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RawLeadData, CommonLeadFormData, FinalProcessedLead } from "@/types/lead-import"
import { LEAD_PRIORITIES, LEAD_SOURCES,LEAD_TYPES} from "@/data/Lead-data"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/lib/redux/store"
import { Flag } from "lucide-react"
import { phoneCodes } from "@/data/phoneCodeData"
import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar"
import { fetchAllStaffs } from "@/lib/redux/thunk/staffThunk"
import { bulkLeadUpload } from "@/service/admin/leadService"
import { toast } from "react-toastify"
import { validateLeads } from "@/validation/leadValidation"


export default function LeadImportForm() {
  const [file, setFile] = useState<File | null>(null)
  const [parsedLeads, setParsedLeads] = useState<RawLeadData[]>([])
  const [commonFormData, setCommonFormData] = useState<CommonLeadFormData>({
    defaultCountryCode: "+1", // Default to a common country code
    defaultAddress: "",
    leadCategory: "",
    staff: "",
    leadSource: "",
    priority: "",
  })
    const dispatch = useDispatch<AppDispatch>()
  const { staffList } = useSelector((state: RootState) => state.staff);
  const [error, setError] = useState<string | null>(null)
  const [processedLeads, setProcessedLeads] = useState<FinalProcessedLead[]>([])
  const [searchTerm, setSearchTerm] = useState("");
      const [selectedPhoneCode, setSelectedPhoneCode] = useState({
      name: "India",
      code: "+91",
    });
  useEffect(() => {
    dispatch(fetchAllStaffs())
  }, [dispatch])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setProcessedLeads([]) // Clear previously processed leads

      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        // Basic CSV parsing simulation: assuming comma-separated values
        // Format: name,phoneNumber,countryCode,address
        const lines = text.split("\n").filter((line) => line.trim() !== "")
        const parsedData: RawLeadData[] = lines.map((line) => {
          const [name, phoneNumber, address, countryCode] = line.split(",").map((s) => s.trim())
          return {
            name,
            phoneNumber,
            address: address || undefined,
            countryCode: countryCode || undefined,
          }
        })

        if (parsedData.length > 0) {
          setParsedLeads(parsedData)
          // Reset common form data to defaults or initial values
          setCommonFormData({
            defaultCountryCode: "+1", // Reset to default
            defaultAddress: "",
            leadCategory: "",
            staff: "",
            leadSource: "",
            priority: "",
          })
        } else {
          setError("No valid lead data found in the file.")
          setParsedLeads([])
        }
      }
      reader.readAsText(selectedFile)
    } else {
      setFile(null)
      setParsedLeads([])
      setProcessedLeads([])
      setCommonFormData({
        defaultCountryCode: "+1",
        defaultAddress: "",
        leadCategory: "",
        staff: "",
        leadSource: "",
        priority: "",
      })
    }
  }
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
    

  const handleCommonFormChange = (field: keyof CommonLeadFormData, value: string) => {
    setCommonFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleProcessLeads = async (event: FormEvent) => {
    event.preventDefault()
    if (parsedLeads.length === 0) {
      setError("Please upload a file first.")
      return
    }
    
    const { valid, errors } = validateLeads(parsedLeads, selectedPhoneCode.code);
    if (errors.length > 0) {
  setError(errors.join("\n"));
  return;
}

    const finalLeads: FinalProcessedLead[] = parsedLeads.map((lead) => ({
      name: lead.name,
      phoneNumber: lead.countryCode +" "+lead.phoneNumber,
      countryCode: lead.countryCode || commonFormData.defaultCountryCode, // Use file's CC or default
      address: lead.address || commonFormData.defaultAddress, // Use file's address or default
      leadCategory: commonFormData.leadCategory,
      staff: commonFormData.staff,
      leadSource: commonFormData.leadSource,
      priority: commonFormData.priority,
    }))

    setProcessedLeads(finalLeads)
    try{
        const response = await bulkLeadUpload(finalLeads)
        if(response.status){
            toast.success("file uploaded sucessfully")
            setFile(null)
    setParsedLeads([])
    setCommonFormData({
      defaultCountryCode: "+91",
      defaultAddress: "",
      leadCategory: "",
      staff: "",
      leadSource: "",
      priority: "",
    })
        }
    }catch(err){
        toast.error("Error while")
    }
    
    
  }

  return (
    <ModernDashboardLayout>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">Import Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Lead File (CSV, Excel)
            </Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          {parsedLeads.length > 0 && (
            <form onSubmit={handleProcessLeads} className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                File uploaded with {parsedLeads.length} leads. Fill out common data below.
              </p>
              {/* Static error message as per image */}

              <div className="grid gap-2">
                <div className="flex items-center w-full">
                                <Select defaultValue="India-+91"
                                onValueChange={(value) => {
                                        // Parse the value to get country name and phone code
                                        const [countryName, phoneCode] = value.split("-");
                                        const selectedCountry = {
                                          name: countryName,
                                          code: phoneCode,
                                        };
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
                              </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="default-address">Address (Default for leads without it)</Label>
                <Textarea
                  id="default-address"
                  value={commonFormData.defaultAddress}
                  onChange={(e) => handleCommonFormChange("defaultAddress", e.target.value)}
                  placeholder="Default Address"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2 w-full">
                  <Label htmlFor="lead-category">Lead Category</Label>
                  <Select
                    value={commonFormData.leadCategory}
                    onValueChange={(value) => handleCommonFormChange("leadCategory", value)}
                    required
                  >
                    <SelectTrigger id="lead-category"  className="w-full">
                      <SelectValue placeholder="Select Lead Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_TYPES.map((type) => (
                        <SelectItem key={type.value} value={String(type.value)}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="staff">Staff</Label>
                  <Select
                    value={commonFormData.staff}
                    onValueChange={(value) => handleCommonFormChange("staff", value)}
                    required
                  >
                    <SelectTrigger id="staff"  className="w-full">
                      <SelectValue placeholder="Select Staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffList.map((staff) => (
                        <SelectItem key={staff.id} value={String(staff.id)}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="lead-source">Lead Source</Label>
                  <Select
                    value={commonFormData.leadSource}
                    onValueChange={(value) => handleCommonFormChange("leadSource", value)}
                    required
                  >
                    <SelectTrigger id="lead-source"  className="w-full">
                      <SelectValue placeholder="Select Lead Source" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_SOURCES.map((source) => (
                        <SelectItem key={source.value} value={String(source.value)}>
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={commonFormData.priority}
                    onValueChange={(value) => handleCommonFormChange("priority", value)}
                    required
                  >
                    <SelectTrigger id="priority"  className="w-full">
                      <SelectValue placeholder="Select Priority" />
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

              <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                Process {parsedLeads.length} Leads
              </Button>
            </form>
          )}

          {/* {processedLeads.length > 0 && (
            <div className="mt-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-2">Processed Leads Preview:</h3>
              <div className="max-h-60 overflow-y-auto">
                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                  {JSON.stringify(processedLeads, null, 2)}
                </pre>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                These leads are ready for submission to your backend.
              </p>
            </div>
          )} */}
        </CardContent>
      </Card>
    </div>
    </ModernDashboardLayout>
  )
}

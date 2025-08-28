"use client"

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RawLeadData, CommonLeadFormData, FinalProcessedLead } from "@/types/lead-import"
import { LEAD_PRIORITIES, LEAD_SOURCES, LEAD_TYPES } from "@/data/Lead-data"
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
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [totalRecords, setTotalRecords] = useState(0)
  const MAX_RECORDS_PER_BATCH = 100 // Process 100 records at a time
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB limit
  
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

  const handleDownloadSample = () => {
    const sampleData = [
      ["name", "phoneNumber", "address", "countryCode"],
      ["John Doe", "9876543210", "New York", "+1"],
      ["Jane Smith", "9123456780", "Mumbai", "+91"],
    ];

    // Convert array → CSV string
    const csvContent =
      sampleData.map((row) => row.join(",")).join("\n");

    // Create a blob and link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample-leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function to read file asynchronously
  const readFileAsync = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) {
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
      return
    }

    // Check file size limit
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size too large. Please upload a file smaller than 10MB.")
      return
    }

    setFile(selectedFile)
    setError(null)
    setProcessedLeads([])
    setIsProcessing(true)
    setProgress(0)

    try {
      const text = await readFileAsync(selectedFile)
      const lines = text.split("\n").filter((line) => line.trim() !== "")
      
      // Skip header and get data lines
      const dataLines = lines.slice(1)
      setTotalRecords(dataLines.length)

      // Check if too many records
      if (dataLines.length > 10000) {
        setError("Too many records. Please upload a file with maximum 10,000 records.")
        setIsProcessing(false)
        return
      }

      // Process in chunks to avoid blocking UI
      const parsedData: RawLeadData[] = []
      const chunkSize = 500 // Process 500 lines at a time
      
      for (let i = 0; i < dataLines.length; i += chunkSize) {
        const chunk = dataLines.slice(i, i + chunkSize)
        
        // Process chunk
        const chunkData = chunk.map((line) => {
          const [name, phoneNumber, address, countryCode] = line.split(",").map((s) => s.trim())
          return {
            name,
            phoneNumber,
            address: address || undefined,
            countryCode: countryCode || undefined,
          }
        })
        
        parsedData.push(...chunkData)
        
        // Update progress
        setProgress(Math.min(100, ((i + chunkSize) / dataLines.length) * 100))
        
        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      if (parsedData.length > 0) {
        setParsedLeads(parsedData)
        setCommonFormData({
          defaultCountryCode: "+1",
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
    } catch (err) {
      setError("Error reading file. Please try again.")
      console.error("File reading error:", err)
    } finally {
      setIsProcessing(false)
      setProgress(0)
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

    setIsProcessing(true)
    setProgress(0)

    try {
      const { valid, errors } = validateLeads(parsedLeads, selectedPhoneCode.code)
      if (errors.length > 0) {
        setError(errors.join("\n"))
        setIsProcessing(false)
        return
      }

      const finalLeads: FinalProcessedLead[] = parsedLeads.map((lead) => ({
        name: lead.name,
        phoneNumber: lead.countryCode + " " + lead.phoneNumber,
        countryCode: lead.countryCode || commonFormData.defaultCountryCode,
        address: lead.address || commonFormData.defaultAddress,
        leadCategory: commonFormData.leadCategory,
        staff: commonFormData.staff,
        leadSource: commonFormData.leadSource,
        priority: commonFormData.priority,
      }))

      // Process in batches to avoid timeout
      const batches = []
      for (let i = 0; i < finalLeads.length; i += MAX_RECORDS_PER_BATCH) {
        batches.push(finalLeads.slice(i, i + MAX_RECORDS_PER_BATCH))
      }

      let processedCount = 0
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        
        try {
          const response = await bulkLeadUpload(batch)
          if (response.status) {
            processedCount += batch.length
            setProgress((processedCount / finalLeads.length) * 100)
          } else {
            throw new Error(`Batch ${i + 1} failed`)
          }
        } catch (batchError) {
          setError(`Error processing batch ${i + 1}. ${processedCount} records processed successfully.`)
          setIsProcessing(false)
          return
        }

        // Small delay between batches to prevent overwhelming the server
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      toast.success(`Successfully uploaded ${processedCount} leads!`)
      
      // Reset form
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
      setProcessedLeads([])

    } catch (err) {
      console.error("Upload error:", err)
      toast.error("Error during upload process")
      setError("Upload failed. Please try again.")
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  return (
    <ModernDashboardLayout>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="flex item-end justify-between mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadSample}
            className="bg-emerald-500 hover:bg-emerald-600 text-white hover:text-weight mb-6 ml-auto"
          >
            Download Sample File
          </Button>
        </div>

        <div className="flex flex-col item-center mt-2">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">Import Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Lead File (CSV, Excel) - Max 10MB, 10,000 records
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileChange}
                  disabled={isProcessing}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800"
                />
                {error && <p className="text-red-500 text-sm mt-2 whitespace-pre-line">{error}</p>}
              </div>

              {isProcessing && (
                <div className="mt-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Processing file...</span>
                    <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  {totalRecords > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Processing {totalRecords.toLocaleString()} records
                    </p>
                  )}
                </div>
              )}

              {parsedLeads.length > 0 && !isProcessing && (
                <form onSubmit={handleProcessLeads} className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    File uploaded with {parsedLeads.length.toLocaleString()} leads. Fill out common data below.
                  </p>

                  <div className="grid gap-2">
                    <div className="flex items-center w-full">
                      <Select 
                        defaultValue="India-+91"
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
                      >
                        <SelectTrigger id="lead-category" className="w-full">
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
                      >
                        <SelectTrigger id="staff" className="w-full">
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
                      >
                        <SelectTrigger id="lead-source" className="w-full">
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
                      >
                        <SelectTrigger id="priority" className="w-full">
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

                  {isProcessing && (
                    <div className="mt-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Uploading leads...</span>
                        <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing {parsedLeads.length.toLocaleString()} Leads...
                      </>
                    ) : (
                      `Process ${parsedLeads.length.toLocaleString()} Leads`
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
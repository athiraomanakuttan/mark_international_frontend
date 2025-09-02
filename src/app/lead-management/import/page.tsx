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
import * as XLSX from 'xlsx'

interface ExcelRow {
  [key: string]: any
}

interface ColumnMapping {
  name?: string
  phoneNumber?: string
  address?: string
}

export default function LeadImportForm() {
  const [file, setFile] = useState<File | null>(null)
  const [excelData, setExcelData] = useState<ExcelRow[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
  const [parsedLeads, setParsedLeads] = useState<RawLeadData[]>([])
  const [commonFormData, setCommonFormData] = useState<CommonLeadFormData>({
    defaultCountryCode: "+91",
    defaultAddress: "",
    leadCategory: "",
    staff: "",
    leadSource: "",
    priority: "",
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [totalRecords, setTotalRecords] = useState(0)
  const MAX_RECORDS_PER_BATCH = 100
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB limit
  
  const dispatch = useDispatch<AppDispatch>()
  const { staffList } = useSelector((state: RootState) => state.staff)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPhoneCode, setSelectedPhoneCode] = useState({
    name: "India",
    code: "+91",
  })

  useEffect(() => {
    dispatch(fetchAllStaffs())
  }, [dispatch])

  const handleDownloadSample = () => {
    const sampleData = [
      ["Name", "Phone Number", "Address", "Email", "Company"],
      ["John Doe", "9876543210", "New York, NY", "john@example.com", "ABC Corp"],
      ["Jane Smith", "9123456780", "Mumbai, MH", "jane@example.com", "XYZ Ltd"],
    ]

    const csvContent = sampleData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "sample-leads.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) {
      resetForm()
      return
    }

    // Check file size limit
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size too large. Please upload a file smaller than 10MB.")
      return
    }

    // Check file type
    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      setError("Please upload an Excel file (.xlsx or .xls)")
      return
    }

    setFile(selectedFile)
    setError(null)
    setIsProcessing(true)

    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
      
      if (jsonData.length < 2) {
        setError("File must contain at least a header row and one data row.")
        setIsProcessing(false)
        return
      }

      // Get column headers from first row
      const headers = jsonData[0].map((header: any) => String(header).trim()).filter(Boolean)
      setColumns(headers)

      // Convert data rows to objects
      const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== ''))
      const excelDataFormatted: ExcelRow[] = dataRows.map(row => {
        const rowData: ExcelRow = {}
        headers.forEach((header, index) => {
          rowData[header] = row[index] !== undefined && row[index] !== null ? String(row[index]).trim() : ''
        })
        return rowData
      })

      setExcelData(excelDataFormatted)
      setTotalRecords(excelDataFormatted.length)

      // Auto-detect column mappings
      const autoMapping: ColumnMapping = {}
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase()
        if (lowerHeader.includes('name') && !lowerHeader.includes('company')) {
          autoMapping.name = header
        } else if (lowerHeader.includes('phone') || lowerHeader.includes('mobile') || lowerHeader.includes('contact')) {
          autoMapping.phoneNumber = header
        } else if (lowerHeader.includes('address')) {
          autoMapping.address = header
        }
      })
      setColumnMapping(autoMapping)

    } catch (err) {
      setError("Error reading Excel file. Please try again.")
      console.error("File reading error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setExcelData([])
    setColumns([])
    setColumnMapping({})
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

  const filteredPhoneCodes = useMemo(() => {
    if (!searchTerm) {
      return phoneCodes
    } 
    return phoneCodes.filter(
      (code) =>
        code.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.code.includes(searchTerm)
    )
  }, [searchTerm])

  const handleColumnMappingChange = (field: keyof ColumnMapping, value: string) => {
    setColumnMapping(prev => ({ ...prev, [field]: value === 'none' ? undefined : value }))
  }

  // Function to normalize phone numbers
  const normalizePhoneNumber = (phoneNumber: string, defaultCountryCode: string) => {
    if (!phoneNumber) return { countryCode: defaultCountryCode, number: '' }
    
    const cleanPhone = String(phoneNumber).replace(/\s+/g, '').trim()
    
    // Check if phone number already has a country code (starts with +)
    if (cleanPhone.startsWith('+')) {
      // Extract country code and number
      const match = cleanPhone.match(/^(\+\d{1,4})(.+)$/)
      if (match) {
        return {
          countryCode: match[1],
          number: match[2]
        }
      }
    }
    
    // Check if phone number starts with '00' (international format without +)
    if (cleanPhone.startsWith('00')) {
      const withoutZeros = cleanPhone.substring(2)
      // Try to extract country code (assuming 1-4 digits)
      for (let i = 1; i <= 4; i++) {
        const potentialCode = '+' + withoutZeros.substring(0, i)
        const potentialNumber = withoutZeros.substring(i)
        // Check if this country code exists in our phoneCodes array
        if (phoneCodes.some(code => code.code === potentialCode) && potentialNumber.length >= 6) {
          return {
            countryCode: potentialCode,
            number: potentialNumber
          }
        }
      }
    }
    
    // If no country code detected, use the default
    return {
      countryCode: defaultCountryCode,
      number: cleanPhone
    }
  }

  const processLeadsFromMapping = () => {
    if (!columnMapping.name || !columnMapping.phoneNumber) {
      setError("Please map at least Name and Phone Number columns.")
      return []
    }

    const processedLeads: RawLeadData[] = []
    const errors: string[] = []

    excelData.forEach((row, index) => {
      const name = row[columnMapping.name!]
      const phoneNumber = row[columnMapping.phoneNumber!]
      const address = columnMapping.address ? row[columnMapping.address] : ''

      // Basic validation - check if name and phone are not empty
      if (!name || String(name).trim() === '') {
        errors.push(`Row ${index + 2}: Name is empty`)
        return
      }

      if (!phoneNumber || String(phoneNumber).trim() === '') {
        errors.push(`Row ${index + 2}: Phone number is empty`)
        return
      }

      // Normalize phone number to extract country code and number
      const normalizedPhone = normalizePhoneNumber(phoneNumber, selectedPhoneCode.code)

      processedLeads.push({
        name: String(name).trim(),
        phoneNumber: normalizedPhone.number,
        countryCode: normalizedPhone.countryCode,
        address: address ? String(address).trim() : undefined,
      })
    })

    if (errors.length > 0) {
      setError(errors.join('\n'))
      return []
    }

    return processedLeads
  }

  const handleProcessLeads = async (event: FormEvent) => {
    event.preventDefault()
    
    if (excelData.length === 0) {
      setError("Please upload an Excel file first.")
      return
    }

    

    const processedLeads = processLeadsFromMapping()
    if (processedLeads.length === 0) return

    setIsProcessing(true)
    setProgress(0)

    try {
      // Create final leads - use the country code from normalized phone
      const finalLeads: FinalProcessedLead[] = processedLeads.map((lead) => ({
        name: lead.name,
        phoneNumber: lead.countryCode + " " + lead.phoneNumber,
        countryCode: lead.countryCode,
        address: lead.address || commonFormData.defaultAddress,
        leadCategory: commonFormData.leadCategory,
        staff: commonFormData.staff || "",
        leadSource: commonFormData.leadSource,
        priority: commonFormData.priority,
      }))

      // Process in batches
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

        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      toast.success(`Successfully uploaded ${processedCount} leads!`)
      resetForm()

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
          <Card className="w-full max-w-4xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">Import Leads from Excel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Excel File (.xlsx, .xls) - Max 10MB
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={isProcessing}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
                </div>
              )}

              {columns.length > 0 && !isProcessing && (
                <div className="space-y-6">
                  {/* Column Mapping Section */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Map Excel Columns</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Name Column *</Label>
                        <Select
                          value={columnMapping.name || 'none'}
                          onValueChange={(value) => handleColumnMappingChange('name', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select name column" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">-- None --</SelectItem>
                            {columns.map((col) => (
                              <SelectItem key={col} value={col}>{col}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Phone Number Column *</Label>
                        <Select
                          value={columnMapping.phoneNumber || 'none'}
                          onValueChange={(value) => handleColumnMappingChange('phoneNumber', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select phone column" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">-- None --</SelectItem>
                            {columns.map((col) => (
                              <SelectItem key={col} value={col}>{col}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Address Column (Optional)</Label>
                        <Select
                          value={columnMapping.address || 'none'}
                          onValueChange={(value) => handleColumnMappingChange('address', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select address column" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">-- None --</SelectItem>
                            {columns.map((col) => (
                              <SelectItem key={col} value={col}>{col}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleProcessLeads} className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Found {excelData.length} records in Excel file.
                    </p>

                    {/* Country Code Selection */}
                    <div className="grid gap-2">
                      <Label>Country Code</Label>
                      <div className="flex items-center w-full">
                        <Select 
                          defaultValue="India-+91"
                          onValueChange={(value) => {
                            const [countryName, phoneCode] = value.split("-")
                            setSelectedPhoneCode({
                              name: countryName,
                              code: phoneCode,
                            })
                          }}
                        >
                          <SelectTrigger className="w-[200px] flex-shrink-0">
                            <SelectValue asChild>
                              <div className="flex items-center gap-2">
                                <Flag className="h-4 w-4" />
                                <span>{selectedPhoneCode.name} {selectedPhoneCode.code}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            <div className="px-2 py-1 sticky top-0 bg-white z-10 border-b border-slate-200">
                              <Input
                                placeholder="Search country..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mb-2"
                              />
                            </div>
                            {filteredPhoneCodes.map((code, index) => (
                              <SelectItem
                                key={`${code.name}-${index}`}
                                value={`${code.name}-${code.code}`}
                              >
                                <div className="flex items-center gap-2">
                                  <Flag className="h-4 w-4" />
                                  <span>{code.name} {code.code}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Default Address */}
                    <div className="grid gap-2">
                      <Label htmlFor="default-address">Default Address (for leads without address)</Label>
                      <Textarea
                        id="default-address"
                        value={commonFormData.defaultAddress}
                        onChange={(e) => setCommonFormData(prev => ({ ...prev, defaultAddress: e.target.value }))}
                        placeholder="Default Address"
                        rows={2}
                      />
                    </div>

                    {/* Staff Single Selection */}
                    <div className="grid gap-2">
                      <Label>Select Staff Member *</Label>
                      <Select
                        value={commonFormData.staff}
                        onValueChange={(value) => setCommonFormData(prev => ({ ...prev, staff: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Staff Member" />
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

                    {/* Other Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label>Lead Category</Label>
                        <Select
                          value={commonFormData.leadCategory}
                          onValueChange={(value) => setCommonFormData(prev => ({ ...prev, leadCategory: value }))}
                        >
                          <SelectTrigger>
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
                        <Label>Lead Source</Label>
                        <Select
                          value={commonFormData.leadSource}
                          onValueChange={(value) => setCommonFormData(prev => ({ ...prev, leadSource: value }))}
                        >
                          <SelectTrigger>
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
                        <Label>Priority</Label>
                        <Select
                          value={commonFormData.priority}
                          onValueChange={(value) => setCommonFormData(prev => ({ ...prev, priority: value }))}
                        >
                          <SelectTrigger>
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
                      disabled={isProcessing || !columnMapping.name || !columnMapping.phoneNumber }
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing {excelData.length} Leads...
                        </>
                      ) : (
                        `Process ${excelData.length} Leads`
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}
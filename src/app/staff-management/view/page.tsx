"use client";

import type React from "react";

import { useState, useMemo,useEffect } from "react";
import {
  Plus,
  SquarePen,
  Trash2,
  Eye,
  Search,
  User,
  Lock,
  Mail,
  ImageIcon,
  DollarSign,
  Flag,
  RefreshCcw
} from "lucide-react";

import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {ConfirmDialog} from '@/components/confirmBox'

import { useFetchFormData } from "@/hook/FormHook";
import { StaffBasicType } from "@/types/staff-type";
import { phoneCodes } from "@/data/phoneCodeData";
import { staffFormValidation } from "@/validation/staffValidation";
import {createStaff, updateStatus} from "@/service/admin/staffService";
import { toast } from "react-toastify";
import { getStaffList } from "@/service/admin/staffService";
import { StaffDataType } from "@/types/staff-type";
import UpdateStaffModal from "@/components/admin/updateStaff";
import Link from "next/link";

import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/lib/redux/store"
import { fetchAllStaffs } from "@/lib/redux/thunk/staffThunk"
import { DATA_LIMIT } from "@/data/limitData";
import { DesignationResponse } from "@/types/designation-types";
import { getDesignations } from "@/service/admin/designationService";
import { set } from "date-fns";

// Placeholder data for staff members/


export default function StaffManagementViewPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { formData, setForm } = useFetchFormData<StaffBasicType>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhoneCode, setSelectedPhoneCode] = useState({
    name: "India",
    code: "+91",
  });
  const [staffStatus, setStaffStatus] = useState(1);
  const [loading,setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StaffDataType | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [designations, setDesignations] = useState<DesignationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
  

   const fetchDesignations = async () => {
      setIsLoading(true);
      try {
        const response = await getDesignations(1, 50,{status:[1]}
        );
        if (response.status) {
          setDesignations(response.data.designations);
        }
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to fetch designations');
        console.error('Error fetching designations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchDesignations()
    },[])



  const handleClickDelete = (staffId: string) => {
    setSelectedStaffId(staffId);
    setConfirmOpen(true);
  };
const [paginationData, setPaginationData]= useState({
    currentPage: 1,
    totalPages: 1,
    limit:5,
    totalItems: 0,
})
  const [staffData, setStaffData] = useState<StaffDataType[]>([]);
  const getData = async (pageOverride?: number) => {
  try {
    setLoading(true);
    const currentPage = pageOverride ?? paginationData.currentPage;
    const response = await getStaffList(staffStatus, currentPage, paginationData.limit);
    if (response.status) {
      const { users, totalRecords } = response.data;
      console.log("user list", users)
      setStaffData(users);
      setPaginationData((prev) => ({
        ...prev,
        totalItems: totalRecords || 0,
        totalPages: Math.ceil((totalRecords || 0) / prev.limit),
      }));
    }

    setLoading(false);
  } catch (error) {
    console.error("Error fetching staff list", error);
    setLoading(false);
  }
};

  useEffect(() => {
  getData();
}, [paginationData.currentPage, paginationData.limit, staffStatus, isEditModalOpen]);


  useEffect(()=>{
    setForm("phoneCode", selectedPhoneCode.code);
  },[selectedPhoneCode]) 

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

  const handleConfirmDelete = async () => {
    if (!selectedStaffId) return;
    try {
      const response = await updateStatus(selectedStaffId, 0);
      if (response.status) {
        toast.success("Staff status updated successfully!");
        getData();
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update staff status.");
    } finally {
      setConfirmOpen(false);
      setSelectedStaffId(null);
    }
  };
  const updateStaffStat = async (staffId: string,status=-1) => {
    try {
      const response = await updateStatus(staffId, status);
      if (response.status) {
        toast.success("Staff deleted successfully!");
        getData();
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete staff.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setForm("profilePic", event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const isValidate = staffFormValidation(formData);

  if (!isValidate.isValid) {
    console.error("Form validation failed", isValidate.errors);
    toast.error(isValidate.errors);
    return;
  }

  // Merge phoneCode + phoneNumber without updating the original state
  const finalFormData = {
    ...formData,
    phoneNumber: formData.phoneCode + formData.phoneNumber,
  };

  try {
    const response = await createStaff(finalFormData);

  if (response.status) {
    toast.success("Staff member added successfully!");
    setIsModalOpen(false); // Close modal on submit
    getData()
  }
  } catch (error :any) {
    toast.error(error?.message ||"Failed to add staff member. Please try again.");
  }
  

};

const changeLimit = (value: string) => {
  console.log("Selected limit:", value);
  const limit = Number(value);
  setPaginationData((prev) => ({ ...prev, limit }));

  
  getData();  
};
  const changePage = (page: number) => {
    setPaginationData((prev) => ({ ...prev, currentPage: page }));
  };
   const dispatch = useDispatch<AppDispatch>()
  const { staffList } = useSelector((state: RootState) => state.staff);
  useEffect(() => {
      dispatch(fetchAllStaffs())
    }, [dispatch])

  return (

    <ModernDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            Staff Management
          </h1>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}> 
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" /> Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900">
                  Add New Staff
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Fill in the details to add a new staff member.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-medium">
                    Name<span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      placeholder="Enter Full Name"
                      required
                      className="pl-10"
                      onChange={(e) => setForm("name", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 font-medium">
                    Phone Number<span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center space-x-2">
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
                        setForm("phoneCode", phoneCode);
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
                    <div className="relative flex-1">
                      <Input
                        id="phone"
                        placeholder="Enter Phone Number"
                        required
                        onChange={(e) => setForm("phoneNumber", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-slate-700 font-medium"
                  >
                    Password<span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type="text"
                      placeholder="password"
                      required
                      className="pl-10"
                      onChange={(e) => setForm("password", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="designation"
                    className="text-slate-700 font-medium"
                  >
                    Designation<span className="text-red-500">*</span>
                  </Label>
                  <Select
                    required
                    onValueChange={(value) => setForm("designation", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {designations.map((designation) => (
                            <SelectItem key={designation.id} value={designation.name}>
                              {designation.name}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email Id
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter Your Email"
                      className="pl-10"
                      onChange={(e) => setForm("email", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="staff-image"
                    className="text-slate-700 font-medium"
                  >
                    Staff Image
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center space-x-2 bg-transparent"
                    >
                      <ImageIcon className="h-4 w-4" />
                      <Label htmlFor="staff-image" className="cursor-pointer">
                        Choose File
                      </Label>
                      <Input
                        id="staff-image"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </Button>
                    <span className="text-slate-500 text-sm">
                      {selectedFile ? selectedFile.name : "No file chosen"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="accessible-users"
                    className="text-slate-700 font-medium"
                  >
                    Accessible Users
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setForm("accessibleUsers", [
                        ...(formData.accessibleUsers || []),
                        Number.parseInt(value),
                      ])
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
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
                <div className="space-y-2">
                  <Label
                    htmlFor="opening-balance"
                    className="text-slate-700 font-medium"
                  >
                    Opening Balance
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="opening-balance"
                      type="number"
                      placeholder="Enter Opening balance"
                      className="pl-10"
                      onChange={(e) =>
                        setForm("openingBalance", Number(e.target.value))
                      }
                    />
                  </div>
                </div>
                <DialogFooter className="md:col-span-2 mt-6">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Submit
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          {(isEditModalOpen && selectedUser) && (
            <UpdateStaffModal
              isOpen={isEditModalOpen}
              setIsOpen={setIsEditModalOpen}
              user={selectedUser}
              selectedFile={selectedFile}
              handleFileChange={handleFileChange}
            />
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <span className="text-slate-700 font-medium">Staff Status</span>
            <Select
              defaultValue="1"
              onValueChange={(value)=>setStaffStatus(Number(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Active" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Active</SelectItem>
                <SelectItem value="0">Deleted</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              View
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center space-x-2">
              <span className="text-slate-700 font-medium">Show</span>
              <Select defaultValue={DATA_LIMIT[0].toString()} onValueChange={(value) => changeLimit(value)}>
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder={DATA_LIMIT[0].toString()} />
                </SelectTrigger>
                <SelectContent>
                  {DATA_LIMIT.map(limit =>(
                    <SelectItem value={limit.toString()} key={limit}>{limit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-slate-700 font-medium">entries</span>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 w-full"
              />
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* load a spinner n loading */}
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : staffData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No staff members found.
                  </TableCell>
                </TableRow>
              ) : (
                staffData.length > 0 && staffData.map((staff, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{index+1}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">   
                      {staff?.profilePic ? <img
                        src={staff?.profilePic || "/placeholder.svg"}
                        alt={staff.name}
                        className="w-8 h-8 rounded-full object-cover"
                      /> : <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <User className="h-4 w-4 text-white" />
                      </div>}
                      <span>{staff.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{staff?.phoneNumber}</TableCell>
                  <TableCell>{staff.designation}</TableCell>
                  { staffStatus === 1 ? (
                    <TableCell className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-orange-100 hover:bg-orange-200 text-orange-600"
                      onClick={() => {
                        setSelectedUser(staff);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <SquarePen className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-red-100 hover:bg-red-200 text-red-600"
                       onClick={() => handleClickDelete(staff.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Link href={`/staff-management/view/${staff.id}`}>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-blue-100 hover:bg-blue-200 text-blue-600"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    </Link>
                  </TableCell>
                  ):(
                    <TableCell className="flex justify-center space-x-2">
                    
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-red-100 hover:bg-red-200 text-red-600"
                       onClick={() => updateStaffStat(staff.id,-1)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-blue-100 hover:bg-blue-200 text-blue-600"
                      onClick={() => {updateStaffStat(staff.id,1)}}
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  )}
                  
                </TableRow>
              )) )}
            </TableBody>
          </Table>
          
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200">
  {/* Pagination Summary */}
  <span className="text-sm text-slate-600">
    Showing page <strong>{paginationData.currentPage}</strong> of{" "}
    <strong>{paginationData.totalPages}</strong>
  </span>

  {/* Pagination Buttons */}
  <div className="flex items-center gap-2">
    <Button
      className="bg-blue-600 hover:bg-blue-700 text-white"
      variant="outline"
      disabled={paginationData.currentPage === 1}
      onClick={() => changePage(paginationData.currentPage - 1)}
    >
      Previous
    </Button>

    <span className="text-sm text-slate-600">
      Page {paginationData.currentPage} of {paginationData.totalPages}
    </span>

    <Button
    className="bg-blue-600 hover:bg-blue-700 text-white"
      variant="outline"
      disabled={paginationData.currentPage === paginationData.totalPages}
      onClick={() => changePage(paginationData.currentPage + 1)}
    >
      Next
    </Button>
  </div>
</div>
<ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this user?"
      />

      </div>
    </div>
    </ModernDashboardLayout>
  );
}

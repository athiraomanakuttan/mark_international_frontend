"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"  
import {Input} from "@/components/ui/input";  
import { Label } from "@/components/ui/label";  
import { Button } from "@/components/ui/button"; 
import {
  User,
  Lock,
  Mail,
  ImageIcon,
  DollarSign,
  Flag,
  Plus,
} from "lucide-react";

import React, { use } from "react";

type CountryCode = { name: string; code: string };
import { useEffect } from "react";
import {useFetchFormData} from "@/hook/FormHook"; // adjust this import based on your structure
import { StaffDataType, StaffUpdateType } from "@/types/staff-type";
import { updateStaff } from "@/service/admin/staffService";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
interface AddStaffModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedFile: File | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  user: StaffDataType; 
}
const UpdateStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  setIsOpen,
  selectedFile,
  handleFileChange,
  user,
}) => {
  
  console.log("user in update staff modal", user);
    const { setForm,formData } = useFetchFormData();
   
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  console.log("on submit ", formData,selectedFile);
  try {
    const updatedData = {
      ...formData,
      profilePic: selectedFile,
    }  as StaffUpdateType;
    const response = await updateStaff(user.id, updatedData);
    if(response.status){
      toast.success("Staff member updated successfully.");
      setIsOpen(false); // Close the modal on success
    }
    
  } catch (error) {
    toast.error("Failed to update staff member.");
    console.error("Error updating staff:", error);
  }
}
 const dispatch = useDispatch<AppDispatch>()
  const { staffList } = useSelector((state: RootState) => state.staff);
  

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Update Staff
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Fill in the details to update the staff member.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4"
        >
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 font-medium">
              Name<span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="name"
                placeholder="Enter Full Name"
                className="pl-10"
                value={ formData?.name ||user?.name || ""}
                onChange={(e) => setForm("name", e.target.value)}
              />
            </div>
          </div>

          {/* Phone Number Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-700 font-medium">
              Phone Number<span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center space-x-2">
              
              <div className="relative flex-1">
                <Input
                  id="phone"
                  placeholder="Enter Phone Number"
                  value={ formData?.phoneNumber || user.phoneNumber || ""}
                  onChange={(e) => setForm("phoneNumber", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 font-medium">
              Password<span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type="text"
                placeholder="password"
                className="pl-10"
                onChange={(e) => setForm("password", e.target.value)}
              />
            </div>
          </div>

          {/* Designation */}
          <div className="space-y-2">
            <Label htmlFor="designation" className="text-slate-700 font-medium">
              Designation<span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => setForm("designation", value)}
              defaultValue={formData?.designation || user.designation || ""}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="education-consultant">
                  Education Consultant
                </SelectItem>
                <SelectItem value="business-development-manager">
                  Business Development Manager
                </SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
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
                value={formData?.email || user?.email || ""}
                onChange={(e) => setForm("email", e.target.value)}
              />
            </div>
          </div>

          {/* Image Upload */}
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

          {/* Accessible Users */}
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

          {/* Opening Balance */}
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
                value={formData?.openingBalance || user?.openingBalance || ""}
                onChange={(e) =>
                  setForm("openingBalance", Number(e.target.value))
                }
              />
            </div>
          </div>

          {/* Submit */}
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
  );
};

export default UpdateStaffModal;

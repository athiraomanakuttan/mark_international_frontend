"use client"

import type React from "react"

import { useState } from "react"
import { Plus, SquarePen, Trash2, Eye, Search, User, Lock, Mail, ImageIcon, DollarSign } from "lucide-react"

import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

// Placeholder data for staff members
const staffData = [
  {
    id: 1,
    name: "Ann",
    phone: "918921895055",
    designation: "EDUCATION CONSULTANT",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 2,
    name: "Smitha",
    phone: "447877833168",
    designation: "EDUCATION CONSULTANT",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 3,
    name: "Ernakulam Branch",
    phone: "919363575984",
    designation: "BUSINESS DEVELOPMENT MANA",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

export default function StaffManagementViewPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    } else {
      setSelectedFile(null)
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Handle form submission logic here
    console.log("Form submitted!")
    setIsModalOpen(false) // Close modal on submit
  }

  return (
    <ModernDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" /> Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900">Add New Staff</DialogTitle>
                <DialogDescription className="text-slate-600">
                  Fill in the details to add a new staff member.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-medium">
                    Name<span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="name" placeholder="Enter Full Name" required className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 font-medium">
                    Phone Number<span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Select defaultValue="+91">
                      <SelectTrigger className="w-[80px]">
                        <SelectValue placeholder="+91" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+91">+91</SelectItem>
                        <SelectItem value="+1">+1</SelectItem>
                        <SelectItem value="+44">+44</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative flex-1">
                      <Input id="phone" placeholder="Enter Phone Number" required />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    Password<span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="password" type="text" placeholder="password" required className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation" className="text-slate-700 font-medium">
                    Designation<span className="text-red-500">*</span>
                  </Label>
                  <Select required>
                    <SelectTrigger className="w-full">
                      {" "}
                      {/* Added w-full here */}
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="education-consultant">Education Consultant</SelectItem>
                      <SelectItem value="business-development-manager">Business Development Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email Id
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="email" type="email" placeholder="Enter Your Email" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-image" className="text-slate-700 font-medium">
                    Staff Image
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Button type="button" variant="outline" className="flex items-center space-x-2 bg-transparent">
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
                  <Label htmlFor="accessible-users" className="text-slate-700 font-medium">
                    Accessible Users
                  </Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      {" "}
                      {/* Added w-full here */}
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user1">User 1</SelectItem>
                      <SelectItem value="user2">User 2</SelectItem>
                      <SelectItem value="user3">User 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opening-balance" className="text-slate-700 font-medium">
                    Opening Balance
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="opening-balance" type="number" placeholder="Enter Opening balance" className="pl-10" />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2 mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="whatsapp-access" />
                    <Label htmlFor="whatsapp-access" className="text-slate-700 font-medium">
                      Access Official Whatsapp
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="phone-call-log" />
                    <Label htmlFor="phone-call-log" className="text-slate-700 font-medium">
                      Access Phone Call Log
                    </Label>
                  </div>
                </div>
                <DialogFooter className="md:col-span-2 mt-6">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Submit
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <span className="text-slate-700 font-medium">Permissions</span>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-blue-500 hover:bg-blue-600 text-white">
              View
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex items-center space-x-2">
              <span className="text-slate-700 font-medium">Show</span>
              <Select defaultValue="10">
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-slate-700 font-medium">entries</span>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input type="search" placeholder="Search..." className="pl-10 w-full" />
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
              {staffData.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img
                        src={staff.avatar || "/placeholder.svg"}
                        alt={staff.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span>{staff.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{staff.phone}</TableCell>
                  <TableCell>{staff.designation}</TableCell>
                  <TableCell className="flex justify-center space-x-2">
                    <Button variant="outline" size="icon" className="bg-orange-100 hover:bg-orange-200 text-orange-600">
                      <SquarePen className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="bg-red-100 hover:bg-red-200 text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="bg-blue-100 hover:bg-blue-200 text-blue-600">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}

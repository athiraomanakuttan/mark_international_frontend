'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Mail, Phone, User, Calendar, DollarSign, Shield } from "lucide-react"
import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getStaffById } from "@/service/admin/staffService"
import { StaffDataResponse } from "@/types/staff-type"

export default function UserDetailsPage() {
  const { id } = useParams()
  const [user, setUser] = useState<StaffDataResponse>({
    _id: "",
    name: "dddd",
    phoneNumber: "ddd",
    designation: "",
    email: "",
    accessibleUsers: [],
    openingBalance: 0,
    role: "",
    profilePic: "",
    isActive: 1,
    createdAt: "",
    updatedAt: "",
  })

  async function fetchStaffData() {
    try {
      const response = await getStaffById(String(id))
      if (response.status) {
        setUser(response.data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchStaffData()
  }, [id])
  useEffect(()=>{
    console.log("user=====", user)
  },[user])

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <Badge variant="default" className="bg-green-500">
            Active
          </Badge>
        )
      case 0:
        return <Badge variant="secondary">Inactive</Badge>
      case -1:
        return <Badge variant="destructive">Suspended</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === "admin" ? "default" : "secondary"} className="capitalize">
        <Shield className="w-3 h-3 mr-1" />
        {role}
      </Badge>
    )
  }

  const safeDaysActive = () => {
    if (user?.createdAt && !isNaN(new Date(user.createdAt).getTime())) {
      return Math.floor(
        (Date.now() - new Date(user.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
      )
    }
    return 0
  }

  const safeDate = (dateString: string) => {
    return dateString && !isNaN(new Date(dateString).getTime())
      ? new Date(dateString).toLocaleDateString()
      : "—"
  }

  return (
    <ModernDashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section with User Info */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
          <div className="relative px-6 py-12">
            <div className="flex items-start gap-6 ">
              <Avatar className="w-24 h-24 border-4 border-white/20">
                <AvatarImage src={user.profilePic || undefined} />
                <AvatarFallback className="bg-white/20 text-white text-2xl font-semibold">
                  {user?.name
                    ? user.name.split(" ").map((n) => n[0]).join("")
                    : ""}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                <p className="text-blue-100 text-lg mb-4">{user.designation}</p>

                <div className="flex items-center gap-6 text-blue-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.isActive)}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Information Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <Separator />

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mobile</span>
                      <span className="font-medium">{user.phoneNumber}</span>
                    </div>
                    <Separator />

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium text-sm">{user.email}</span>
                    </div>
                    <Separator />

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Designation</span>
                      <span className="font-medium text-sm">{user.designation}</span>
                    </div>
                    <Separator />

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role</span>
                      <span className="font-medium capitalize">{user.role}</span>
                    </div>
                    <Separator />

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Opening Balance</span>
                      <span className="font-medium">₹{user.openingBalance}</span>
                    </div>
                    <Separator />

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Accessible Users</span>
                      <span className="font-medium">{user?.accessibleUsers?.length || 0} users</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity & Stats Cards */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Activity Status</CardTitle>
                  <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-GB")}</span>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{user.accessibleUsers?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Accessible Users</div>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">₹{user.openingBalance}</div>
                      <div className="text-sm text-muted-foreground">Opening Balance</div>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{safeDaysActive()}</div>
                      <div className="text-sm text-muted-foreground">Days Active</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">Created</div>
                        <div className="font-medium">{safeDate(user.createdAt)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">Last Updated</div>
                        <div className="font-medium">{safeDate(user.updatedAt)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">Contact</div>
                        <div className="font-medium">{user.phoneNumber}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <DollarSign className="w-5 h-5 text-orange-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">Balance</div>
                        <div className="font-medium">₹{user.openingBalance}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ModernDashboardLayout>
  )
}

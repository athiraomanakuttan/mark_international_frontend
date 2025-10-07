import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LEAD_PRIORITIES, LEAD_STATUS } from "@/data/Lead-data"
import { LeadResponse } from "@/types/lead-type"
import { Phone, MapPin, Calendar, User, DollarSign } from "lucide-react"



interface LeadHeaderProps {
  leadData: LeadResponse | null
}

export function LeadHeader({ leadData }: LeadHeaderProps) {
  return (
    <Card className="mb-6 shadow-lg border-slate-200">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-blue-100">
              <AvatarImage src="/placeholder.svg?height=64&width=64" />
              <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                AL
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">{leadData?.name}</h1>
                <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm">
                  Lead priority: {LEAD_PRIORITIES.find((data)=> data.value === Number(leadData?.priority))?.name}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4 text-blue-500" />
                  <span className="text-slate-700">{leadData?.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span>Address</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span>
                    Create Date: <span className="text-slate-700">{leadData?.createdAt}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>
                    category: <span className="text-slate-700">{leadData?.category}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4 text-orange-500" />
                  <span>
                    Staff: <span className="text-slate-700">{leadData?.assignedAgent_name}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span>
                    Cost: <span className="text-slate-700">{leadData?.cost || 0 }  </span>
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-300"
                >
                  {LEAD_STATUS.find((data) => data.value === Number(leadData?.status))?.name}
                </Badge>
                
              </div>
            </div>
          </div>
          
        </div>
      </CardContent>
    </Card>
  )
}

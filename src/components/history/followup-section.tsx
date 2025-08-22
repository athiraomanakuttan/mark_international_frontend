import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Phone, MessageSquare, Clock } from "lucide-react"
import { AddFollowupModal } from "./add-followup-modal"
import { FollowupData } from "@/types/lead-type"



interface FollowupSectionProps {
  followup ?: FollowupData | null
  isAddFollowupOpen: boolean
  setIsAddFollowupOpen: (open: boolean) => void
}

export function FollowupSection({ followup, isAddFollowupOpen, setIsAddFollowupOpen }: FollowupSectionProps) {
  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Followup Details</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-green-300 text-green-600 hover:bg-green-50 bg-transparent"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="border-blue-300 text-blue-600 hover:bg-blue-50 bg-transparent">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <AddFollowupModal isOpen={isAddFollowupOpen} onOpenChange={setIsAddFollowupOpen} userId={followup?.id || ""} />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div key={followup?.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-slate-300 to-slate-400 rounded-full p-3 text-sm font-medium text-slate-800 shadow-sm">
                  {followup?.date}
                </div>
                <div className="w-px bg-slate-300 h-8 mt-2"></div>
              </div>
              <div className="flex-1">
                
                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          S
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-slate-800">{followup?.user}</span>
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      <strong>Created Date:</strong> <span className="text-slate-700">{followup?.createdDate}</span>
                    </div>
                    <div className="text-sm text-slate-600">
                      <strong>Remarks:</strong> <span className="text-slate-700">{followup?.remarks}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}

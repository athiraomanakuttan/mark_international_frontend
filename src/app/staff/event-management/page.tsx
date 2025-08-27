"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { EventType } from "@/types/event-types"
import { StaffBasicType } from "@/types/staff-type"

import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/lib/redux/store"
import { fetchAllStaffs } from "@/lib/redux/thunk/staffThunk"
import { toast } from "react-toastify"
import { createEvent, getUpcomingEvents, updateEvent } from "@/service/eventService"
import { EventCard } from "@/components/events/staff/event-card"
import { ModernDashboardLayout } from "@/components/staff/modern-dashboard-navbar"
import Link from "next/link"



export default function EventsPage() {
  const [events, setEvents] = useState<EventType[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventType | undefined>()

  const dispatch = useDispatch<AppDispatch>()
const { staffList } = useSelector((state: RootState) => state.staff);
useEffect(() => {
    dispatch(fetchAllStaffs())
  }, [dispatch])

  

  const handleAddEvent = () => {
    setEditingEvent(undefined)
    setIsModalOpen(true)
  }


  const getUpcomingEventData = async ()=>{
    try{
      const response = await getUpcomingEvents()
      if(response.status){
        setEvents(response.data)
      }
    }catch(err){
      console.log("error while getting data", err)
    }
  }
useEffect(()=>{
  getUpcomingEventData()
},[isModalOpen])
  return (
    <ModernDashboardLayout>
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Events</h1>
            <p className="text-slate-600 mt-1">Manage your event assignments</p>
          </div>
          
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg mb-4">No events found</p>
            
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link href={`/staff/event-management/create/${event?._id}`} key={event?._id || ""}>
                <EventCard
                  key={event?._id || ""}
                  event={event}
                  staff={staffList}
                />
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
    </ModernDashboardLayout>
  )
              
}

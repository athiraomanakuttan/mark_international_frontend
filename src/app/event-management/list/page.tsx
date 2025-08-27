"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EventModal } from "@/components/events/event-modal"
import { EventCard } from "@/components/events/event-card"
import type { EventType } from "@/types/event-types"
import { StaffBasicType } from "@/types/staff-type"

import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/lib/redux/store"
import { fetchAllStaffs } from "@/lib/redux/thunk/staffThunk"
import { toast } from "react-toastify"
import { createEvent, deleteEvent, getUpcomingEvents, updateEvent } from "@/service/eventService"
import { ModernDashboardLayout } from "@/components/navbar/modern-dashboard-navbar"



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

  const handleEditEvent = (event: EventType) => {
    setEditingEvent(event)
    setIsModalOpen(true)
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try{
        const response = await deleteEvent(eventId)
        if(response.status){
          setEvents((prev) => prev.filter((event) => event._id !== eventId))
          getUpcomingEventData()
        }
      }catch(err){
        toast.error("unable to delete Event. Try again")
      }
    }
  } 

  const handleSaveEvent = async (eventData: Omit<EventType, "id"> | EventType) => {
    console.log("eventData", eventData)
    if ("_id" in eventData) {
      try{
        const response = await updateEvent(eventData._id || "", eventData)
      if(response.status){
        toast.success("Event updated successfully")
      }
      }catch(err){
        toast.error("unable to update Event. Try again")
      }
    } else {
      // Adding new event
      try{
        const response = await createEvent(eventData)
        if(response.status)
         {
          toast.success("Event created successfully")
          setIsModalOpen(false)
         } 
      }catch(err){
        toast.error("unable to create Event. Try again")
      }
    }

    getUpcomingEventData()
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
            <p className="text-slate-600 mt-1">Manage your events and staff assignments</p>
          </div>
          <Button
            onClick={handleAddEvent}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg mb-4">No events found</p>
            <Button
              onClick={handleAddEvent}
              variant="outline"
              className="border-slate-200 text-slate-600 hover:bg-slate-50 bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create your first event
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event?._id || ""}
                event={event}
                staff={staffList}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
              />
            ))}
          </div>
        )}

        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveEvent}
          event={editingEvent}
          staff={staffList}
        />
      </div>
    </div>
    </ModernDashboardLayout>
  )
}

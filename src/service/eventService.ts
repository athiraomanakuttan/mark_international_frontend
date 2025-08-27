import axiosInstance from "./axiosInstance"
import { EventType } from "@/types/event-types"

export const createEvent = async (eventData:EventType)=>{
    try {
        const response = await axiosInstance.post('/events',eventData)
        return response.data
    } catch (error) {
        throw error
    }
}

export const getUpcomingEvents = async()=>{
    try{
        const response = await axiosInstance.get('/events/upcoming')
        return response.data
    }catch(err){
        throw err
    }
}

export const updateEvent = async (eventId: string, eventData: EventType) => {
    try {
        const response = await axiosInstance.patch(`/events/update/${eventId}`, eventData)
        return response.data
    } catch (error) {
        throw error
    }
}

export const deleteEvent = async (eventId: string) => {
    try{
        const response = await axiosInstance.delete(`/events/${eventId}`)
        return response.data
    }catch(err){
        throw err
    }
}

export const getRecentEvents = async ()=>{
    try{
        const response = await axiosInstance.get('/events/recent')
        return response.data
    }catch(err){
        throw err
    }
}

export const getStudentData = async (eventId: string, staffId?: string)=>{
    try{
        const response = await axiosInstance.get(`/events/data/${eventId}?staffId=${staffId}`)
        return response.data
    }catch(err){
        throw err
    }
}
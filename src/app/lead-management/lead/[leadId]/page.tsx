'use client'
import { getLeadHistory } from '@/service/leadHistoryService'
import { useParams } from 'next/navigation'
import React, { useEffect } from 'react'

const page = () => {
    const {leadId} = useParams()
    console.log(leadId,"leadId")
    const getHistoryData = async ()=>{
        try{
            const response = await getLeadHistory(String(leadId))
            console.log(response) 
        }catch(err){
            console.log(err)
        }
    }
    useEffect(()=>{
        getHistoryData()
    },[leadId])
  return (
    <div>
      
    </div>
  )
}

export default page

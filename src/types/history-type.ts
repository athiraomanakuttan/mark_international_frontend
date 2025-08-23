export interface HistoryData {
  _id: string
  leadId: string
  historyType: number
  updatedStatus?: number
  createdAt: string
  description: string
  updatedBy?: string
  createdBy?: string
  to?: string
}
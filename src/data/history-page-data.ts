export const getHistoryTypeIcon = (historyType: number) => {
  switch (historyType) {
    case 1:
      return "👤"
    case 2:
      return "📊"
    case 4:
      return "🔄"
    default:
      return "📝"
  }
}

export const getHistoryTypeColor = (historyType: number) => {
  switch (historyType) {
    case 1:
      return "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-300"
    case 2:
      return "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-300"
    case 4:
      return "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-300"
    default:
      return "bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border-slate-300"
  }
}
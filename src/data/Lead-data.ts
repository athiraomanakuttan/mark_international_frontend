export const LEAD_TYPES:{name:string, value:number}[] = [{name:"Study Abroad", value:1}]
export const LEAD_PRIORITIES:{name:string, value:number}[] = [{name:"High", value:1}, {name:"Normal", value:2}, {name:"Low", value:3}, {name:"Negative", value:4}]
export const LEAD_SOURCES :{name: string, value:number}[]= [{name:"Direct Entry", value:1}, {name:"Lead from CSV", value:2}]
export const LEAD_STATUS:{name:string, value:number}[] = [{name:"Deleted", value:0},{name:"New", value:1}, {name:"Confirmed", value:2},  {name:"Follow Up", value:3},{name:"Rejected", value:4}, {name:"Lost", value:5}, {name:"Converted", value:6}]

export const statusColors: Record<number, string> = {
      0: "text-red-400",   // Deleted
      1: "text-blue-500",   // New
      2: "text-green-500",  // Confirmed
      3: "text-yellow-500", // Follow Up
      4: "text-red-500",    // Rejected
      5: "text-orange-500", // Lost
      6: "text-purple-500", // Converted
    };

export const priorityColors: Record<number, string> = {
        1: "bg-green-500",   // High
        2: "bg-blue-500",  // Normal
        3: "bg-red-500", // Low
        4: "bg-gray-400",  // Negative
};
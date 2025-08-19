"use client"

import { ColumnDef } from "@tanstack/react-table"
import { LogEntry } from "./mock-log-data"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<LogEntry>[] = [
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    cell: ({ row }) => {
      return new Date(row.getValue("timestamp")).toLocaleString()
    }
  },
  {
    accessorKey: "agentName",
    header: "Agent",
  },
  {
    accessorKey: "userInput",
    header: "User Input",
  },
  {
    accessorKey: "agentResponse",
    header: "Agent Response",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variant = status === "Success" ? "default" : status === "Error" ? "destructive" : "secondary"
      return <Badge variant={variant}>{status}</Badge>
    }
  },
]

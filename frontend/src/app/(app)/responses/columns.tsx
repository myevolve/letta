"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Run } from "@letta-ai/letta-client/api/types"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<Run>[] = [
  {
    accessorKey: "created_at",
    header: "Timestamp",
    cell: ({ row }) => {
      return new Date(row.getValue("created_at")).toLocaleString()
    }
  },
  {
    accessorKey: "agent_id",
    header: "Agent ID",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variant = status === "completed" ? "default" : status === "failed" ? "destructive" : "secondary"
      return <Badge variant={variant}>{status}</Badge>
    }
  },
  {
    accessorKey: "id",
    header: "Run ID",
  },
]

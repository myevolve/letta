"use client"

import { useQuery } from "@tanstack/react-query"
import { columns } from "./columns"
import { DataTable } from "@/app/(app)/admin/users/data-table" // Reusing the data-table component
import { lettaClient } from "@/lib/letta-client"

export default function ResponsesPage() {
  const { data: runs, isLoading, error } = useQuery({
    queryKey: ["runs"],
    queryFn: () => lettaClient.runs.list(),
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Responses</h1>
        <p className="text-muted-foreground">
          A detailed log of all agent interactions (runs).
        </p>
      </div>
      {isLoading && <p>Loading runs...</p>}
      {error && <p className="text-red-500">Error fetching runs: {error.message}</p>}
      {runs && <DataTable columns={columns} data={runs} />}
    </div>
  )
}

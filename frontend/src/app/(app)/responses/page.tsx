import { mockLogs } from "./mock-log-data"
import { columns } from "./columns"
import { DataTable } from "@/app/(app)/admin/users/data-table" // Reusing the data-table component

export default function ResponsesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Responses</h1>
        <p className="text-muted-foreground">
          A detailed log of all agent interactions.
        </p>
      </div>
      <DataTable columns={columns} data={mockLogs} />
    </div>
  )
}

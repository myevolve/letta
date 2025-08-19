"use client"

import { useQuery } from "@tanstack/react-query"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { listUsers } from "@/api/user"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useState } from "react"
import { CreateUserDialog } from "./create-user-dialog"

export default function AdminUsersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: listUsers,
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error fetching users: {error.message}</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            View, create, and manage all users in the system.
          </p>
        </div>
        <Button variant="cta" onClick={() => setIsCreateOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New User
        </Button>
      </div>
      <DataTable columns={columns} data={users || []} />
      <CreateUserDialog isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}

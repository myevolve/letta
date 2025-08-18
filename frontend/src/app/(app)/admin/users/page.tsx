"use client"

import { useQuery } from "@tanstack/react-query"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { listUsers } from "@/api/user"

export default function AdminUsersPage() {
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
        <h1 className="text-3xl font-bold">User Management</h1>
        {/* TODO: Add "+ New User" button here */}
      </div>
      <DataTable columns={columns} data={users || []} />
    </div>
  )
}

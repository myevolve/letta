"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AdminUser, deleteUser, updateUserRole } from "@/api/user"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

// Edit User Dialog Component
function EditUserDialog({ user, onComplete }: { user: AdminUser, onComplete: () => void }) {
  const queryClient = useQueryClient()
  const [role, setRole] = useState<'User' | 'Admin'>(user.role)

  const mutation = useMutation({
    mutationFn: () => updateUserRole(user.id, role),
    onSuccess: () => {
      toast.success("User updated successfully!")
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      onComplete()
    },
    onError: (error) => {
      toast.error("Failed to update user", { description: error.message })
      onComplete()
    }
  })

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit User: {user.name}</DialogTitle>
        <DialogDescription>
          Modify the user's details below.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="role" className="text-right">
            Role
          </Label>
          <Select value={role} onValueChange={(value: 'User' | 'Admin') => setRole(value)}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="User">User</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onComplete}>Cancel</Button>
        <Button onClick={() => mutation.mutate()}>
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}


// Delete User Dialog Component
function DeleteUserDialog({ userId, onComplete }: { userId: string, onComplete: () => void }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteUser(userId),
    onSuccess: () => {
      toast.success("User deleted successfully!")
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      onComplete()
    },
    onError: (error) => {
      toast.error("Failed to delete user", { description: error.message })
      onComplete()
    }
  })

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the user
          account.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={() => mutation.mutate()}>
          {mutation.isPending ? "Deleting..." : "Continue"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  )
}


export const columns: ColumnDef<AdminUser>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "User Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) => {
      return new Date(row.getValue("lastLogin")).toLocaleDateString()
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                Copy user ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500" onSelect={() => setIsDeleteDialogOpen(true)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DeleteUserDialog userId={user.id} onComplete={() => setIsDeleteDialogOpen(false)} />
          </AlertDialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <EditUserDialog user={user} onComplete={() => setIsEditDialogOpen(false)} />
          </Dialog>
        </>
      )
    },
  },
]

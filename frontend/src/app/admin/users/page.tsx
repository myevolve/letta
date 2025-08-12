"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UserForm from "@/components/admin/UserForm";
import { useState } from "react";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    lastLogin: string;
}

const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2023-10-27 10:00 AM",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    status: "Active",
    lastLogin: "2023-10-27 11:00 AM",
  },
];

export default function UserManagementPage() {
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditUserDialogOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ New User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Fill out the form to create a new user.
              </DialogDescription>
            </DialogHeader>
            <UserForm
              user={null}
              onSubmit={() => {
                // Handle form submission
                setIsNewUserDialogOpen(false);
              }}
              onCancel={() => setIsNewUserDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell>
                  <Button variant="ghost" onClick={() => handleEditClick(user)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the user&apos;s information.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={selectedUser}
            onSubmit={() => {
              // Handle form submission
              setIsEditUserDialogOpen(false);
            }}
            onCancel={() => setIsEditUserDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

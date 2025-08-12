"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
}

export default function UserForm({ user, onSubmit, onCancel }: { user?: User | null; onSubmit: (e: React.FormEvent) => void; onCancel: () => void; }) {
  // This form will be used for both creating and editing users.
  // The 'user' prop will be null for new users.
  // The 'onSubmit' and 'onCancel' props will be functions to handle form submission and cancellation.

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Full Name
          </Label>
          <Input id="name" defaultValue={user?.name} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            Email
          </Label>
          <Input id="email" type="email" defaultValue={user?.email} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="role" className="text-right">
            Role
          </Label>
          <Select defaultValue={user?.role || "User"}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="User">User</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="status" className="text-right">
            Status
          </Label>
          <Switch id="status" defaultChecked={user?.status === "Active"} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}

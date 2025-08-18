"use client"

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b dark:border-white/10 bg-black/10 backdrop-blur-lg shrink-0">
      <div className="flex items-center gap-4">
        <Link href="/support" className="text-sm text-muted-foreground hover:text-foreground">
          Support
        </Link>
        <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground">
          Docs
        </Link>
        <Link href="/api-reference" className="text-sm text-muted-foreground hover:text-foreground">
          API reference
        </Link>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/01.png" alt={user?.name} />
              <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Usage</DropdownMenuItem>
          <DropdownMenuItem>Upgrade to Pro</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Account</DropdownMenuItem>
          <DropdownMenuItem>API keys</DropdownMenuItem>
          <DropdownMenuItem>Invite teammates</DropdownMenuItem>
          <DropdownMenuItem>Switch organizations</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

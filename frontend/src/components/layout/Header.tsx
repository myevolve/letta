"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuthStore from "@/lib/stores/useAuthStore";
import { Button } from "../ui/button";

export const Header = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    // In a real app, you'd probably want to use Next.js's router to push
    // the user to the login page.
    window.location.href = "/login";
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  return (
    <header className="flex items-center justify-end h-16 px-8 bg-black/10 backdrop-blur-lg border-b border-white/20">
      <nav className="flex items-center gap-6 text-sm">
        <Link href="#" className="text-gray-300 hover:text-white transition-colors">
          Support
        </Link>
        <Link href="#" className="text-gray-300 hover:text-white transition-colors">
          Docs
        </Link>
        <Link href="#" className="text-gray-300 hover:text-white transition-colors">
          API reference
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarImage src={user?.id ? `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user.id}` : ''} />
              <AvatarFallback>
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}&apos;s organization
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem>
                    Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                    API keys
                </DropdownMenuItem>
                <DropdownMenuItem>
                    Invite teammates
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">Usage</p>
                    {/* Placeholder for usage meters */}
                    <div className="h-2 w-full bg-gray-700 rounded-full mt-2">
                        <div className="h-2 bg-blue-500 rounded-full" style={{width: "40%"}}></div>
                    </div>
                </div>
                <DropdownMenuItem>
                    <Button variant="destructive" className="w-full h-8 mt-2 bg-orange-500 hover:bg-orange-600">Upgrade to Pro</Button>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>Switch organizations</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        {/* Placeholder for orgs */}
                        <DropdownMenuItem>Org 1</DropdownMenuItem>
                        <DropdownMenuItem>Org 2</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  );
};

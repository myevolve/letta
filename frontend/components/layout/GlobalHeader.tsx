'use client';

import React from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import useAuth from '@/hooks/useAuth';

const GlobalHeader = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="h-16 flex-shrink-0 bg-black/10 border-b border-white/10 backdrop-blur-lg">
      <div className="container mx-auto h-full flex items-center justify-end px-4">
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/support" className="text-gray-300 hover:text-white transition-colors">
            Support
          </Link>
          <Link href="https://docs.letta.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
            Docs
          </Link>
          <Link href="/api-reference" className="text-gray-300 hover:text-white transition-colors">
            API reference
          </Link>
        </nav>

        <div className="ml-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 mr-4 bg-gray-800/80 border-gray-700 text-white backdrop-blur-lg" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email}</p>
                  <p className="text-xs leading-none text-gray-400">Default Organization</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <div className="p-2">
                <p className="text-xs text-gray-400 mb-1">Usage</p>
                {/* Placeholder for usage meters */}
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-8 text-sm">Upgrade to Pro</Button>
              </div>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-gray-700">
                <Link href="/account">Account</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-gray-700">
                <Link href="/api-keys">API keys</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer focus:bg-gray-700">Invite teammates</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer focus:bg-gray-700">Switch organizations</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer focus:bg-red-500/50">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;

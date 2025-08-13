'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Home, Database, Cpu, KeyRound, HardDrive, Shield, User, CreditCard, Settings } from 'lucide-react';
import useAuth from '@/hooks/useAuth';

const GlobalSidebar = () => {
    const pathname = usePathname();
    const { user } = useAuth();

    const mainLinks = [
        { href: '/projects', label: 'Projects', icon: Home },
        { href: '/data-sources', label: 'Data sources', icon: Database },
        { href: '/models', label: 'Models', icon: Cpu },
        { href: '/api-keys', label: 'API keys', icon: KeyRound },
        { href: '/self-hosted', label: 'Self-hosted', icon: HardDrive },
    ];

    const bottomLinks = [
        { href: '/profile', label: 'Profile', icon: User },
        { href: '/billing', label: 'Billing and usage', icon: CreditCard },
        { href: '/settings', label: 'Settings', icon: Settings },
    ];

    const isActive = (href: string) => pathname.startsWith(href);

    const renderLink = (link: { href: string; label: string; icon: React.ElementType }) => (
        <Tooltip key={link.href}>
            <TooltipTrigger asChild>
                <Link
                    href={link.href}
                    className={`flex justify-center items-center w-12 h-12 rounded-lg transition-colors ${
                        isActive(link.href)
                            ? 'bg-white/20 text-white'
                            : 'text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                >
                    <link.icon className="w-6 h-6" />
                </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
                <p>{link.label}</p>
            </TooltipContent>
        </Tooltip>
    );

    return (
        <TooltipProvider delayDuration={0}>
            <aside className="h-screen w-20 flex flex-col items-center py-4 bg-black/20 border-r border-white/10 backdrop-blur-lg">
                <div className="mb-6">
                     <svg width="40" height="40" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="text-white">
                        <path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Zm-8-80a16 16 0 1 1 16-16a16 16 0 0 1-16 16Zm-32 48a16 16 0 1 1 16-16a16 16 0 0 1-16 16Zm80-48a16 16 0 1 1 16-16a16 16 0 0 1-16 16Z"/>
                    </svg>
                </div>

                <nav className="flex flex-col items-center gap-2">
                    {mainLinks.map(renderLink)}
                </nav>

                <hr className="w-1/2 border-white/20 my-4" />

                {user?.role === 'Admin' && (
                     <nav className="flex flex-col items-center gap-2">
                        {renderLink({ href: '/admin', label: 'Admin', icon: Shield })}
                    </nav>
                )}

                <hr className="w-1/2 border-white/20 my-4" />

                <div className="mt-auto flex flex-col items-center gap-2">
                     {bottomLinks.map(renderLink)}
                </div>
            </aside>
        </TooltipProvider>
    );
};

export default GlobalSidebar;

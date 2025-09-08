

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BotMessageSquare, HeartPulse, Library, LogOut, Menu, Smile, User, Users } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { BottomNavBar } from '@/components/layout/bottom-nav';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import React from 'react';


function Logo() {
  return (
    <div className="flex items-center gap-2">
      <HeartPulse className="h-6 w-6 text-primary" />
      <span className="font-bold text-lg">MindfulYouth</span>
    </div>
  );
}

const navItems = [
    { href: '/chat', label: 'Support Chat', icon: BotMessageSquare },
    { href: '/mood-tracker', label: 'Mood Tracker', icon: Smile },
    { href: '/forum', label: 'Peer Forum', icon: Users },
    { href: '/knowledge-base', label: 'Knowledge Base', icon: Library },
    { href: '/resources', label: 'Resources', icon: HeartPulse },
];

function UserNav() {
    const { user, signOut } = useUser();
  
    if (!user) {
      return null;
    }
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
              <AvatarFallback>
                  {(user.displayName?.[0] || user.email?.[0] || '').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName || 'My Account'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/account">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();

  const isPublicRoute = ['/', '/login', '/signup'].includes(pathname) || pathname.startsWith('/seed') || pathname.startsWith('/setup');
  const showNav = user && !isPublicRoute;

  return (
    <div className="flex flex-col h-full">
        {showNav && (
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
                <div className="w-8" />
                <div className="px-4">
                    <Logo />
                </div>
                <UserNav />
            </header>
        )}
        <main className={`flex-1 overflow-y-auto ${showNav ? 'p-4 sm:p-6 pb-20' : ''}`}>{children}</main>
        {showNav && <BottomNavBar />}
    </div>
  );
}

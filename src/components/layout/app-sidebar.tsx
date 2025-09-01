'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BotMessageSquare, HeartPulse, Library, LogOut, Smile, User, Users } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <HeartPulse className="h-6 w-6 text-primary" />
      <span className="font-bold text-lg">MindfulYouth</span>
    </div>
  );
}

const navItems = [
  { href: '/', label: 'Support Chat', icon: BotMessageSquare },
  { href: '/mood-tracker', label: 'Mood Tracker', icon: Smile },
  { href: '/forum', label: 'Peer Forum', icon: Users },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: Library },
  { href: '/resources', label: 'Resources', icon: HeartPulse },
];

function UserNav() {
    const { user, signOut } = useUser();
  
    if (!user) {
      return (
        <Link href="/login">
          <Button variant="outline">Sign In</Button>
        </Link>
      );
    }
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">My Account</p>
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
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} className="w-full">
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {/* Footer content if any, e.g. user profile */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 md:justify-end">
          <SidebarTrigger className="md:hidden" />
          <UserNav />
        </header>
        <main className="min-h-[calc(100vh-3.5rem-4rem)] p-4 sm:p-6 pb-24 md:pb-6">{children}</main>
        <footer className="border-t bg-background p-4 hidden md:block">
            <div className="container mx-auto">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="text-xs text-muted-foreground">
                    Funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible for them.
                    </div>
                    <div className="flex justify-center md:justify-end">
                        <Image 
                            src="https://dare4.masterpeace.org/wp-content/uploads/sites/19/2024/03/EN-Co-Funded-by-the-EU_PANTONE-1536x322.png" 
                            alt="Co-Funded by the European Union"
                            width={300}
                            height={63}
                            data-ai-hint="logo european union"
                        />
                    </div>
                </div>
            </div>
        </footer>
        {isMobile && <BottomNavBar />}
      </SidebarInset>
    </SidebarProvider>
  );
}
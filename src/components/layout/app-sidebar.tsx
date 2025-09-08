

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BotMessageSquare, HeartPulse, Library, LogOut, Menu, Smile, User, Users, PanelLeft, MessageSquarePlus, Trash2, History, Edit } from 'lucide-react';
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
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useChat } from '@/hooks/use-chat';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';


function Logo() {
  return (
    <div className="flex items-center gap-2">
      <HeartPulse className="h-6 w-6 text-primary" />
      <span className="font-bold text-lg">MindfulYouth</span>
    </div>
  );
}

function RenameChatDialog({ chatId, currentName, onRename, children }: { chatId: string, currentName: string, onRename: (newName: string) => void, children: React.ReactNode }) {
    const [newName, setNewName] = useState(currentName);
    const [isOpen, setIsOpen] = useState(false);

    const handleSave = () => {
        if (newName.trim()) {
            onRename(newName.trim());
            setIsOpen(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename Chat</DialogTitle>
                    <DialogDescription>
                        Enter a new name for this chat session.
                    </DialogDescription>
                </DialogHeader>
                <Input 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter chat name..."
                />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ChatHistory({ container, onSelect }: { container: React.RefObject<HTMLDivElement>, onSelect: () => void }) {
    const { chatSessions, activeChatId, getSessionTitle, loadChat, createNewChat, deleteChat, renameChat } = useChat();

    const handleLoadChat = (sessionId: string) => {
        loadChat(sessionId);
        onSelect();
    }

    const handleNewChat = async () => {
        await createNewChat();
        onSelect();
    }

    const handleDeleteChat = async (chatId: string) => {
        await deleteChat(chatId);
        window.location.reload();
    }
    
    return (
        <>
            <SheetHeader className="p-4 border-b">
                <SheetTitle>Chat History</SheetTitle>
            </SheetHeader>
            <div className="p-2">
                <Button onClick={handleNewChat} className="w-full">
                    <MessageSquarePlus className="mr-2 h-4 w-4"/>
                    New Chat
                </Button>
            </div>
            <ScrollArea className="h-[calc(100%-8rem)]">
                <div className="p-2 space-y-1">
                    {chatSessions.map(session => {
                        const sessionTitle = getSessionTitle(session);
                        return (
                        <div key={session.id} className="group flex items-center gap-1">
                                <Button
                                variant={activeChatId === session.id ? 'secondary' : 'ghost'}
                                className="w-full justify-start truncate"
                                onClick={() => handleLoadChat(session.id)}
                            >
                                {sessionTitle}
                                </Button>
                                <RenameChatDialog chatId={session.id} currentName={sessionTitle} onRename={(newName) => renameChat(session.id, newName)}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Edit className="h-4 w-4 text-muted-foreground"/>
                                    </Button>
                                </RenameChatDialog>
                                <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="h-4 w-4 text-red-500/80"/>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this chat session? This action cannot be undone.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteChat(session.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )})}
                </div>
            </ScrollArea>
        </>
    )
}

function UserNav({ container }: { container: React.RefObject<HTMLDivElement> }) {
    const { user, signOut } = useUser();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
  
    if (!user) {
      return null;
    }
  
    return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                 <SheetTrigger asChild>
                    <DropdownMenuItem>
                        <History className="mr-2 h-4 w-4" />
                        <span>Chat History</span>
                    </DropdownMenuItem>
                </SheetTrigger>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <SheetContent container={container.current} side="left" className="p-0 w-[85vw] max-w-sm">
                 <ChatHistory container={container} onSelect={() => setIsSheetOpen(false)} />
            </SheetContent>
        </Sheet>
    );
  }


export function AppSidebar({ children, container }: { children: React.ReactNode, container: React.RefObject<HTMLDivElement> }) {
  const pathname = usePathname();
  const { user } = useUser();

  const isPublicRoute = ['/', '/login', '/signup'].includes(pathname) || pathname.startsWith('/seed') || pathname.startsWith('/setup');
  const showNav = user && !isPublicRoute;

  return (
    <div className="flex flex-col h-full">
        {showNav && (
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
                <div className="w-8">
                    {/* The chat history trigger is now in the UserNav dropdown */}
                </div>
                <div className="px-4">
                    <Logo />
                </div>
                <UserNav container={container} />
            </header>
        )}
        <main className={`flex-1 overflow-y-auto ${showNav ? 'p-4 sm:p-6 pb-20' : ''}`}>{children}</main>
        {showNav && <BottomNavBar />}
    </div>
  );
}

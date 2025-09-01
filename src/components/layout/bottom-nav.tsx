'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BotMessageSquare, HeartPulse, Library, Smile, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Chat', icon: BotMessageSquare },
  { href: '/mood-tracker', label: 'Mood', icon: Smile },
  { href: '/forum', label: 'Forum', icon: Users },
  { href: '/knowledge-base', label: 'Learn', icon: Library },
  { href: '/resources', label: 'Help', icon: HeartPulse },
];

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="flex justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center text-center px-2 flex-1">
              <item.icon className={cn("h-6 w-6 mb-1", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-xs", isActive ? "text-primary font-semibold" : "text-muted-foreground")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
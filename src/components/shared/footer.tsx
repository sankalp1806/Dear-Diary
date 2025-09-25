'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Search,
  LineChart,
  Settings,
  Sparkles,
} from 'lucide-react';

const NavLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string; }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link href={href} className={cn('flex flex-col items-center text-xs gap-1 relative', isActive ? 'text-white' : 'text-white/70')}>
      {isActive && <div className="absolute top-[-4px] h-1 w-6 rounded-full bg-cyan-400"></div>}
      <Icon />
      <span>{label}</span>
    </Link>
  );
};

export default function NavFooter() {
  return (
    <footer className="fixed bottom-4 left-4 right-4 z-50">
      <div className="relative max-w-sm mx-auto">
        <div className="bg-black/70 backdrop-blur-lg rounded-full p-2 flex items-center justify-around text-white">
          <NavLink href="/dashboard" icon={Calendar} label="Home" />
          <NavLink href="/search" icon={Search} label="Search" />
          <div className="w-12 h-12"></div>
          <NavLink href="/insights" icon={LineChart} label="Insights" />
          <NavLink href="/settings" icon={Settings} label="Settings" />
        </div>
        <Link href="/new-entry">
          <div className="absolute top-[-24px] left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center cursor-pointer shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </Link>
      </div>
    </footer>
  );
}

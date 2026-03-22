'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, FolderOpen, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: '홈', icon: null },
  { href: '/chat', label: 'AI 비서', icon: MessageSquare },
  { href: '/projects', label: '프로젝트', icon: FolderOpen },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-purple-600" />
          <span className="font-bold text-lg">해커톤스토어</span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === item.href ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              <span className="flex items-center gap-1.5">
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

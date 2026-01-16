<<<<<<< HEAD
=======
'use client';

>>>>>>> main
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
<<<<<<< HEAD
import { SidebarTrigger } from '@/components/ui/sidebar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

export default function Header() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex w-full items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User avatar" />}
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin</p>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@erp-lite.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
=======
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSettings } from '@/lib/settings-context';

export default function Header() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  const [user, setUser] = useState<any>(null);
  const { settings } = useSettings();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 md:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-white shadow-sm shadow-primary/10 ring-1 ring-border/60">
            <Image
              src="/lirco-logo.jpg"
              alt="Lirco logo"
              width={28}
              height={28}
              priority
            />
          </div>
          <p className="font-headline text-lg font-semibold leading-tight text-foreground">
            {settings?.companyName || 'Lirco Engineering'}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full transition hover:bg-muted"
            >
              <Avatar className="h-10 w-10">
                {user?.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt="User avatar" />
                ) : (
                  userAvatar && (
                    <AvatarImage src={userAvatar.imageUrl} alt="User avatar" />
                  )
                )}
                <AvatarFallback>{user ? `${user.firstName?.[0]}${user.lastName?.[0]}` : 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-44" align="end" forceMount>
>>>>>>> main
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
<<<<<<< HEAD
            <DropdownMenuSeparator />
=======
>>>>>>> main
            <DropdownMenuItem asChild>
              <Link href="/login">Log out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

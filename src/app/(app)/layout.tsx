<<<<<<< HEAD
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarProvider } from '@/components/ui/sidebar';
=======
'use client';

import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { InventoryProvider } from '@/lib/inventory-context';
import { SettingsProvider } from '@/lib/settings-context';
>>>>>>> main

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<<<<<<< HEAD
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
=======
    <SettingsProvider>
      <InventoryProvider>
        <div className="min-h-screen">
          <Header />
          <div className="flex w-full gap-6 pb-12 pt-6">
            <AppSidebar />
            <main className="page-enter min-w-0 flex-1 px-4 md:px-6 lg:px-10">
              {children}
            </main>
          </div>
        </div>
      </InventoryProvider>
    </SettingsProvider>
>>>>>>> main
  );
}

'use client';

import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { InventoryProvider } from '@/lib/inventory-context';
import { SettingsProvider } from '@/lib/settings-context';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}

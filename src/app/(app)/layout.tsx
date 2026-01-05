'use client';

import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarProvider, SidebarInset, useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { InventoryProvider } from '@/lib/inventory-context';
import { SettingsProvider, useSettings } from '@/lib/settings-context';
import { useEffect } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SettingsProvider>
      <LayoutContent>{children}</LayoutContent>
    </SettingsProvider>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();

  return (
    <SidebarProvider>
      <SidebarController settings={settings} />
      <InventoryProvider>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </InventoryProvider>
    </SidebarProvider>
  );
}

function SidebarController({ settings }: { settings: any }) {
  const { setOpen } = useSidebar();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setOpen(false);
      return;
    }
    if (settings) {
      setOpen(!settings.sidebarCollapsed);
    }
  }, [isMobile, settings, setOpen]);

  return null;
}

import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarProvider } from '@/components/ui/sidebar';
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
        <SidebarProvider>
          <div className="min-h-screen flex-1 w-full">
            <Header />
            <div className="flex w-full gap-6 pb-12 pt-6">
              <AppSidebar />
              <main className="app-main page-enter min-w-0 flex-1 px-4 md:px-6 lg:px-10">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </InventoryProvider>
    </SettingsProvider>
  );
}

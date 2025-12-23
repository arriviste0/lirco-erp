'use client';

import {
  Boxes,
  ChevronDown,
  Factory,
  Home,
  Inbox,
  LayoutGrid,
  Library,
  Package,
  Send,
  Truck,
  Users,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { cn } from '@/lib/utils';

export default function AppSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const isMastersActive =
    pathname.startsWith('/masters/items') ||
    pathname.startsWith('/masters/parties') ||
    pathname.startsWith('/masters/boms');

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border"
      variant="sidebar"
    >
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Logo className="size-8 text-primary" />
          <h1 className="font-headline text-lg font-semibold text-primary">
            ERP-Lite
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard')}
              tooltip="Dashboard"
            >
              <Link href="/dashboard">
                <Home />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarSeparator className="my-2" />

          <Collapsible>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                className="w-full justify-between"
                isActive={isMastersActive}
              >
                <div className="flex items-center gap-2">
                  <Library />
                  <span>Masters</span>
                </div>
                <ChevronDown className="size-4 text-sidebar-foreground/50" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenu className="mx-3.5 border-l border-sidebar-border px-2.5 py-0.5">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/masters/items')} size="sm">
                    <Link href="/masters/items">
                      <Boxes className="size-3.5" />
                      <span>Items</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/masters/parties')} size="sm">
                    <Link href="/masters/parties">
                      <Users className="size-3.5" />
                      <span>Parties</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/masters/boms')} size="sm">
                    <Link href="/masters/boms">
                      <LayoutGrid className="size-3.5" />
                      <span>BOMs</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/inventory')}
              tooltip="Inventory"
            >
              <Link href="/inventory">
                <Package />
                <span>Inventory</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/quotations')}
              tooltip="Quotations"
            >
              <Link href="/quotations">
                <Send />
                <span>Quotations</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/production')}
              tooltip="Production"
            >
              <Link href="/production">
                <Factory />
                <span>Production</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarSeparator className="my-2" />

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith('/mail')}
              tooltip="Mail Inbox"
            >
              <Link href="/mail">
                <Inbox />
                <span>Mail Inbox</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

'use client';

import {
  Calculator,
  ChevronDown,
  Factory,
  FileText,
  Home,
  Inbox,
  Library,
  Package,
  Send,
  Truck,
  User,
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
import { useSettings } from '@/lib/settings-context';
import { useSidebar } from '@/components/ui/sidebar';

export default function AppSidebar() {
  const pathname = usePathname();
  const { settings } = useSettings();
  const { open } = useSidebar();
  const collapsedMenuClass =
    "group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!px-2 group-data-[collapsible=icon]:[&>span]:hidden";

  const isActive = (path: string) => {
    return pathname === path;
  };

  const isMastersActive =
    pathname.startsWith('/masters/parties') ||
    pathname.startsWith('/masters/inventory-status');

  const isInquiryActive =
    pathname.startsWith('/inquiry') ||
    pathname.startsWith('/cost-sheet');

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border"
      variant="sidebar"
    >
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className={cn("flex items-center gap-2 px-2 py-1.5", !open && "justify-center")}>
              <Logo className="size-4 text-primary flex-shrink-0" />
              {open && (
                <h1 className="font-headline text-lg font-semibold text-primary truncate">
                  {settings?.companyName || 'Lirco Engg'}
                </h1>
              )}
            </div>
          </SidebarMenuItem>
          <SidebarSeparator className="my-2" />
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/dashboard')}
              tooltip="Dashboard"
              className={cn("pl-2", collapsedMenuClass)}
            >
              <Link href="/dashboard">
                <Home className="size-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarSeparator className="my-2" />

          <Collapsible>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                className={cn(
                  "w-full justify-between pl-2",
                  "group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!px-2 group-data-[collapsible=icon]:[&>span]:hidden"
                )}
                isActive={isMastersActive}
              >
                <div className="flex items-center gap-2">
                  <Library className="size-4" />
                  <span>Masters</span>
                </div>
                <ChevronDown className="size-4 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenu className="mx-3.5 border-l border-sidebar-border px-2.5 py-0.5">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive('/masters/parties')}
                      size="sm"
                      className={cn("pl-2", collapsedMenuClass)}
                    >
                      <Link href="/masters/parties">
                        <Users className="size-3.5" />
                        <span>Parties</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/masters/inventory-status')}
                    size="sm"
                    className={cn("pl-2", collapsedMenuClass)}
                  >
                    <Link href="/masters/inventory-status">
                      <Package className="size-3.5" />
                      <span>Inventory Status</span>
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
              className={cn("pl-2", collapsedMenuClass)}
            >
              <Link href="/inventory">
                <Package className="size-4" />
                <span>Inventory</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/quotations')}
              tooltip="Quotations"
              className={cn("pl-2", collapsedMenuClass)}
            >
              <Link href="/quotations">
                <Send className="size-4" />
                <span>Quotations</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/orders')}
              tooltip="Orders"
              className={cn("pl-2", collapsedMenuClass)}
            >
              <Link href="/orders">
                <Truck className="size-4" />
                <span>Orders</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <Collapsible>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                className={cn(
                  "w-full justify-between pl-2",
                  "group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!px-2 group-data-[collapsible=icon]:[&>span]:hidden"
                )}
                isActive={isInquiryActive}
              >
                <div className="flex items-center gap-2">
                  <FileText className="size-4" />
                  <span>Inquiry</span>
                </div>
                <ChevronDown className="size-4 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenu className="mx-3.5 border-l border-sidebar-border px-2.5 py-0.5">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/inquiry')}
                    size="sm"
                    className={cn("pl-2", collapsedMenuClass)}
                  >
                    <Link href="/inquiry">
                      <FileText className="size-3.5" />
                      <span>Inquiry</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/cost-sheet')}
                    size="sm"
                    className={cn("pl-2", collapsedMenuClass)}
                  >
                    <Link href="/cost-sheet">
                      <Calculator className="size-3.5" />
                      <span>Cost Sheet</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/production')}
              tooltip="Production"
              className={cn("pl-2", collapsedMenuClass)}
            >
              <Link href="/production">
                <Factory className="size-4" />
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
              className={cn("pl-2", collapsedMenuClass)}
            >
              <Link href="/mail">
                <Inbox className="size-4" />
                <span>Mail Inbox</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/profile')}
              tooltip="Profile"
              className={cn("pl-2", collapsedMenuClass)}
            >
              <Link href="/profile">
                <User className="size-4" />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

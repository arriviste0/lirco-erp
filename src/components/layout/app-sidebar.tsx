'use client';

import {
<<<<<<< HEAD
  Boxes,
  ChevronDown,
  Factory,
  Home,
  Inbox,
  LayoutGrid,
=======
  Calculator,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Factory,
  FileText,
  Home,
  Inbox,
>>>>>>> main
  Library,
  Package,
  Send,
  Truck,
<<<<<<< HEAD
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
=======
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  startsWith?: boolean;
};

const primaryItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', Icon: Home },
  { href: '/inventory', label: 'Inventory', Icon: Package },
  { href: '/quotations', label: 'Quotations', Icon: Send },
  { href: '/orders', label: 'Orders', Icon: Truck },
  { href: '/production', label: 'Production', Icon: Factory },
  { href: '/mail', label: 'Mail Inbox', Icon: Inbox, startsWith: true },
];

const mastersItems: NavItem[] = [
  { href: '/masters/parties', label: 'Parties', Icon: Library, startsWith: true },
  {
    href: '/masters/inventory-status',
    label: 'Inventory Status',
    Icon: Package,
    startsWith: true,
  },
];

const inquiryItems: NavItem[] = [
  { href: '/inquiry', label: 'Inquiry', Icon: FileText, startsWith: true },
  { href: '/cost-sheet', label: 'Cost Sheet', Icon: Calculator, startsWith: true },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSection, setOpenSection] = useState<'masters' | 'inquiry' | null>('masters');

  const isActive = (item: NavItem) => {
    if (item.startsWith) {
      return pathname.startsWith(item.href);
    }
    return pathname === item.href;
  };

  const navButtonClass =
    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all hover:translate-x-1';

  const showText = !isCollapsed;

  return (
    <aside
      className={cn(
        "sticky top-24 hidden h-[calc(100vh-7rem)] flex-shrink-0 flex-col rounded-3xl border border-border/60 bg-white/80 p-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] backdrop-blur md:flex",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn("flex items-center justify-between", isCollapsed && "justify-center")}>
        {showText && (
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Navigation
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className={cn(
            "flex items-center gap-1 rounded-full border border-border/60 bg-white px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition hover:bg-muted",
            isCollapsed && "px-2"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          {showText ? (isCollapsed ? "Expand" : "Collapse") : null}
        </button>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-1">
        {primaryItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              navButtonClass,
              isActive(item)
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? item.label : undefined}
          >
            <item.Icon className="size-4" />
            {showText && <span className="whitespace-nowrap">{item.label}</span>}
          </Link>
        ))}

        <button
          type="button"
          onClick={() => setOpenSection((prev) => (prev === "masters" ? null : "masters"))}
          className={cn(
            "mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground",
            openSection === "masters" && "text-foreground",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? "Masters" : undefined}
        >
          <Library className="size-4" />
          {showText && <span className="whitespace-nowrap">Masters</span>}
          {showText && (
            <ChevronDown
              className={cn(
                "ml-auto size-4 transition-transform",
                openSection === "masters" && "rotate-180"
              )}
            />
          )}
        </button>
        {showText && openSection === "masters" && (
          <div className="ml-6 flex flex-col gap-1">
            {mastersItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted",
                  isActive(item) ? "bg-muted text-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpenSection((prev) => (prev === "inquiry" ? null : "inquiry"))}
          className={cn(
            "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground",
            openSection === "inquiry" && "text-foreground",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? "Inquiry" : undefined}
        >
          <FileText className="size-4" />
          {showText && <span className="whitespace-nowrap">Inquiry</span>}
          {showText && (
            <ChevronDown
              className={cn(
                "ml-auto size-4 transition-transform",
                openSection === "inquiry" && "rotate-180"
              )}
            />
          )}
        </button>
        {showText && openSection === "inquiry" && (
          <div className="ml-6 flex flex-col gap-1">
            {inquiryItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted",
                  isActive(item) ? "bg-muted text-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

      </div>
    </aside>
>>>>>>> main
  );
}

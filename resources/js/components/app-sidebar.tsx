import { NavUser } from '@/components/nav-user';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar';
import { Link, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ChevronRight,
    Computer,
    Cpu,
    FolderGit2,
    LayoutGrid,
    Search,
    Settings,
    Settings2,
    Tags,
    User,
    Users,
} from 'lucide-react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { route } from 'ziggy-js';
import AppLogoIcon from './app-logo-icon';

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const { state } = useSidebar();
    const [open, setOpen] = useState(false);
    const can = auth?.can ?? {};

    // Performance: Memoized active check to prevent recalculation on every scroll/hover
    const isRouteActive = useCallback((href: string) => {
        if (!href || href === '#') return false;
        try {
            const currentUrl = new URL(window.location.href);
            const targetUrl = new URL(href, window.location.origin);
            return currentUrl.pathname === targetUrl.pathname;
        } catch {
            return false;
        }
    }, []);

    // 2. Navigation Structure (Updated with your specific routes)
    const navGroups = useMemo(
        () => [
            {
                label: 'Platform',
                items: [
                    {
                        title: 'Dashboard',
                        href: route('dashboard.index'), // Explicit route as requested
                        icon: LayoutGrid,
                    },
                ],
            },
            {
                label: 'Administration',
                // can: 'access-admin-page', // Security layer: only renders if user has permission
                items: [
                    {
                        title: 'Branches',
                        href: route('admin.branches.index'),
                        icon: FolderGit2,
                    },
                    {
                        title: 'Counters',
                        href: route('admin.counters.index'),
                        icon: Computer,
                    },
                    {
                        title: 'Tags',
                        href: route('admin.tags.index'),
                        icon: Tags,
                    },
                    {
                        title: 'Users',
                        href: route('admin.users.index'),
                        icon: User,
                    },
                    {
                        title: 'System Settings',
                        href: route('admin.settings.index'),
                        icon: Settings,
                    },
                ],
            },
        ],
        [auth.can],
    );

    // 3. Command Palette Data (Optimized Filter)
    const searchableItems = useMemo(() => {
        return navGroups
            .flatMap((group) => {
                if (group.can && !can[group.can]) return [];
                return group.items.flatMap((item) => {
                    if (item.items) {
                        return item.items.map((sub) => ({
                            ...sub,
                            icon: item.icon || Search,
                            parent: item.title,
                        }));
                    }
                    return [item];
                });
            })
            .filter((item) => item.href && item.href !== '#');
    }, [navGroups, can]);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((o) => !o);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    return (
        <>
            <Sidebar
                collapsible="icon"
                className="border-r border-sidebar-border/50 bg-sidebar/60 backdrop-blur-xl"
            >
                <SidebarHeader className="h-20 justify-center border-b border-sidebar-border/40 px-4">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                asChild
                                className="hover:bg-transparent"
                            >
                                <Link
                                    href={route('dashboard.index')}
                                    className="flex items-center gap-3"
                                >
                                    <div className="flex aspect-square size-5 items-center justify-center">
                                        <AppLogoIcon className="size-4 bg-primary text-primary-foreground shadow-lg ring-4 shadow-primary/30 ring-primary/10" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden text-left">
                                        <span className="truncate text-sm font-black tracking-tight text-foreground uppercase">
                                            BIU System
                                        </span>
                                        <span className="truncate text-[10px] font-bold tracking-[0.15em] text-primary/70 uppercase">
                                            Faculty of IT
                                        </span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent className="scrollbar-none px-3 py-4">
                    {state === 'expanded' && (
                        <button
                            onClick={() => setOpen(true)}
                            className="group mb-6 flex w-full items-center justify-between rounded-xl border border-sidebar-border/60 bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-background hover:shadow-sm"
                        >
                            <div className="flex items-center gap-2">
                                <Search className="size-4 transition-colors group-hover:text-primary" />
                                <span className="font-medium">
                                    Quick Search...
                                </span>
                            </div>
                            <kbd className="pointer-events-none flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[9px] font-bold uppercase">
                                ctrl k
                            </kbd>
                        </button>
                    )}

                    {navGroups.map((group) => {
                        if (group.can && !can[group.can]) return null;
                        return (
                            <SidebarGroup
                                key={group.label}
                                className="mb-6 p-0"
                            >
                                <SidebarGroupLabel className="mb-2 px-2 text-[10px] font-black tracking-[0.2em] text-muted-foreground/50 uppercase">
                                    {group.label}
                                </SidebarGroupLabel>
                                <SidebarMenu className="gap-1">
                                    {group.items.map((item) => {
                                        const isActive = item.href
                                            ? isRouteActive(item.href)
                                            : false;
                                        const hasActiveChild = item.items?.some(
                                            (sub) => isRouteActive(sub.href),
                                        );

                                        if (item.href && !item.items) {
                                            return (
                                                <SidebarMenuItem
                                                    key={item.title}
                                                >
                                                    <SidebarMenuButton
                                                        asChild
                                                        tooltip={item.title}
                                                        isActive={isActive}
                                                        className={`relative h-10 px-3 transition-all duration-300 ${
                                                            isActive
                                                                ? 'bg-primary/10 font-bold text-primary shadow-[inset_0_0_0_1px_rgba(var(--primary),0.1)]'
                                                                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent'
                                                        }`}
                                                    >
                                                        <Link
                                                            prefetch
                                                            href={item.href}
                                                        >
                                                            <item.icon
                                                                className={`mr-2 size-4 ${isActive ? 'text-primary' : 'opacity-70'}`}
                                                            />
                                                            <span>
                                                                {item.title}
                                                            </span>
                                                            {isActive && (
                                                                <div className="absolute left-0 h-5 w-1 bg-primary" />
                                                            )}
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            );
                                        }

                                        return (
                                            <Collapsible
                                                key={item.title}
                                                asChild
                                                defaultOpen={hasActiveChild}
                                                className="group/collapsible"
                                            >
                                                <SidebarMenuItem>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton
                                                            tooltip={item.title}
                                                            className={`h-10 px-3 transition-colors ${hasActiveChild ? 'bg-primary/5 font-bold text-primary' : 'text-sidebar-foreground/70'}`}
                                                        >
                                                            <item.icon
                                                                className={`mr-2 size-4 ${hasActiveChild ? 'text-primary' : 'opacity-70'}`}
                                                            />
                                                            <span>
                                                                {item.title}
                                                            </span>
                                                            <ChevronRight className="ml-auto size-3.5 opacity-40 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <SidebarMenuSub className="ml-4 border-l border-sidebar-border/80 py-1.5">
                                                            {item.items?.map(
                                                                (subItem) => {
                                                                    const subActive =
                                                                        isRouteActive(
                                                                            subItem.href,
                                                                        );
                                                                    return (
                                                                        <SidebarMenuSubItem
                                                                            key={
                                                                                subItem.title
                                                                            }
                                                                        >
                                                                            <SidebarMenuSubButton
                                                                                asChild
                                                                                isActive={
                                                                                    subActive
                                                                                }
                                                                                className="h-9 px-4"
                                                                            >
                                                                                <Link
                                                                                    prefetch
                                                                                    href={
                                                                                        subItem.href
                                                                                    }
                                                                                    className="flex w-full items-center justify-between"
                                                                                >
                                                                                    <span
                                                                                        className={
                                                                                            subActive
                                                                                                ? 'font-bold text-primary'
                                                                                                : 'text-muted-foreground/80 hover:text-foreground'
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            subItem.title
                                                                                        }
                                                                                    </span>
                                                                                    {subItem.badge && (
                                                                                        <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[8px] font-black text-red-600 uppercase ring-1 ring-red-500/20">
                                                                                            {
                                                                                                subItem.badge
                                                                                            }
                                                                                        </span>
                                                                                    )}
                                                                                </Link>
                                                                            </SidebarMenuSubButton>
                                                                        </SidebarMenuSubItem>
                                                                    );
                                                                },
                                                            )}
                                                        </SidebarMenuSub>
                                                    </CollapsibleContent>
                                                </SidebarMenuItem>
                                            </Collapsible>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroup>
                        );
                    })}
                </SidebarContent>

                <SidebarFooter className="border-t border-sidebar-border/40 bg-muted/20 p-4">
                    <NavUser />
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <CommandInput
                        placeholder="Search system routes..."
                        className="h-12 w-full outline-none"
                    />
                </div>
                <CommandList className="scrollbar-none max-h-[350px]">
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Navigation" className="p-2">
                        {searchableItems.map((item) => (
                            <CommandItem
                                key={item.href}
                                onSelect={() => {
                                    setOpen(false);
                                    router.visit(item.href);
                                }}
                                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 aria-selected:bg-primary/10"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-background shadow-sm">
                                    <item.icon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold">
                                        {item.title}
                                    </span>
                                    {item.parent && (
                                        <span className="text-[10px] font-medium text-muted-foreground uppercase">
                                            {item.parent}
                                        </span>
                                    )}
                                </div>
                                <ChevronRight className="ml-auto size-4 opacity-20" />
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}

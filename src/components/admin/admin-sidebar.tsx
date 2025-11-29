
"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Users,
  GitCommitHorizontal,
  Warehouse,
  Store,
  Check,
  ChevronDown,
  PanelLeft,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  Laptop,
  Briefcase,
  TicketPercent,
  Landmark,
  Home,
  Box,
  ShoppingCart,
  Radio,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import useBrandStore from "@/stores/brand-store";
<<<<<<< HEAD
import usePlatformSettingsStore from "@/stores/platform-settings-store";
import { Button } from "../ui/button";
import { UserNav } from "../user-nav";
import { Separator } from "../ui/separator";
=======
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { Separator } from "@/components/ui/separator";
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
import type { IBrand } from "@/models/brand.model";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
<<<<<<< HEAD
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Logo } from "../logo";
=======
import { ScrollArea } from "../ui/scroll-area";
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25

const mainNavItem = { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" };

const navItems = [
  { href: "/admin/boxes", icon: Box, label: "Boxes & Bags" },
  { href: "/admin/brands", icon: Store, label: "Manage Brands" },
  { href: "/admin/business-dashboard", icon: Briefcase, label: "Business Dashboard" },
  { href: "/admin/inventory", icon: Warehouse, label: "Inventory" },
  { href: "/admin/legals", icon: Landmark, label: "Legal" },
  { href: "/admin/notifications", icon: Radio, label: "Broadcast" },
  { href: "/admin/orders", icon: Package, label: "Orders" },
  { href: "/admin/platform", icon: Home, label: "Platform" },
  { href: "/admin/promotions", icon: TicketPercent, label: "Promotions" },
  { href: "/admin/returns", icon: GitCommitHorizontal, label: "Returns" },
  { href: "/admin/settings", icon: ShoppingCart, label: "Cart Offers" },
  { href: "/admin/users", icon: Users, label: "Users" },
];

const BrandSelector = () => {
    const { selectedBrand, availableBrands, setSelectedBrand, setAvailableBrands } = useBrandStore();
    const [currentBrandDetails, setCurrentBrandDetails] = useState<IBrand | null>(null);

    useEffect(() => {
        async function fetchBrands() {
        try {
            const response = await fetch('/api/brands');
            if (!response.ok) throw new Error("Failed to fetch brands");
            const data = await response.json();
            
            const allBrands: IBrand[] = data.brands;
            const brandNames = allBrands.map((b) => b.permanentName);
            setAvailableBrands(['All Brands', ...brandNames]);

            if (selectedBrand !== 'All Brands') {
                const brandDetails = allBrands.find(b => b.permanentName === selectedBrand);
                setCurrentBrandDetails(brandDetails || null);
            } else {
                setCurrentBrandDetails(null);
            }
        } catch (error) {
            console.error("Failed to fetch brands", error);
        }
        }
        fetchBrands();
    }, [setAvailableBrands, selectedBrand]);

    return (
        <Collapsible>
            <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between h-12">
                    <div className="flex items-center gap-3 overflow-hidden">
                         <Avatar className="h-8 w-8 relative flex-shrink-0">
                            {currentBrandDetails?.logoUrl ? (
                                <Image src={currentBrandDetails.logoUrl} alt={currentBrandDetails.displayName} fill className="object-cover"/>
                            ) : (
                                <AvatarFallback className="text-xs font-bold">{selectedBrand === 'All Brands' ? 'ALL' : selectedBrand.substring(0, 3).toUpperCase()}</AvatarFallback>
                            )}
                        </Avatar>
                        <span className="truncate capitalize font-semibold">{selectedBrand}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50 transition-transform ml-auto flex-shrink-0" />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-1">
                {availableBrands.map((brand) => (
                    <Button key={brand} variant="ghost" className="w-full justify-start gap-2 capitalize" onClick={() => setSelectedBrand(brand)}>
                        <div className="flex items-center justify-center h-5 w-5">
                            {selectedBrand === brand && <Check className="h-4 w-4" />}
                        </div>
                        {brand}
                    </Button>
                ))}
            </CollapsibleContent>
        </Collapsible>
    )
}

const ThemeToggle = () => {
    // A simplified theme toggle. A real app would use a theme provider.
    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
            return;
        }
        root.classList.add(theme);
    };

    return (
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleThemeChange('light')}>
                    <Sun className="mr-2 h-4 w-4" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
                    <Moon className="mr-2 h-4 w-4" /> Dark
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => handleThemeChange('system')}>
                    <Laptop className="mr-2 h-4 w-4" /> System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};


const SidebarContent = ({ className }: { className?: string}) => {
    const pathname = usePathname();
    const { href, icon: Icon, label } = mainNavItem;

    return (
        <div className={cn("flex h-full flex-col", className)}>
        <div className="px-4 py-2 border-b">
            <BrandSelector />
        </div>
         <ScrollArea className="flex-1 overflow-y-auto py-2">
            <nav className="grid items-start gap-1 px-4 text-sm font-medium">
                <Link href={href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary", pathname === href && "bg-muted text-primary")}>
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                </Link>
                <Separator className="my-2" />
                {navItems.sort((a, b) => a.label.localeCompare(b.label)).map(({ href, icon: Icon, label }) => (
                    <Link key={label} href={href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary", pathname.startsWith(href) && "bg-muted text-primary")}>
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                    </Link>
                ))}
            </nav>
        </ScrollArea>
        <div className="mt-auto border-t p-2">
            <div className="flex items-center justify-between">
                <UserNav />
                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <Button variant="ghost" size="icon" className="h-9 w-9"><HelpCircle className="h-4 w-4" /></Button>
                </div>
            </div>
        </div>
      </div>
    )
}

export function MobileAdminHeader() {
    const [open, setOpen] = useState(false);
<<<<<<< HEAD
    const { settings } = usePlatformSettingsStore();

    return (
        <header className="md:hidden flex h-16 items-center justify-between border-b bg-background px-4 shrink-0">
             <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold">
                {settings.platformLogoUrl ? (
                    <Image src={settings.platformLogoUrl} alt="Logo" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
                ) : (
                    <Logo className="h-6 w-6 text-primary" />
                )}
                <span>Admin Panel</span>
            </Link>
=======

    return (
        <header className="flex md:hidden h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0">
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0">
                    <SheetHeader className="p-4 border-b">
                        <SheetTitle>
<<<<<<< HEAD
                            <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold">
                                {settings.platformLogoUrl ? (
                                    <Image src={settings.platformLogoUrl} alt="Logo" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
                                ) : (
                                    <Logo className="h-6 w-6 text-primary" />
                                )}
=======
                             <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-lg">
                                <Store className="h-6 w-6 text-primary" />
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
                                <span>Admin Panel</span>
                            </Link>
                        </SheetTitle>
                    </SheetHeader>
                    <SidebarContent />
                </SheetContent>
            </Sheet>
            <div className="flex-1 text-center font-bold">Admin Panel</div>
            <UserNav />
        </header>
    )
}


export function AdminSidebar() {
<<<<<<< HEAD
    const pathname = usePathname();
    const { settings } = usePlatformSettingsStore();
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            if (window.innerWidth < 768) setIsCollapsed(true);
        };
        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    }
    
    const { href: mainHref, icon: MainIcon, label: mainLabel } = mainNavItem;

    return (
        <aside className={cn(
            "hidden md:flex md:flex-col transition-all duration-300 ease-in-out bg-background border-r h-screen sticky top-0",
            isCollapsed ? "w-16" : "w-64",
        )}>
             <TooltipProvider delayDuration={0}>
                <div className="flex h-full max-h-screen flex-col">
                    <div className={cn("flex items-center h-16 border-b px-4 shrink-0", isCollapsed ? "justify-center" : "justify-between")}>
                        <Link href="/admin/dashboard" className={cn("flex items-center gap-2 font-bold", isCollapsed && "hidden")}>
                             {settings.platformLogoUrl ? (
                                <Image src={settings.platformLogoUrl} alt={`${settings.platformName} Logo`} width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
                            ) : (
                                <Logo className="h-6 w-6 text-primary" />
                            )}
                            <span>Admin Panel</span>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                            <PanelLeft className="h-5 w-5" />
                            <span className="sr-only">Toggle Sidebar</span>
                        </Button>
                    </div>
                    <div className={cn("p-2", isCollapsed && "px-1.5 py-2 flex justify-center")}>
                        <BrandSelector isCollapsed={isCollapsed} />
                    </div>
                    <div className="flex-1 overflow-auto py-2 no-scrollbar">
                        <nav className="flex flex-col gap-1 px-2 text-sm font-medium">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={mainHref}
                                        className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary", pathname.startsWith(mainHref) && "bg-muted text-primary", isCollapsed && "justify-center")}
                                    >
                                        <MainIcon className="h-4 w-4" />
                                        <span className={cn(isCollapsed && "hidden")}>{mainLabel}</span>
                                    </Link>
                                </TooltipTrigger>
                                {isCollapsed && <TooltipContent side="right">{mainLabel}</TooltipContent>}
                            </Tooltip>
                            <Separator className="my-2" />
                            {navItems.sort((a, b) => a.label.localeCompare(b.label)).map(({ href, icon: Icon, label }) => (
                                <Tooltip key={label}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={href}
                                            className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary", pathname.startsWith(href) && "bg-muted text-primary", isCollapsed && "justify-center")}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span className={cn(isCollapsed && "hidden")}>{label}</span>
                                        </Link>
                                    </TooltipTrigger>
                                    {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
                                </Tooltip>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-auto border-t">
                        <div className={cn("p-2", isCollapsed ? "py-2" : "p-2")}>
                                <div className={cn("flex items-center justify-between", isCollapsed && "flex-col gap-2")}>
                                    {!isCollapsed && <span className="text-xs text-muted-foreground">Settings</span>}
                                </div>
                        </div>
                        <Separator className="my-0" />
                        <div className={cn("py-2", isCollapsed && "p-2 flex justify-center")}>
                            <UserNav isCollapsed={isCollapsed} />
                        </div>
                    </div>
                </div>
            </TooltipProvider>
=======
    return (
        <aside className="hidden md:flex h-screen max-h-screen flex-col gap-2 border-r bg-background sticky top-0">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-lg">
                    <Store className="h-6 w-6 text-primary" />
                    <span>Admin Panel</span>
                </Link>
            </div>
            <SidebarContent />
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
        </aside>
    );
}

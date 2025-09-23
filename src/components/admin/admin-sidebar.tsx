
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
  Briefcase,
  TicketPercent,
  Landmark,
  Home,
  Box,
  ShoppingCart,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import useBrandStore from "@/stores/brand-store";
import usePlatformSettingsStore from "@/stores/platform-settings-store";
import { Button } from "../ui/button";
import { UserNav } from "../user-nav";
import { Separator } from "../ui/separator";
import type { IBrand } from "@/models/brand.model";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Logo } from "../logo";

const mainNavItem = { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" };

const navItems = [
  { href: "/admin/boxes", icon: Box, label: "Boxes & Bags" },
  { href: "/admin/brands", icon: Store, label: "Manage Brands" },
  { href: "/admin/business-dashboard", icon: Briefcase, label: "Business Dashboard" },
  { href: "/admin/inventory", icon: Warehouse, label: "Inventory" },
  { href: "/admin/legals", icon: Landmark, label: "Legal" },
  { href: "/admin/orders", icon: Package, label: "Orders" },
  { href: "/admin/platform", icon: Home, label: "Platform" },
  { href: "/admin/promotions", icon: TicketPercent, label: "Promotions" },
  { href: "/admin/returns", icon: GitCommitHorizontal, label: "Returns" },
  { href: "/admin/settings", icon: ShoppingCart, label: "Cart Offers" },
  { href: "/admin/users", icon: Users, label: "Users" },
];

const BrandSelector = ({ isCollapsed }: { isCollapsed: boolean }) => {
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

    if (isCollapsed) {
        return (
            <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-8 w-8">
                                    {currentBrandDetails?.logoUrl ? (
                                        <Image src={currentBrandDetails.logoUrl} alt={currentBrandDetails.displayName} fill className="object-cover"/>
                                    ) : (
                                        <AvatarFallback>{selectedBrand === 'All Brands' ? 'All' : selectedBrand.charAt(0).toUpperCase()}</AvatarFallback>
                                    )}
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="right">Switch Brand</TooltipContent>
                </Tooltip>
                <DropdownMenuContent className="w-56" align="start">
                    {availableBrands.map(brand => (
                        <DropdownMenuItem key={brand} onClick={() => setSelectedBrand(brand)}>
                             <Check className={cn("mr-2 h-4 w-4", selectedBrand === brand ? "opacity-100" : "opacity-0")} />
                            <span className="capitalize">{brand}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <Collapsible>
            <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-12">
                    <div className="flex items-center gap-3">
                         <Avatar className="h-8 w-8">
                            {currentBrandDetails?.logoUrl ? (
                                <Image src={currentBrandDetails.logoUrl} alt={currentBrandDetails.displayName} fill className="object-cover"/>
                            ) : (
                                <AvatarFallback className="text-xs font-bold">{selectedBrand === 'All Brands' ? 'ALL' : selectedBrand.substring(0, 3).toUpperCase()}</AvatarFallback>
                            )}
                        </Avatar>
                        <span className="truncate capitalize font-semibold">{selectedBrand}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50 transition-transform ml-auto" />
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

const SidebarContent = () => {
    const pathname = usePathname();
    const { href, icon: Icon, label } = mainNavItem;

    return (
        <>
        {/* Main Content */}
        <div className="flex-1 overflow-auto py-2 no-scrollbar">
            <div className="p-2">
                <BrandSelector isCollapsed={false} />
            </div>
             <nav className="flex flex-col gap-1 px-2 text-sm font-medium">
                <Link href={href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary", pathname.startsWith(href) && "bg-muted text-primary")}>
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
        </div>
        {/* Sidebar Footer */}
        <div className="mt-auto border-t">
            <div className="p-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Help &amp; Settings</span>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Sun className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><HelpCircle className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>
            <Separator className="my-0" />
            <div className="p-2">
                <UserNav />
            </div>
        </div>
      </>
    )
}

export function MobileAdminHeader() {
    const [open, setOpen] = useState(false);
    const { settings } = usePlatformSettingsStore();

    return (
        <header className="md:hidden flex h-16 items-center justify-between border-b bg-background px-4 shrink-0">
             <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold">
                {settings.platformLogoUrl ? (
                    <Image src={settings.platformLogoUrl} alt="Logo" width={28} height={28} className="h-7 w-7" />
                ) : (
                    <Logo className="h-6 w-6 text-primary" />
                )}
                <span>{settings.platformName || 'Admin Panel'}</span>
            </Link>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 flex flex-col p-0">
                    <SheetHeader className="p-4 border-b">
                        <SheetTitle>
                            <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold">
                                {settings.platformLogoUrl ? (
                                    <Image src={settings.platformLogoUrl} alt="Logo" width={28} height={28} className="h-7 w-7" />
                                ) : (
                                    <Logo className="h-6 w-6 text-primary" />
                                )}
                                <span>{settings.platformName || 'Admin Panel'}</span>
                            </Link>
                        </SheetTitle>
                    </SheetHeader>
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </header>
    )
}


export function AdminSidebar() {
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
                                <Image src={settings.platformLogoUrl} alt="Logo" width={28} height={28} className="h-7 w-7" />
                            ) : (
                                <Logo className="h-6 w-6 text-primary" />
                            )}
                            <span>{settings.platformName || 'Admin Panel'}</span>
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
        </aside>
    );
}


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
import { Button } from "../ui/button";
import { UserNav } from "../user-nav";
import { Separator } from "../ui/separator";
import type { IBrand } from "@/models/brand.model";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

const navItems = [
  { href: "/admin/boxes", icon: Box, label: "Boxes & Bags" },
  { href: "/admin/business-dashboard", icon: Briefcase, label: "Business Dashboard" },
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/inventory", icon: Warehouse, label: "Inventory" },
  { href: "/admin/legals", icon: Landmark, label: "Legal" },
  { href: "/admin/brands", icon: Store, label: "Manage Brands" },
  { href: "/admin/orders", icon: Package, label: "Orders" },
  { href: "/admin/platform", icon: Home, label: "Platform" },
  { href: "/admin/promotions", icon: TicketPercent, label: "Promotions" },
  { href: "/admin/returns", icon: GitCommitHorizontal, label: "Returns" },
  { href: "/admin/users", icon: Users, label: "Users" },
];

const SidebarContent = () => {
    const pathname = usePathname();
    const { selectedBrand, availableBrands, setSelectedBrand, setAvailableBrands } = useBrandStore();
    const [isBrandSelectorOpen, setIsBrandSelectorOpen] = useState(false);
    const [currentBrand, setCurrentBrand] = useState<IBrand | null>(null);

     useEffect(() => {
        async function fetchBrands() {
        try {
            const response = await fetch('/api/brands');
            const data = await response.json();
            
            const allBrands: IBrand[] = data.brands;
            const brandNames = allBrands.map((b) => b.permanentName);
            setAvailableBrands(['All Brands', ...brandNames]);

            if (selectedBrand !== 'All Brands') {
                const brandDetails = allBrands.find(b => b.permanentName === selectedBrand);
                setCurrentBrand(brandDetails || null);
            } else {
                setCurrentBrand(null);
            }

        } catch (error) {
            console.error("Failed to fetch brands", error);
        }
        }
        fetchBrands();
    }, [setAvailableBrands, selectedBrand]);

    const handleBrandSelect = (brand: string) => {
        setSelectedBrand(brand);
        setIsBrandSelectorOpen(false);
    }

    return (
        <>
        {/* Main Content */}
        <div className="flex-1 overflow-auto py-2">
            <div className="p-2">
                <Collapsible open={isBrandSelectorOpen} onOpenChange={setIsBrandSelectorOpen}>
                    <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center h-6 w-6 rounded-md bg-muted text-xs font-bold shrink-0 capitalize">
                                    {selectedBrand === 'All Brands' ? 'All' : selectedBrand.substring(0, 3)}
                                </div>
                                <span className="truncate capitalize">{selectedBrand}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 opacity-50 transition-transform ml-auto" />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-1">
                        {availableBrands.map((brand) => (
                            <Button key={brand} variant="ghost" className="w-full justify-start gap-2 capitalize" onClick={() => handleBrandSelect(brand)}>
                                <div className="flex items-center justify-center h-5 w-5">
                                    {selectedBrand === brand && <Check className="h-4 w-4" />}
                                </div>
                                {brand}
                            </Button>
                        ))}
                    </CollapsibleContent>
                </Collapsible>
            </div>
            <nav className="flex flex-col gap-1 px-2 text-sm font-medium">
                {navItems.map(({ href, icon: Icon, label }) => (
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
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-4 w-4" /></Button>
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
     const { selectedBrand } = useBrandStore();

    return (
        <header className="md:hidden flex h-16 items-center justify-between border-b bg-background px-4 shrink-0">
             <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold">
                <Store className="h-6 w-6 text-primary" />
                <span className="capitalize">{selectedBrand}</span>
            </Link>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 flex flex-col p-0">
                     <div className="flex items-center h-16 border-b px-4 shrink-0">
                        <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold">
                            <Store className="h-6 w-6 text-primary" />
                            <span>Admin Panel</span>
                        </Link>
                    </div>
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </header>
    )
}


export function AdminSidebar() {
    const pathname = usePathname();
    const { selectedBrand } = useBrandStore();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [currentBrand, setCurrentBrand] = useState<IBrand | null>(null);

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

    return (
        <aside className={cn(
            "hidden md:flex md:flex-col transition-all duration-300 ease-in-out bg-background border-r h-screen sticky top-0",
            isCollapsed ? "w-16" : "w-64",
        )}>
            <div className="flex h-full max-h-screen flex-col">
                <div className={cn("flex items-center h-16 border-b px-4 shrink-0", isCollapsed ? "justify-center" : "justify-between")}>
                    <Link href="/admin/dashboard" className={cn("flex items-center gap-2 font-bold", isCollapsed && "hidden")}>
                        <Store className="h-6 w-6 text-primary" />
                        <span>Admin Panel</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle Sidebar</span>
                    </Button>
                </div>
                <TooltipProvider delayDuration={0}>
                    <div className="flex-1 overflow-auto py-2">
                        <div className={cn("p-2", isCollapsed && "px-1")}>
                        </div>
                        <nav className="flex flex-col gap-1 px-2 text-sm font-medium">
                            {navItems.map(({ href, icon: Icon, label }) => (
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
                </TooltipProvider>
                <div className="mt-auto border-t">
                    <div className={cn("p-2", isCollapsed ? "py-2" : "p-2")}>
                         <TooltipProvider delayDuration={0}>
                            <div className={cn("flex items-center justify-between", isCollapsed && "flex-col gap-2")}>
                                {!isCollapsed && <span className="text-xs text-muted-foreground">Settings</span>}
                                <div className={cn("flex items-center gap-1", isCollapsed && "flex-col")}>
                                     <Tooltip>
                                        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-4 w-4" /></Button></TooltipTrigger>
                                        <TooltipContent side={isCollapsed ? "right" : "top"}>Settings</TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        </TooltipProvider>
                    </div>
                    <Separator className="my-0" />
                    <div className={cn("py-2", isCollapsed && "p-2 flex justify-center")}>
                        <UserNav isCollapsed={isCollapsed} />
                    </div>
                </div>
            </div>
        </aside>
    );
}
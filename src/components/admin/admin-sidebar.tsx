
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
  Bell,
  Radio,
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
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { Separator } from "@/components/ui/separator";
import type { IBrand } from "@/models/brand.model";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
                         <Avatar className="h-8 w-8 relative">
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

const SidebarContent = ({ className }: { className?: string}) => {
    const pathname = usePathname();
    const { href, icon: Icon, label } = mainNavItem;

    return (
        <div className={cn("flex h-full flex-col", className)}>
        {/* Main Content */}
        <div className="flex-1 overflow-auto py-2 no-scrollbar">
            <div className="p-2">
                <BrandSelector isCollapsed={false} />
            </div>
             <nav className="grid items-start gap-1 px-2 text-sm font-medium">
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
        <div className="mt-auto border-t p-2">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Help &amp; Settings</span>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Sun className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><HelpCircle className="h-4 w-4" /></Button>
                </div>
            </div>
            <Separator className="my-2" />
            <UserNav />
        </div>
      </div>
    )
}

export function MobileAdminHeader() {
    const [open, setOpen] = useState(false);
     const { selectedBrand } = useBrandStore();

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="sm:hidden">
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs p-0">
                    <SheetHeader className="p-4 border-b">
                        <SheetTitle>
                             <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-lg">
                                <Store className="h-6 w-6 text-primary" />
                                <span>Admin Panel</span>
                            </Link>
                        </SheetTitle>
                    </SheetHeader>
                    <SidebarContent />
                </SheetContent>
            </Sheet>
            <div className="relative ml-auto flex-1 md:grow-0">
                {/* Search can go here */}
            </div>
            <UserNav />
        </header>
    )
}


export function AdminSidebar() {
    const pathname = usePathname();
    const { href: mainHref, icon: MainIcon, label: mainLabel } = mainNavItem;

    return (
        <aside className="hidden border-r bg-background md:flex h-full">
             <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-lg">
                        <Store className="h-6 w-6 text-primary" />
                        <span>Admin Panel</span>
                    </Link>
                </div>
                <SidebarContent className="flex-1"/>
            </div>
        </aside>
    );
}

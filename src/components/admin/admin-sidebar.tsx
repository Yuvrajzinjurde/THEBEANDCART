

"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Users,
  GitCommitHorizontal,
  Warehouse,
  PlusCircle,
  ChevronDown,
  Check,
  Store,
  Sun,
  HelpCircle,
  Settings,
  Menu,
  PanelLeft
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

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
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/inventory", icon: Warehouse, label: "Inventory" },
  { href: "/admin/orders", icon: Package, label: "Orders" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/returns", icon: GitCommitHorizontal, label: "Returns" },
  { href: "/admin/brands", icon: Store, label: "Manage Brands" },
];

interface AdminSidebarProps {
    isCollapsed: boolean;
    onCollapseChange: (isCollapsed: boolean) => void;
}


const SidebarNavContent = ({ isCollapsed, onLinkClick, onCollapseChange }: { isCollapsed?: boolean, onLinkClick?: () => void, onCollapseChange?: (isCollapsed: boolean) => void; }) => {
    const pathname = usePathname();
    const { selectedBrand, availableBrands, setSelectedBrand, setAvailableBrands } = useBrandStore();
    const [isBrandSelectorOpen, setIsBrandSelectorOpen] = useState(false);

    useEffect(() => {
        async function fetchBrands() {
        try {
            const response = await fetch('/api/brands');
            const data = await response.json();
            const brandNames = data.brands.map((b: any) => b.displayName);
            setAvailableBrands(['All Brands', ...brandNames]);
        } catch (error) {
            console.error("Failed to fetch brands", error);
        }
        }
        fetchBrands();
    }, [setAvailableBrands]);

    const handleBrandSelect = (brand: string) => {
        setSelectedBrand(brand);
        setIsBrandSelectorOpen(false);
        onLinkClick?.();
    }

    return (
         <div className="flex flex-col h-full">
            <div className={cn("flex h-16 items-center border-b px-4", isCollapsed && "px-2 justify-center")}>
                 <Button variant="ghost" onClick={() => onCollapseChange?.(!isCollapsed)} className="w-full justify-start gap-2 px-2">
                    <Store className="h-6 w-6" />
                    {!isCollapsed && <span className="font-semibold">Admin Panel</span>}
                     {isCollapsed && onCollapseChange && (
                        <PanelLeft className="h-5 w-5 absolute right-2 top-1/2 -translate-y-1/2" />
                    )}
                </Button>
            </div>
            <div className={cn("p-4", isCollapsed && "p-2")}>
                <Collapsible open={isBrandSelectorOpen} onOpenChange={setIsBrandSelectorOpen}>
                    <CollapsibleTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-between", isCollapsed && "w-auto justify-center p-2")}>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs font-bold shrink-0">
                                    {selectedBrand === 'All Brands' ? 'All' : selectedBrand.substring(0, 2).toUpperCase()}
                                </div>
                                {!isCollapsed && <span className="truncate">{selectedBrand}</span>}
                            </div>
                            {!isCollapsed && <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isBrandSelectorOpen && "rotate-180")} />}
                        </Button>
                    </CollapsibleTrigger>
                    {!isCollapsed && (
                        <CollapsibleContent className="mt-2 space-y-1">
                            <ScrollArea className="h-auto max-h-40">
                                {availableBrands.map((brand) => (
                                    <Button
                                        key={brand}
                                        variant="ghost"
                                        className="w-full justify-start gap-2"
                                        onClick={() => handleBrandSelect(brand)}
                                    >
                                        <div className="flex items-center justify-center h-5 w-5">
                                        {selectedBrand === brand && <Check className="h-4 w-4" />}
                                        </div>
                                        {brand}
                                    </Button>
                                ))}
                            </ScrollArea>
                            <Separator className="my-1" />
                            <Button asChild variant="ghost" className="w-full justify-start gap-2" onClick={onLinkClick}>
                                <Link href="/admin/brands/new">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add New Brand
                                </Link>
                            </Button>
                        </CollapsibleContent>
                    )}
                </Collapsible>
            </div>
    
            <nav className={cn("flex flex-col gap-1 items-start px-4 text-sm font-medium flex-1", isCollapsed && "px-2")}>
            <TooltipProvider delayDuration={0}>
                {navItems.map(({ href, icon: Icon, label }) => (
                    <Tooltip key={label}>
                        <TooltipTrigger asChild>
                            <Link
                                href={href}
                                onClick={onLinkClick}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary w-full",
                                    pathname.startsWith(href) && "bg-muted text-primary",
                                    isCollapsed && "justify-center"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {!isCollapsed && <span>{label}</span>}
                                <span className={cn("sr-only", !isCollapsed && "hidden")}>{label}</span>
                            </Link>
                        </TooltipTrigger>
                        {isCollapsed && (
                            <TooltipContent side="right">{label}</TooltipContent>
                        )}
                    </Tooltip>
                ))}
            </TooltipProvider>
            </nav>
            <div className="mt-auto border-t p-4">
               {onCollapseChange && (
                 <Button size="icon" variant="ghost" onClick={() => onCollapseChange(!isCollapsed)}>
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
               )}
            </div>
        </div>
    )
}

export function AdminSidebar({ isCollapsed, onCollapseChange }: AdminSidebarProps) {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden">
         <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 fixed top-4 left-4 z-50 bg-background">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-60">
                 <SidebarNavContent isCollapsed={false} onLinkClick={() => setIsMobileSheetOpen(false)} />
            </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r bg-background transition-[width] duration-300 md:flex",
          isCollapsed ? "w-14" : "w-60"
        )}
      >
        <SidebarNavContent isCollapsed={isCollapsed} onCollapseChange={onCollapseChange} />
      </aside>
    </>
  );
}

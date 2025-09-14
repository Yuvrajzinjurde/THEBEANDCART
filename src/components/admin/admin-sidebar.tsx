
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
import { Logo } from "@/components/logo";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import useBrandStore from "@/stores/brand-store";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/inventory", icon: Warehouse, label: "Inventory" },
  { href: "/admin/orders", icon: Package, label: "Orders" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/returns", icon: GitCommitHorizontal, label: "Returns" },
  { href: "/admin/brands", icon: Store, label: "Manage Brands" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { selectedBrand, availableBrands, setSelectedBrand, setAvailableBrands } = useBrandStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
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


  const handleLinkClick = () => {
    if (isCollapsed) {
        // Optional: auto-expand on click when collapsed
        // setIsCollapsed(false);
    }
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  }
  
  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setIsBrandSelectorOpen(false);
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden flex-col border-r bg-background transition-[width] duration-300 sm:flex",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
        <div className="flex h-16 items-center border-b px-4 lg:px-6">
             <div className="flex items-center gap-2 font-semibold">
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={toggleCollapse}>
                    <Logo className="h-6 w-6" />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
                {!isCollapsed && (
                    <Link href="/admin/dashboard" className="text-lg font-bold">
                        Admin Panel
                    </Link>
                )}
            </div>
        </div>
      
        <div className="flex flex-1 flex-col gap-4 py-4">
            <div className={cn("px-4", isCollapsed && "px-2")}>
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
                            <div className="mt-1 border-t pt-1">
                                <Button asChild variant="ghost" className="w-full justify-start gap-2">
                                    <Link href="/admin/brands/new">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add New Brand
                                    </Link>
                                </Button>
                            </div>
                        </CollapsibleContent>
                    )}
                </Collapsible>
            </div>
      
            <nav className={cn("grid items-start gap-1 px-4 text-sm font-medium", isCollapsed && "px-2")}>
            <TooltipProvider delayDuration={0}>
                {navItems.map(({ href, icon: Icon, label }) => (
                    <Tooltip key={label}>
                        <TooltipTrigger asChild>
                            <Link
                                href={href}
                                onClick={handleLinkClick}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary",
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
        </div>

         <div className="mt-auto flex h-16 items-center border-t px-4">
             <Button
                onClick={toggleCollapse}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")}><path d="M15 4h-5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/><path d="M10 4v16"/><path d="M4 12h6"/></svg>
                <span className="sr-only">Toggle sidebar</span>
            </Button>
         </div>
    </div>
  );
}

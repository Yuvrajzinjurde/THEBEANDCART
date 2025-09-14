
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
  ChevronDown
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
import { UserNav } from "../user-nav";

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
    }

  return (
    <aside className="hidden border-r bg-background md:flex md:flex-col">
        <div className="flex h-full max-h-screen flex-col gap-2">
             <div className="flex-1 overflow-auto py-2">
                <div className="p-2">
                    <Collapsible open={isBrandSelectorOpen} onOpenChange={setIsBrandSelectorOpen}>
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-muted text-xs font-bold shrink-0">
                                        {selectedBrand === 'All Brands' ? 'All' : selectedBrand.substring(0, 3)}
                                    </div>
                                    <span className="truncate">{selectedBrand}</span>
                                </div>
                                <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isBrandSelectorOpen && "rotate-180")} />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-1">
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
                        </CollapsibleContent>
                    </Collapsible>
                </div>
                <TooltipProvider delayDuration={0}>
                    <nav className="grid items-start px-4 text-sm font-medium">
                    {navItems.map(({ href, icon: Icon, label }) => (
                        <Tooltip key={label}>
                             <TooltipTrigger asChild>
                                 <Link
                                    href={href}
                                    className={cn(
                                        "flex items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary h-10 w-10",
                                        pathname.startsWith(href) && "bg-muted text-primary"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="sr-only">{label}</span>
                                </Link>
                             </TooltipTrigger>
                             <TooltipContent side="right">{label}</TooltipContent>
                        </Tooltip>
                    ))}
                    </nav>
                </TooltipProvider>
             </div>
             <div className="mt-auto p-4">
                <UserNav />
            </div>
        </div>
    </aside>
  );
}

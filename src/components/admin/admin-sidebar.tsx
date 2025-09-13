
"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Users,
  GitCommitHorizontal,
  Warehouse,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Logo } from "@/components/logo";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useBrandStore from "@/stores/brand-store";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/orders", icon: Package, label: "Orders" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/inventory", icon: Warehouse, label: "Inventory" },
  { href: "/admin/returns", icon: GitCommitHorizontal, label: "Returns" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { selectedBrand, availableBrands, setSelectedBrand } = useBrandStore();
  const [isCollapsed, setIsCollapsed] = useState(true);


  const handleLinkClick = () => {
    if (isCollapsed) {
        setIsCollapsed(false);
    }
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-10 hidden flex-col border-r bg-background transition-[width] duration-300 sm:flex",
        isCollapsed ? "w-14" : "w-56"
      )}
    >
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <button
          onClick={toggleCollapse}
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
          <span className="sr-only">Reeva</span>
        </button>
        
        <DropdownMenu>
            <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 focus:outline-none">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-bold">
                    {selectedBrand === 'All Brands' ? 'All' : selectedBrand.substring(0, 2).toUpperCase()}
                </div>
                <span className="sr-only">Select Brand</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
                <DropdownMenuLabel>Select a Brand</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableBrands.map((brand) => (
                     <DropdownMenuItem key={brand} onSelect={() => setSelectedBrand(brand)}>
                        {brand}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
        </nav>
        <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-4 text-sm font-medium">
          <TooltipProvider>
            {navItems.map(({ href, icon: Icon, label }) => (
                <Tooltip key={label}>
                <TooltipTrigger asChild>
                    <Link
                    href={href}
                    onClick={handleLinkClick}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        pathname.startsWith(href) && "text-primary bg-muted"
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
    </div>
  );
}

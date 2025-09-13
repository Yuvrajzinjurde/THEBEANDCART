
"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Users,
  GitCommitHorizontal,
  Warehouse,
  ChevronDown,
} from "lucide-react";
import { usePathname } from "next/navigation";

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

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="#"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
          <span className="sr-only">Reeva</span>
        </Link>
        
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

        <TooltipProvider>
          {navItems.map(({ href, icon: Icon, label }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                    pathname.startsWith(href) && "bg-accent text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
    </aside>
  );
}

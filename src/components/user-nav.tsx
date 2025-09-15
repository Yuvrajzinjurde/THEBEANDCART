
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth, type User } from "@/hooks/use-auth";
import Link from "next/link";
import { CreditCard, LogOut, User as UserIcon, Settings, MoreHorizontal } from "lucide-react";

interface UserNavProps {
    user: User | null;
    loading: boolean;
    brandName: string;
    isCollapsed?: boolean;
}

export function UserNav({ user, loading, brandName, isCollapsed = false }: UserNavProps) {
  const { logout } = useAuth();

  if (loading) {
    return (
        <Avatar className="h-9 w-9">
            <AvatarFallback>...</AvatarFallback>
        </Avatar>
    );
  }

  if (!user) {
    return (
         <Button variant="ghost" size="icon" aria-label="Sign In" asChild>
            <Link href={`/${brandName}/login`}>
                <UserIcon className="h-5 w-5" />
            </Link>
        </Button>
    );
  }

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "U";
  const userBrand = user.brand || 'reeva';

  if (isCollapsed) {
    return (
       <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                {/* Collapsed content is same as expanded, but triggered by avatar */}
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuGroup>
                    {user.roles.includes('admin') ? (
                        <DropdownMenuItem asChild>
                                <Link href="/admin/dashboard">
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    <span>Dashboard</span>
                                </Link>
                            </DropdownMenuItem>
                    ) : (
                            <DropdownMenuItem asChild>
                                <Link href={`/${userBrand}/home`}>
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                        <Link href="#">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="#">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        </Link>
                    </DropdownMenuItem>
                    </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
  }
  
    // Expanded view for regular header
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                         <p className="text-xs leading-none text-muted-foreground">
                            {user.roles.includes('admin') ? 'Admin' : 'Customer'}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                {user.roles.includes('admin') ? (
                    <DropdownMenuItem asChild>
                            <Link href="/admin/dashboard">
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </Link>
                        </DropdownMenuItem>
                ) : (
                        <DropdownMenuItem asChild>
                            <Link href={`/${userBrand}/home`}>
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link href="#">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="#">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                    </Link>
                </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

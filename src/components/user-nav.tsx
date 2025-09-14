
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { CreditCard, LogOut, User as UserIcon, Settings, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserNavProps {
    isCollapsed?: boolean;
}

export function UserNav({ isCollapsed = false }: UserNavProps) {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
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

  return (
     <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9">
                <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                {/* Can add email here if needed */}
            </div>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
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
    </div>
  );
}

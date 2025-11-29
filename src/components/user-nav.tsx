
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
import { useAuth, type User } from "@/hooks/use-auth";
import Link from "next/link";
<<<<<<< HEAD
import { CreditCard, LogOut, User as UserIcon, Settings, Package, LayoutDashboard } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { usePathname } from "next/navigation";
=======
import { LogOut, User as UserIcon, Settings, CreditCard, Package } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25

interface UserNavProps {
    isCollapsed?: boolean;
}

export function UserNav({ isCollapsed = false }: UserNavProps) {
  const { user, loading, logout } = useAuth();
<<<<<<< HEAD
  const pathname = usePathname();
=======
  const router = useRouter();
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25

  if (loading) {
    return <Skeleton className="h-9 w-20" />;
  }

  if (!user) {
    return (
<<<<<<< HEAD
         <Button variant="ghost" asChild>
            <Link href={`/login?callbackUrl=${pathname}`}>
                Login
            </Link>
        </Button>
=======
        <Link href="/login" passHref>
             <Button variant="ghost" asChild>
                <a>Login</a>
            </Button>
        </Link>
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
    );
  }

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "U";
<<<<<<< HEAD
=======

  const userMenuItems = (
    <>
        <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
            </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
            <Link href="/dashboard/orders">
                <Package className="mr-2 h-4 w-4" />
                <span>Orders</span>
            </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
            <Link href="/dashboard/billing">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
            </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
            </Link>
        </DropdownMenuItem>
    </>
  );

  const adminMenuItem = (
      <DropdownMenuItem asChild>
          <Link href="/admin/dashboard">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
          </Link>
      </DropdownMenuItem>
  );

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25

  if (isCollapsed) {
    return (
       <DropdownMenu>
            <DropdownMenuTrigger asChild>
<<<<<<< HEAD
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
=======
                <Button variant="ghost" className="relative h-10 w-full justify-start gap-3 px-2">
                    <Avatar className="h-8 w-8">
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
                        {user.profilePicUrl && <AvatarImage src={user.profilePicUrl} alt={user.name} />}
                        <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                     <div className="flex flex-col items-start text-left">
                        <p className="text-xs font-medium leading-none">{user.name}</p>
                    </div>
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
<<<<<<< HEAD
                    {user.roles.includes('admin') && (
                        <DropdownMenuItem asChild>
                            <Link href="/admin/dashboard">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                        <Link href="/profile">
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                        <Link href="/orders">
                            <Package className="mr-2 h-4 w-4" />
                            <span>My Orders</span>
                        </Link>
                    </DropdownMenuItem>
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
=======
                    {user.roles.includes('admin') ? adminMenuItem : userMenuItems}
                </DropdownMenuGroup>
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
  }
  
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                        {user.profilePicUrl && <AvatarImage src={user.profilePicUrl} alt={user.name} />}
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
<<<<<<< HEAD
                    {user.roles.includes('admin') && (
                        <DropdownMenuItem asChild>
                            <Link href="/admin/dashboard">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                        <Link href="/profile">
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/orders">
                            <Package className="mr-2 h-4 w-4" />
                            <span>My Orders</span>
                        </Link>
                    </DropdownMenuItem>
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
=======
                    {user.roles.includes('admin') ? adminMenuItem : userMenuItems}
>>>>>>> 81a0047e5ec12db80da74c44e0a5c54d6cfcaa25
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

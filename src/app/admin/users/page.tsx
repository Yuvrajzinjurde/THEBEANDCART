
"use client";

import { useEffect, useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import { MoreHorizontal, UserX, UserCheck, Eye } from 'lucide-react';
import type { IUser } from '@/models/user.model';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader } from '@/components/ui/loader';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useBrandStore from '@/stores/brand-store';
import { getUsers, updateUserStatus } from './actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const TableSkeleton = () => (
    <div className="text-center">
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        {[...Array(5)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-20" /></TableHead>)}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-32" /></div></TableCell>
                            {[...Array(4)].map((_, j) => (
                                <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        <p className="mt-8 text-lg text-muted-foreground">Just a moment, getting everything ready for you…</p>
    </div>
);


export default function UsersPage() {
  const { selectedBrand } = useBrandStore();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [dialogState, setDialogState] = useState<{ isOpen: boolean; user?: IUser; newStatus?: 'active' | 'blocked' }>({ isOpen: false });


  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedUsers = await getUsers(selectedBrand);
      setUsers(fetchedUsers);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedBrand]);

  const handleStatusUpdate = () => {
    const { user, newStatus } = dialogState;
    if (!user || !newStatus) return;

    startTransition(async () => {
      try {
        const updatedUser = await updateUserStatus(user._id as string, newStatus);
        setUsers(prevUsers => prevUsers.map(u => u._id === updatedUser._id ? updatedUser : u));
        toast.success(`User has been ${newStatus}.`);
      } catch (err: any) {
        toast.error(err.message || `Failed to ${newStatus === 'blocked' ? 'block' : 'unblock'} user.`);
      } finally {
        setDialogState({ isOpen: false });
      }
    });
  };
  
  const openConfirmationDialog = (user: IUser, newStatus: 'active' | 'blocked') => {
    setDialogState({ isOpen: true, user, newStatus });
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Users</CardTitle>
        <CardDescription>View and manage user accounts for <strong>{selectedBrand}</strong>.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="text-center text-destructive">
            <p>{error}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden sm:table-cell">Brand</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id as string}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            {user.profilePicUrl && <AvatarImage src={user.profilePicUrl} alt={user.firstName} />}
                            <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{`${user.firstName} ${user.lastName}`}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary">{user.brand}</Badge>
                  </TableCell>
                  <TableCell>
                     <Badge 
                        variant={user.status === 'active' ? 'default' : 'destructive'} 
                        className={cn(user.status === 'active' && 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300')}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                             <DropdownMenuItem asChild>
                                <Link href={`/admin/users/${user._id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>View Details</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                             {user.status === 'active' ? (
                                <DropdownMenuItem onClick={() => openConfirmationDialog(user, 'blocked')}>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Block User
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => openConfirmationDialog(user, 'active')}>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Unblock User
                                </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
         {users.length === 0 && !loading && (
          <div className="text-center text-muted-foreground py-16">
            <p>No users found for this brand.</p>
          </div>
        )}
      </CardContent>
       <AlertDialog open={dialogState.isOpen} onOpenChange={(isOpen) => setDialogState(prev => ({ ...prev, isOpen }))}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will {dialogState.newStatus === 'blocked' ? 'block' : 'unblock'} the user{" "}
                  <strong>{dialogState.user?.firstName} {dialogState.user?.lastName}</strong>.
                  {dialogState.newStatus === 'blocked' && ' They will no longer be able to log in.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleStatusUpdate} disabled={isPending}>
                  {isPending && <Loader className="mr-2" />}
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </Card>
  );
}

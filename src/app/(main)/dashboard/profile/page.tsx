

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { UploadCloud, X, Save, Edit } from "lucide-react";
import { toast } from "react-toastify";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader } from "@/components/ui/loader";


export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  
  // Mocking form dirty state
  const [isDirty, setIsDirty] = useState(false);

  const profilePicUrl = (user as any)?.profilePicUrl || 'https://picsum.photos/seed/gene-rodriguez/200/200';
  const email = (user as any)?.email || 'gene.rodrig@gmail.com';
  const nameParts = user?.name.split(' ') || ['Gene', 'Rodriguez'];
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');
  
  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    toast.info("Saving changes...");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    setIsSubmitting(false);
    setIsEditing(false);
    setIsDirty(false); // Reset dirty state
    toast.success("Profile updated successfully!");
  };

  const handleCancel = () => {
    if (isDirty) {
      setIsCancelAlertOpen(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleDiscard = () => {
    // Here you would reset your form state
    setIsDirty(false);
    setIsEditing(false);
    setIsCancelAlertOpen(false);
    toast.warn("Changes discarded.");
  };

  return (
    <div className="space-y-6">
        <Card className="shadow-md">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>View and manage your personal information.</CardDescription>
                </div>
                 <div className="flex items-center gap-2">
                    {isEditing && (
                        <>
                        <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>Cancel</Button>
                        <Button onClick={handleSaveChanges} disabled={isSubmitting || !isDirty}>
                            {isSubmitting ? <Loader className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                        </>
                    )}
                    {!isEditing && (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Button>
                    )}
                 </div>
            </CardHeader>
            <CardContent>
                <fieldset disabled={!isEditing} className="group">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="group-disabled:bg-muted/30">
                                <CardHeader>
                                    <CardTitle>Account Management</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="relative mx-auto w-40 h-40">
                                        <Image 
                                            src={profilePicUrl}
                                            alt="User profile picture" 
                                            width={160} 
                                            height={160} 
                                            className="rounded-lg object-cover" 
                                            data-ai-hint="man wearing beanie"
                                        />
                                        {isEditing && (
                                            <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <Button variant="outline" className="w-full" disabled={!isEditing}>
                                        <UploadCloud className="mr-2 h-4 w-4" />
                                        Upload Photo
                                    </Button>
                                    <Separator />
                                    <div>
                                        <Label htmlFor="old-password">Old Password</Label>
                                        <Input id="old-password" type="password" defaultValue="••••••••" disabled={!isEditing} onChange={() => setIsDirty(true)}/>
                                    </div>
                                    <div>
                                        <Label htmlFor="new-password">New Password</Label>
                                        <Input id="new-password" type="password" disabled={!isEditing} onChange={() => setIsDirty(true)}/>
                                    </div>
                                    <Button className="w-full" disabled={!isEditing}>Change Password</Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-2 space-y-6">
                             <Card className="group-disabled:bg-muted/30">
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="username">Username</Label>
                                            <Input id="username" defaultValue="gene.rodrig" disabled />
                                        </div>
                                        <div>
                                            <Label htmlFor="first-name">First Name</Label>
                                            <Input id="first-name" defaultValue={firstName} disabled={!isEditing} onChange={() => setIsDirty(true)}/>
                                        </div>
                                        <div>
                                            <Label htmlFor="nickname">Nickname</Label>
                                            <Input id="nickname" defaultValue="Gene.r" disabled={!isEditing} onChange={() => setIsDirty(true)}/>
                                        </div>
                                        <div>
                                            <Label htmlFor="last-name">Last Name</Label>
                                            <Input id="last-name" defaultValue={lastName} disabled={!isEditing} onChange={() => setIsDirty(true)}/>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="display-name">Display Name Publicly as</Label>
                                            <Input id="display-name" defaultValue={firstName} disabled={!isEditing} onChange={() => setIsDirty(true)}/>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                             <Card className="group-disabled:bg-muted/30">
                                <CardHeader>
                                    <CardTitle>Contact Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="email">Email (required)</Label>
                                            <Input id="email" type="email" defaultValue={email} disabled />
                                        </div>
                                        <div>
                                            <Label htmlFor="whatsapp">WhatsApp</Label>
                                            <Input id="whatsapp" defaultValue="@gene-rod" disabled={!isEditing} onChange={() => setIsDirty(true)}/>
                                        </div>
                                        <div>
                                            <Label htmlFor="website">Website</Label>
                                            <Input id="website" defaultValue="gene-roding.webflow.io" disabled={!isEditing} onChange={() => setIsDirty(true)}/>
                                        </div>
                                        <div>
                                            <Label htmlFor="telegram">Telegram</Label>
                                            <Input id="telegram" defaultValue="@gene-rod" disabled={!isEditing} onChange={() => setIsDirty(true)}/>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="group-disabled:bg-muted/30">
                                <CardHeader>
                                    <CardTitle>About the User</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Label htmlFor="bio">Biographical Info</Label>
                                    <Textarea id="bio" className="mt-2 min-h-[120px]" defaultValue="Albert Einstein was a German mathematician and physicist who developed the special and general theories of relativity. In 1921, he won the Nobel Prize for physics for his explanation of the photoelectric effect. In the following decade." disabled={!isEditing} onChange={() => setIsDirty(true)}/>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </fieldset>
            </CardContent>
        </Card>
        <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You have unsaved changes. Are you sure you want to discard them?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>No, Keep Editing</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDiscard}>Yes, Discard</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

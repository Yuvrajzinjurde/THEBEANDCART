
"use client";

import { AdminSidebar, MobileAdminHeader } from "./admin-sidebar";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  useEffect(() => {
    // Directly apply a specific theme for the admin panel by setting CSS variables on the root element.
    const adminTheme = {
        '--background': '224 71% 4%',
        '--foreground': '210 40% 98%',
        '--card': '224 71% 4%',
        '--card-foreground': '210 40% 98%',
        '--popover': '224 71% 4%',
        '--popover-foreground': '210 40% 98%',
        '--primary': '217.2 91.2% 59.8%',
        '--primary-foreground': '210 40% 98%',
        '--secondary': '217.2 32.6% 17.5%',
        '--secondary-foreground': '210 40% 98%',
        '--muted': '217.2 32.6% 17.5%',
        '--muted-foreground': '215 20.2% 65.1%',
        '--accent': '217.2 32.6% 17.5%',
        '--accent-foreground': '210 40% 98%',
        '--destructive': '0 62.8% 30.6%',
        '--destructive-foreground': '210 40% 98%',
        '--border': '217.2 32.6% 17.5%',
        '--input': '217.2 32.6% 17.5%',
        '--ring': '217.2 91.2% 59.8%',
    };

    const root = document.documentElement;
    root.classList.add('dark');
    const originalStyles: { [key: string]: string } = {};

    // Save original styles and apply admin theme
    for (const [key, value] of Object.entries(adminTheme)) {
        originalStyles[key] = root.style.getPropertyValue(key);
        root.style.setProperty(key, value);
    }

    // Cleanup function to restore original styles
    return () => {
        root.classList.remove('dark');
        for (const key in adminTheme) {
            const originalValue = originalStyles[key];
            if (originalValue) {
                root.style.setProperty(key, originalValue);
            } else {
                root.style.removeProperty(key);
            }
        }
    };
  }, []);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
      <AdminSidebar />
      <div className="flex flex-col">
        <MobileAdminHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            {children}
        </main>
      </div>
    </div>
  );
}

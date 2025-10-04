
"use client";

import { AdminSidebar, MobileAdminHeader } from "./admin-sidebar";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  useEffect(() => {
    // Directly apply a specific theme for the admin panel by setting CSS variables on the root element.
    const adminTheme = {
        '--background': '0 0% 100%',
        '--foreground': '222.2 84% 4.9%',
        '--card': '0 0% 100%',
        '--card-foreground': '222.2 84% 4.9%',
        '--popover': '0 0% 100%',
        '--popover-foreground': '222.2 84% 4.9%',
        '--primary': '217.2 91.2% 59.8%',
        '--primary-foreground': '210 40% 98%',
        '--secondary': '210 40% 96.1%',
        '--secondary-foreground': '222.2 47.4% 11.2%',
        '--muted': '224 71% 95%',
        '--muted-foreground': '215.4 16.3% 46.9%',
        '--accent': '210 40% 96.1%',
        '--accent-foreground': '222.2 47.4% 11.2%',
        '--destructive': '0 84.2% 60.2%',
        '--destructive-foreground': '210 40% 98%',
        '--border': '214.3 31.8% 91.4%',
        '--input': '214.3 31.8% 91.4%',
        '--ring': '222.2 84% 4.9%',
    };

    const root = document.documentElement;
    const originalStyles: { [key: string]: string } = {};

    // Save original styles and apply admin theme
    for (const [key, value] of Object.entries(adminTheme)) {
        originalStyles[key] = root.style.getPropertyValue(key);
        root.style.setProperty(key, value);
    }

    // Cleanup function to restore original styles
    return () => {
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
    <div className="flex w-full bg-muted/40 min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <MobileAdminHeader />
        <main className="flex-1 p-4 sm:p-6">
            {children}
        </main>
      </div>
    </div>
  );
}

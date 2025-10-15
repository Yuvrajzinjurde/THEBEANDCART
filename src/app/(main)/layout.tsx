
"use client";

import { useEffect } from "react";
import usePlatformSettingsStore from "@/stores/platform-settings-store";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import { GlobalFooter } from "@/components/global-footer";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            <div className="flex-1 w-full flex flex-col">
                {children}
            </div>
            <GlobalFooter />
        </>
    );
}

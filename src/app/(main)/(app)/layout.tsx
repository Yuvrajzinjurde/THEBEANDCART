
"use client";

import { useEffect } from "react";
import usePlatformSettingsStore from "@/stores/platform-settings-store";
import { useAuth } from "@/hooks/use-auth";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { fetchSettings } = usePlatformSettingsStore();
    const { checkUser } = useAuth();

    useEffect(() => {
        // Fetch critical global data once when the app layout mounts.
        fetchSettings();
        checkUser();
    }, [fetchSettings, checkUser]);

    return <>{children}</>;
}

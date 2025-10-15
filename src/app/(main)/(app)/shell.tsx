
"use client";

import Header from "@/components/header";
import { GlobalFooter } from "@/components/global-footer";

export default function AppShell({
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

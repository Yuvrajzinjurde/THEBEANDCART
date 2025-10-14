

'use client';

import AppShell from "../(app)/shell";

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}


'use client';

// This layout is now redundant and can be removed, but for safety, we'll just have it pass children through.
// The root layout at src/app/layout.tsx now handles the header and footer logic.
export default function GlobalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

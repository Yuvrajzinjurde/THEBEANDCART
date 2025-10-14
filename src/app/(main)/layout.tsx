
"use client";

// This layout is a pass-through for the (main) group.
// Specific layouts within sub-groups like (app) or (auth) will define the UI.
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <>
        {children}
    </>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { IBrand } from '@/models/brand.model';

// The BrandFooter component is no longer needed here as the GlobalFooter in the root layout handles this.

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const params = useParams();
    const brandName = params.brand as string;
    const [brand, setBrand] = useState<IBrand | null>(null);

    // This data fetching is still useful if other parts of the layout need brand info in the future.
    useEffect(() => {
        async function fetchBrandData() {
            if (!brandName) return;
            try {
                const brandRes = await fetch(`/api/brands/${brandName}`);
                if (brandRes.ok) {
                    const { brand: brandData } = await brandRes.json();
                    setBrand(brandData);
                }
            } catch (error) {
                console.error("Failed to fetch brand data for layout", error);
            }
        }
        fetchBrandData();
    }, [brandName]);


  return (
    <>
      {children}
      {/* The BrandFooter component has been removed from here to avoid duplication. */}
    </>
  );
}

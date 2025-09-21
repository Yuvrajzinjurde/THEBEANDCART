

"use client";

import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { IProduct } from "@/models/product.model";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import type { ActiveFilters } from "@/app/[brand]/products/page";
import { useParams } from "next/navigation";
import { Button } from "./ui/button";


type FilterSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count: number;
};

const FilterSection = ({ title, children, defaultOpen = false, count }: FilterSectionProps) => {
    if (count === 0) {
        return null;
    }
    return (
        <Collapsible defaultOpen={defaultOpen}>
            <CollapsibleTrigger className="w-full">
            <div className="flex w-full items-center justify-between border-b py-3 pl-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider">{title}</h3>
                <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
            </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                 <div className="py-4 pl-8 space-y-3 pr-4">{children}</div>
            </CollapsibleContent>
        </Collapsible>
    )
};

interface ProductFiltersProps {
  activeFilters: ActiveFilters;
  onFilterChange: (filterType: keyof ActiveFilters, value: string, isChecked: boolean) => void;
  onClearAll: () => void;
}

export function ProductFilters({ activeFilters, onFilterChange, onClearAll }: ProductFiltersProps) {
  const params = useParams();
  const brandName = params.brand as string;
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    async function fetchFilterData() {
        // If there's a brandName, fetch for that brand. Otherwise, fetch all products.
        const url = brandName 
            ? `/api/products?storefront=${brandName}&limit=1000`
            : `/api/products?limit=2000`; // Fetch more for global view

        try {
            const productsRes = await fetch(url);
            if (productsRes.ok) {
                const { products } = await productsRes.json();
                setAllProducts(products);
            }
        } catch (error) {
            console.error('Failed to fetch data for filters', error);
        }
    }
    fetchFilterData();
  }, [brandName]);


  const { uniqueBrands, uniqueColors, allCategories } = useMemo(() => {
    const brands = new Set<string>();
    const colors = new Set<string>();
    const categories = new Set<string>();

    allProducts.forEach(product => {
      if (product.brand) brands.add(product.brand);
      if (product.color) colors.add(product.color);
      if (product.category && typeof product.category === 'string') {
        categories.add(product.category);
      }
    });

    return {
      uniqueBrands: Array.from(brands).sort(),
      uniqueColors: Array.from(colors).sort(),
      allCategories: Array.from(categories).sort()
    };
  }, [allProducts]);

  return (
    <aside className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Button variant="link" className="p-0 h-auto text-primary" onClick={onClearAll}>CLEAR ALL</Button>
        </div>
        <ScrollArea className="flex-grow">
            <div className="pb-4">
              <FilterSection title="Categories" defaultOpen count={allCategories.length}>
                  {allCategories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                          <Checkbox 
                              id={`cat-${category}`} 
                              checked={activeFilters.categories.includes(category)}
                              onCheckedChange={(checked) => onFilterChange('categories', category, !!checked)}
                          />
                          <Label htmlFor={`cat-${category}`} className="font-normal capitalize">{category}</Label>
                      </div>
                  ))}
              </FilterSection>

              <FilterSection title="Brand" defaultOpen count={uniqueBrands.length}>
                  {uniqueBrands.map(brand => (
                      <div key={brand} className="flex items-center space-x-2">
                          <Checkbox 
                              id={`brand-${brand}`} 
                              checked={activeFilters.brands.includes(brand)}
                              onCheckedChange={(checked) => onFilterChange('brands', brand, !!checked)}
                          />
                          <Label htmlFor={`brand-${brand}`} className="font-normal">{brand}</Label>
                      </div>
                  ))}
              </FilterSection>

              <FilterSection title="Color" defaultOpen count={uniqueColors.length}>
                    {uniqueColors.map(color => (
                        <div key={color} className="flex items-center space-x-2">
                            <Checkbox 
                                id={color} 
                                checked={activeFilters.colors.includes(color)}
                                onCheckedChange={(checked) => onFilterChange('colors', color, !!checked)}
                            />
                            <Label htmlFor={color} className="font-normal">{color}</Label>
                        </div>
                    ))}
              </FilterSection>
            </div>
             <ScrollBar className="hidden" />
        </ScrollArea>
    </aside>
  );
}

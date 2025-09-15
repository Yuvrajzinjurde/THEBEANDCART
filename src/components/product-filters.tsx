
"use client";

import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { IProduct } from "@/models/product.model";
import { ScrollArea } from "./ui/scroll-area";
import type { ActiveFilters } from "@/app/[brand]/products/page";

type FilterSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

const FilterSection = ({ title, children, defaultOpen = true }: FilterSectionProps) => (
  <Collapsible defaultOpen={defaultOpen}>
    <CollapsibleTrigger className="w-full">
      <div className="flex w-full items-center justify-between border-b py-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider">{title}</h3>
        <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
      </div>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <div className="py-4 space-y-3">{children}</div>
    </CollapsibleContent>
  </Collapsible>
);

interface ProductFiltersProps {
  products: IProduct[];
  activeFilters: ActiveFilters;
  onFilterChange: (filterType: keyof ActiveFilters, value: string, isChecked: boolean) => void;
  onClearAll: () => void;
}

export function ProductFilters({ products, activeFilters, onFilterChange, onClearAll }: ProductFiltersProps) {

  const { uniqueBrands, uniqueCategories, uniqueColors } = useMemo(() => {
    const brands = new Set<string>();
    const categories = new Set<string>();
    const colors = new Set<string>();

    products.forEach(product => {
      if (product.brand) brands.add(product.brand);
      if (product.category) categories.add(product.category);
      if (product.color) colors.add(product.color);
    });

    // Manually add some colors if not present in data
    ["Black", "White", "Blue", "Red", "Green"].forEach(c => colors.add(c));

    return {
      uniqueBrands: Array.from(brands).sort(),
      uniqueCategories: Array.from(categories).sort(),
      uniqueColors: Array.from(colors).sort(),
    };
  }, [products]);

  return (
    <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
      <div className="sticky top-20">
         <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-lg font-bold">Filters</h2>
          <Button variant="link" className="p-0 h-auto text-primary" onClick={onClearAll}>CLEAR ALL</Button>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)] mt-4">
            <div className="pr-4">
                {uniqueCategories.length > 0 && (
                    <FilterSection title="Categories">
                        {uniqueCategories.map(category => (
                            <div key={category} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={`cat-${category}`} 
                                    checked={activeFilters.categories.includes(category)}
                                    onCheckedChange={(checked) => onFilterChange('categories', category, !!checked)}
                                />
                                <Label htmlFor={`cat-${category}`} className="font-normal capitalize">{category.toLowerCase()}</Label>
                            </div>
                        ))}
                    </FilterSection>
                )}

                {uniqueBrands.length > 0 && (
                    <FilterSection title="Brand">
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
                )}
                
                <FilterSection title="Gender">
                    {["Men", "Women", "Unisex"].map(gender => (
                        <div key={gender} className="flex items-center space-x-2">
                           <Checkbox 
                                id={`gender-${gender}`} 
                                checked={activeFilters.genders.includes(gender)}
                                onCheckedChange={(checked) => onFilterChange('genders', gender, !!checked)}
                            />
                            <Label htmlFor={`gender-${gender}`} className="font-normal">{gender}</Label>
                        </div>
                    ))}
                </FilterSection>

                <FilterSection title="Color">
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
        </ScrollArea>
      </div>
    </aside>
  );
}

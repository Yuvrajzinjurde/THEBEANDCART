
"use client";

import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  count: number;
};

const FilterSection = ({ title, children, defaultOpen = false, count }: FilterSectionProps) => {
    if (count === 0) {
        return null;
    }
    return (
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
    )
};

interface ProductFiltersProps {
  productsForCategories: IProduct[];
  productsForOthers: IProduct[];
  activeFilters: ActiveFilters;
  onFilterChange: (filterType: keyof ActiveFilters, value: string, isChecked: boolean) => void;
}

export function ProductFilters({ productsForCategories, productsForOthers, activeFilters, onFilterChange }: ProductFiltersProps) {

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    productsForCategories.forEach(product => {
      if (product.category) categories.add(product.category);
    });
    return Array.from(categories).sort();
  }, [productsForCategories]);

  const { uniqueBrands, uniqueColors } = useMemo(() => {
    const brands = new Set<string>();
    const colors = new Set<string>();

    productsForOthers.forEach(product => {
      if (product.brand) brands.add(product.brand);
      if (product.color) colors.add(product.color);
    });
    return {
      uniqueBrands: Array.from(brands).sort(),
      uniqueColors: Array.from(colors).sort(),
    };
  }, [productsForOthers]);
  
  const genders = useMemo(() => {
    const genderSet = new Set<string>();
    // Since gender is not in the product model, we can't dynamically generate this.
    // If it were, the logic would be:
    // productsForOthers.forEach(p => p.gender && genderSet.add(p.gender));
    return ["Men", "Women", "Unisex"]; // Static for now
  }, []);

  return (
    <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
      <div className="sticky top-20">
         <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-lg font-bold">Filters</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)] mt-4">
            <div className="pr-4">
                <FilterSection title="Categories" defaultOpen count={uniqueCategories.length}>
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

                <FilterSection title="Brand" count={uniqueBrands.length}>
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
                
                <FilterSection title="Gender" count={genders.length}>
                    {genders.map(gender => (
                        <div key={gender} className="flex items-center space-x-2">
                           <Checkbox 
                                id={`gender-${gender}`} 
                                checked={activeFilters.genders.includes(gender)}
                                onCheckedChange={(checked) => onFilterChange('genders', gender, !!checked)}
                                disabled // Disabled until gender data is available in the model
                            />
                            <Label htmlFor={`gender-${gender}`} className="font-normal text-muted-foreground">{gender}</Label>
                        </div>
                    ))}
                </FilterSection>

                <FilterSection title="Color" count={uniqueColors.length}>
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

    
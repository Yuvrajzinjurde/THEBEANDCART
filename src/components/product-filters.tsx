
"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type FilterSectionProps = {
  title: string;
  children: React.ReactNode;
};

const FilterSection = ({ title, children }: FilterSectionProps) => (
  <Collapsible defaultOpen={true}>
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

export function ProductFilters() {
  const [activeFilters, setActiveFilters] = useState(["NIKE", "60% or more", "CAMPUS", "REEBOK"]);
  const [showMore, setShowMore] = useState(false);

  const colors = ["Black", "White", "Pink", "Grey", "Beige", "Dark Blue"];

  return (
    <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0">
      <div className="sticky top-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Filters</h2>
          <Button variant="link" className="p-0 h-auto text-primary">CLEAR ALL</Button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.slice(0, showMore ? activeFilters.length : 4).map(filter => (
            <Button
              key={filter}
              variant="secondary"
              size="sm"
              className="h-auto py-1 pl-2 pr-1 rounded-sm bg-gray-100 hover:bg-gray-200"
            >
              {filter}
              <X className="h-4 w-4 ml-1" />
            </Button>
          ))}
        </div>
        {activeFilters.length > 4 && (
          <Button variant="link" size="sm" className="p-0 h-auto text-primary mb-4" onClick={() => setShowMore(!showMore)}>
            {showMore ? "SHOW LESS" : "SHOW MORE"}
          </Button>
        )}

        <FilterSection title="Categories">
          <div className="space-y-2 text-sm text-muted-foreground">
             <a href="#" className="flex items-center gap-2 hover:text-primary">&lt; Footwear</a>
             <a href="#" className="flex items-center gap-2 hover:text-primary">&lt; Women's Footwear</a>
             <p className="font-semibold text-foreground pl-4">Women's Sports Shoes</p>
          </div>
        </FilterSection>

        <FilterSection title="Brand">
            {["Puma", "Adidas", "Fila", "ASICS", "Sketchers"].map(brand => (
                <div key={brand} className="flex items-center space-x-2">
                    <Checkbox id={`brand-${brand}`} />
                    <Label htmlFor={`brand-${brand}`} className="font-normal">{brand}</Label>
                </div>
            ))}
        </FilterSection>
        
        <FilterSection title="Gender">
            {["Men", "Women", "Unisex"].map(gender => (
                 <div key={gender} className="flex items-center space-x-2">
                    <Checkbox id={`gender-${gender}`} />
                    <Label htmlFor={`gender-${gender}`} className="font-normal">{gender}</Label>
                </div>
            ))}
        </FilterSection>

        <FilterSection title="Color">
           {colors.map(color => (
                <div key={color} className="flex items-center space-x-2">
                    <Checkbox id={color} />
                    <Label htmlFor={color} className="font-normal">{color}</Label>
                </div>
           ))}
           <Button variant="link" className="p-0 h-auto text-primary">12 MORE</Button>
        </FilterSection>
      </div>
    </aside>
  );
}

"use client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterProps {
  search: string;
  onSearchChange: (v: string) => void;
  placeholder?: string;
  filters?: {
    value: string;
    onChange: (v: string) => void;
    options: FilterOption[];
    placeholder?: string;
  }[];
}

export function SearchFilter({ search, onSearchChange, placeholder = "Search...", filters }: SearchFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      {filters?.map((filter, i) => (
        <select
          key={i}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          className="h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
        >
          <option value="">{filter.placeholder ?? "All"}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}
    </div>
  );
}

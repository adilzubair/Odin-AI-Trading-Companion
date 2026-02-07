"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface StockSearchProps {
    onSearch: (query: string) => void;
}

export default function StockSearch({ onSearch }: StockSearchProps) {
    const [query, setQuery] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        onSearch(value);
    };

    return (
        <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search stocks..."
                className="w-full rounded-lg border border-white/[0.08] bg-[#121212] pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
            />
        </div>
    );
}

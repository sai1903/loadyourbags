import React from 'react';
import { Category } from '../types';

interface FilterBarProps {
    categories: Category[];
    allColors: string[];
    sortOrder: string;
    setSortOrder: (value: string) => void;
    priceRange: { min: string; max: string };
    setPriceRange: (value: { min: string; max: string }) => void;
    selectedCategories: string[];
    setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
    selectedColors: string[];
    setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
    onClearFilters: () => void;
    isFiltering: boolean;
}

const colorMap: { [key: string]: string } = {
  Black: 'bg-black',
  White: 'bg-white border border-slate-300',
  Blue: 'bg-blue-500',
  Brown: 'bg-yellow-900',
  Oak: 'bg-yellow-700',
  Green: 'bg-green-500',
  Purple: 'bg-purple-500',
  Silver: 'bg-gray-400',
  Gold: 'bg-yellow-400',
  Red: 'bg-red-500',
};

const FilterBar: React.FC<FilterBarProps> = ({
    categories, allColors, sortOrder, setSortOrder,
    priceRange, setPriceRange, selectedCategories, setSelectedCategories,
    selectedColors, setSelectedColors, onClearFilters, isFiltering
}) => {
    
    const handleCategoryToggle = (categoryName: string) => {
        setSelectedCategories(prev => 
            prev.includes(categoryName) 
                ? prev.filter(c => c !== categoryName)
                : [...prev, categoryName]
        );
    };

    const handleColorToggle = (colorName: string) => {
        setSelectedColors(prev => 
            prev.includes(colorName) 
                ? prev.filter(c => c !== colorName)
                : [...prev, colorName]
        );
    };
    
    return (
        <div className="bg-slate-100/50 dark:bg-slate-800/50 p-4 rounded-xl backdrop-blur-sm border border-slate-200 dark:border-slate-700 space-y-6">
            {/* Sort */}
            <div>
                <label htmlFor="sort" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sort by</label>
                <select id="sort" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                    <option value="default">Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                </select>
            </div>
            
            {/* Price Range */}
            <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price Range</label>
                <div className="flex items-center gap-2">
                   <input type="number" value={priceRange.min} onChange={e => setPriceRange({ ...priceRange, min: e.target.value })} placeholder="Min" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                   <span>-</span>
                   <input type="number" value={priceRange.max} onChange={e => setPriceRange({ ...priceRange, max: e.target.value })} placeholder="Max" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                </div>
            </div>
            
            {/* Category Filter */}
            <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Filter by Category</h4>
                <div className="space-y-2">
                    {categories.map(cat => (
                        <div key={cat.name} className="flex items-center">
                            <input
                                id={`cat-${cat.name}`}
                                type="checkbox"
                                checked={selectedCategories.includes(cat.name)}
                                onChange={() => handleCategoryToggle(cat.name)}
                                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-primary-500 dark:focus:ring-offset-slate-800"
                            />
                            <label htmlFor={`cat-${cat.name}`} className="ml-3 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                                {cat.name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

             {/* Color Filter */}
            <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Filter by Color</h4>
                <div className="flex flex-wrap gap-2">
                    {allColors.map(color => (
                        <button key={color} onClick={() => handleColorToggle(color)} className={`w-7 h-7 rounded-full ${colorMap[color] || 'bg-gray-200'} flex items-center justify-center ring-2 ring-offset-2 dark:ring-offset-slate-800 transition-all ${selectedColors.includes(color) ? 'ring-primary-500' : 'ring-transparent'}`} aria-label={`Filter by ${color}`}>
                            {color === 'White' && <div className="w-3 h-3 rounded-full bg-slate-300"></div>}
                        </button>
                    ))}
                </div>
            </div>
             {isFiltering && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={onClearFilters} className="text-sm font-semibold text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 transition-colors">Clear All Filters</button>
                </div>
            )}
        </div>
    );
};

export default FilterBar;
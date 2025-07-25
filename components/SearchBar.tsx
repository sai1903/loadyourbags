import React from 'react';
import { SearchIcon } from './Icons';

interface SearchBarProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    onSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm, onSearch }) => {
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch();
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-grow w-full">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for products, categories, or colors..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-900 border-2 border-transparent focus:border-primary-500 rounded-lg shadow-inner focus:outline-none focus:ring-0 transition-colors"
                        aria-label="Search for products"
                    />
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                </div>
                <button 
                    type="submit"
                    className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white font-bold rounded-lg shadow-md hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800"
                >
                    Search
                </button>
            </form>
        </div>
    );
};

export default SearchBar;

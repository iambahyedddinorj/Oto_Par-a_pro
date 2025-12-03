
import React from 'react';

interface FilterBarProps {
  resultCount: number;
  activeFilter: string;
  activeSort: string;
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ 
  resultCount, activeFilter, activeSort, onFilterChange, onSortChange 
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto mb-6 bg-slate-800/80 backdrop-blur-md border border-slate-700 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fadeIn">
      <div className="flex items-center gap-2">
        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">{resultCount}</span>
        <span className="text-slate-300 text-sm font-medium">Sonuç Bulundu</span>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto">
        {/* Filter Group */}
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700/50">
          {['Tümü', 'Orijinal (OEM)', 'Kaliteli Muadil', 'Fiyat/Performans'].map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                activeFilter === filter 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Sort Group */}
        <select
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5"
        >
          <option value="recommended">Önerilen Sıralama</option>
          <option value="priceAsc">Fiyat (Artan)</option>
          <option value="priceDesc">Fiyat (Azalan)</option>
        </select>
      </div>
    </div>
  );
};

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  filters: {
    label: string;
    key: string;
    options: FilterOption[];
    multiSelect?: boolean;
  }[];
  onFilterChange: (filters: Record<string, string | string[]>) => void;
  onClear?: () => void;
  className?: string;
}

export default function FilterBar({ filters, onFilterChange, onClear, className = "" }: FilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[]>>({});
  const [showPanel, setShowPanel] = useState(false);

  const handleSelect = (filterKey: string, value: string, multiSelect: boolean) => {
    setActiveFilters(prev => {
      const current = prev[filterKey];
      let newValue: string | string[];

      if (multiSelect) {
        const arr = Array.isArray(current) ? current : current ? [current] : [];
        newValue = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
        if (newValue.length === 0) {
          const { [filterKey]: _, ...rest } = { ...prev, [filterKey]: [] };
          onFilterChange({ ...prev, [filterKey]: [] });
          return { ...prev, [filterKey]: [] };
        }
      } else {
        newValue = current === value ? "" : value;
      }

      const updated = { ...prev, [filterKey]: newValue };
      onFilterChange(updated);
      return updated;
    });
  };

  const clearAll = () => {
    setActiveFilters({});
    onFilterChange({});
    onClear?.();
  };

  const activeCount = Object.values(activeFilters).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).length;

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            showPanel || activeCount > 0
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "bg-white text-slate-600 border border-slate-100 hover:border-primary/20"
          }`}
          aria-expanded={showPanel}
          aria-label="फिल्टरहरू"
        >
          <SlidersHorizontal size={16} />
          फिल्टर
          {activeCount > 0 && (
            <span className="bg-white/20 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-black">
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <X size={12} />
            सबै मेटाउनुहोस्
          </button>
        )}
      </div>

      {showPanel && (
        <div className="absolute top-full left-0 z-50 mt-3 bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 min-w-[280px] max-w-sm">
          <div className="flex flex-col gap-6">
            {filters.map(filter => (
              <div key={filter.key} className="flex flex-col gap-3">
                <span className="text-xxs font-black text-slate-400 uppercase tracking-widest">
                  {filter.label}
                </span>
                <div className="flex flex-wrap gap-2">
                  {filter.options.map(option => {
                    const isActive = filter.multiSelect
                      ? Array.isArray(activeFilters[filter.key]) && (activeFilters[filter.key] as string[]).includes(option.value)
                      : activeFilters[filter.key] === option.value;

                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSelect(filter.key, option.value, !!filter.multiSelect)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isActive
                            ? "bg-primary text-white shadow-sm"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  autoFocus?: boolean;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "खोज्नुहोस्...",
  debounceMs = 300,
  autoFocus = false,
  className = ""
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  const debouncedOnChange = useCallback(
    (val: string) => {
      const timer = setTimeout(() => {
        onChange(val);
      }, debounceMs);
      return () => clearTimeout(timer);
    },
    [onChange, debounceMs]
  );

  useEffect(() => {
    if (localValue !== value) {
      debouncedOnChange(localValue);
    }
  }, [localValue, debouncedOnChange, value]);

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className={`relative ${className}`}>
      <Search
        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
          isFocused ? "text-primary" : "text-slate-400"
        }`}
        size={18}
      />
      <input
        type="search"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-10 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/20 outline-none transition-all shadow-sm"
        aria-label="खोज्नुहोस्"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-slate-500 transition-colors"
          aria-label="खोजी मेटाउनुहोस्"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

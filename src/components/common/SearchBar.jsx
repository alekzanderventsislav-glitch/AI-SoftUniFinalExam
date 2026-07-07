import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Търсене...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10"
        aria-label={placeholder}
      />
    </div>
  );
}

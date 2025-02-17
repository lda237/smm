import { ChevronDown } from 'lucide-react';
import { usePageSelection } from '../lib/meta-api';

export function PageSelector() {
  const { pages, selectedPage, setSelectedPage, loading } = usePageSelection();

  if (loading) {
    return (
      <div className="h-10 w-48 bg-gray-100 animate-pulse rounded-lg"></div>
    );
  }

  return (
    <div className="relative">
      <select
        className="appearance-none w-full px-4 py-2 bg-white border rounded-lg pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={selectedPage?.id || ''}
        onChange={(e) => {
          const page = pages.find(p => p.id === e.target.value);
          if (page) setSelectedPage(page);
        }}
      >
        {pages.map((page) => (
          <option key={page.id} value={page.id}>
            {page.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  );
}
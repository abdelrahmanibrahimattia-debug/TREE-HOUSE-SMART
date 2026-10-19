import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  searchPlaceholder = 'بحث...',
  searchField = null,
  actions = null,
  pageSize = 10,
  emptyMessage = 'لا توجد بيانات متاحة حالياً.'
}) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(item => {
      if (searchField && item[searchField]) {
        return String(item[searchField]).toLowerCase().includes(q);
      }
      return Object.values(item).some(val =>
        String(val || '').toLowerCase().includes(q)
      );
    });
  }, [data, search, searchField]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Search Bar & Actions Header */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-3 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tree-green focus:border-transparent transition-all"
          />
          <Search size={18} className="absolute right-3 top-2.5 text-slate-400" />
        </div>

        {actions && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {actions}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className={`py-3.5 px-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`py-3 px-4 ${col.className || ''}`}>
                      {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox size={36} className="text-slate-300" />
                    <span>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
          <span>
            عرض {(currentPage - 1) * pageSize + 1} إلى {Math.min(currentPage * pageSize, filteredData.length)} من أصل {filteredData.length} سجل
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <span className="px-2 font-semibold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

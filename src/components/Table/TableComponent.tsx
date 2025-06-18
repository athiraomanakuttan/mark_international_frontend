import React, { JSX, useState } from 'react';
import { Edit, Trash2, Send, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { ActionButtonProps, ReusableTableProps, TableAction, TableColumn } from '@/types/tableTypes';



const ReusableTable = <T extends Record<string, any>>({
  data = [],
  columns = [],
  actions = [],
  showSearch = true,
  showPagination = true,
  itemsPerPage = 10,
  className = "",
  onRowClick = null,
  loading = false,
  emptyMessage = "No data available",
  searchPlaceholder = "Search..."
}: ReusableTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPageState, setItemsPerPageState] = useState<number>(itemsPerPage);

  // Filter data based on search term
  const filteredData: T[] = data.filter((item: T) =>
    columns.some((column: TableColumn<T>) => 
      String(item[column.key] || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination logic
  const totalPages: number = Math.ceil(filteredData.length / itemsPerPageState);
  const startIndex: number = (currentPage - 1) * itemsPerPageState;
  const paginatedData: T[] = filteredData.slice(startIndex, startIndex + itemsPerPageState);

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number): void => {
    setItemsPerPageState(value);
    setCurrentPage(1);
  };

  const ActionButton = <T,>({ action, item, index }: ActionButtonProps<T>): JSX.Element => {
    const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
      edit: Edit,
      delete: Trash2,
      send: Send,
      view: Eye
    };

    const colorMap: Record<string, string> = {
      edit: 'bg-yellow-500 hover:bg-yellow-600',
      delete: 'bg-red-500 hover:bg-red-600',
      send: 'bg-blue-500 hover:bg-blue-600',
      view: 'bg-gray-500 hover:bg-gray-600',
      custom: 'bg-purple-500 hover:bg-purple-600'
    };

    // Check if action should be shown based on condition
    if (action.condition && !action.condition(item)) {
      return <></>;
    }

    const IconComponent = action.icon || iconMap[action.type] || Edit;
    const colorClass = action.className || colorMap[action.type] || 'bg-gray-500 hover:bg-gray-600';

    return (
      <button
        onClick={() => action.onClick(item, index)}
        className={`${colorClass} text-white p-2 rounded text-sm transition-colors duration-200`}
        title={action.label}
        type="button"
      >
        <IconComponent size={16} />
      </button>
    );
  };

  const renderPaginationButtons = (): JSX.Element[] => {
    const buttons: JSX.Element[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded text-sm transition-colors duration-200 ${
            currentPage === i
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          type="button"
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header with Search */}
      {showSearch && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show</span>
                <select
                  value={itemsPerPageState}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                    handleItemsPerPageChange(Number(e.target.value))
                  }
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={searchPlaceholder}
              />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column: TableColumn<T>, index: number) => (
                <th
                  key={`header-${index}`}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)} 
                  className="px-6 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item: T, index: number) => (
                <tr
                  key={`row-${index}`}
                  className={`hover:bg-gray-50 transition-colors duration-150 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick && onRowClick(item, startIndex + index)}
                >
                  {columns.map((column: TableColumn<T>, colIndex: number) => (
                    <td 
                      key={`cell-${index}-${colIndex}`} 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {column.render 
                        ? column.render(item[column.key], item, startIndex + index)
                        : String(item[column.key] || '')
                      }
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {actions.map((action: TableAction<T>, actionIndex: number) => (
                          <ActionButton
                            key={`action-${index}-${actionIndex}`}
                            action={action}
                            item={item}
                            index={startIndex + index}
                          />
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 flex-wrap gap-4">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPageState, filteredData.length)} of {filteredData.length} entries
            {searchTerm && ` (filtered from ${data.length} total entries)`}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-500 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors duration-200"
              type="button"
            >
              <ChevronLeft size={16} />
            </button>
            
            {renderPaginationButtons()}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-500 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors duration-200"
              type="button"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { ReusableTable };
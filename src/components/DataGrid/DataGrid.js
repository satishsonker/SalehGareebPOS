import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiSearch, FiRefreshCw, FiEdit, FiTrash2, FiEye, FiChevronLeft, FiChevronRight, FiMoreVertical, FiLock, FiUnlock } from 'react-icons/fi';
import './DataGrid.css';

/**
 * DataGrid Component - A fully customizable data table with search, pagination, and actions
 * 
 * @param {Array} data - Array of data objects to display
 * @param {Array} columns - Column configuration array
 * @param {Function} onSearch - Callback function for search (optional)
 * @param {Function} onReload - Callback function for reload button (deprecated, use toolbar instead)
 * @param {Function} onAction - Callback function for action buttons (edit, delete, view)
 * @param {Number} pageSize - Number of items per page (default: 10)
 * @param {Boolean} showSearch - Show/hide search input (default: true)
 * @param {Boolean} showReload - Show/hide reload button (default: true, deprecated)
 * @param {Boolean} showPagination - Show/hide pagination (default: true)
 * @param {Boolean} showActions - Show/hide action column (default: true)
 * @param {String} searchPlaceholder - Placeholder text for search input
 * @param {String} emptyMessage - Message to show when no data
 * @param {Object} actionButtons - Configuration for action buttons (view, edit, delete)
 * @param {ReactNode|Array} toolbar - Custom toolbar content or array of toolbar items
 * @param {Boolean} loading - Loading state
 */
function DataGrid({
  data = [],
  columns = [],
  onSearch,
  onReload,
  onAction,
  pageSize = 10,
  showSearch = true,
  showReload = true,
  showPagination = true,
  showActions = true,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data available',
  actionButtons = {
    view: true,
    edit: true,
    delete: true,
  },
  loading = false,
  toolbar = null,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRefs = useRef({});
  const triggerRefs = useRef({});

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((row) => {
      return columns.some((column) => {
        const value = column.accessor ? row[column.accessor] : row[column.key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  // Handle action button click
  const handleAction = (action, row, index) => {
    setOpenMenuId(null); // Close menu after action
    if (onAction) {
      onAction(action, row, index);
    }
  };

  // Handle menu toggle
  const toggleMenu = (rowIndex, event) => {
    event.stopPropagation();
    
    if (openMenuId === rowIndex) {
      setOpenMenuId(null);
      setMenuPosition({ top: 0, left: 0 });
    } else {
      const triggerElement = triggerRefs.current[rowIndex];
      if (triggerElement) {
        const rect = triggerElement.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + 4,
          left: rect.left,
        });
      }
      setOpenMenuId(rowIndex);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId !== null) {
        const menuElement = menuRefs.current[openMenuId];
        const triggerElement = triggerRefs.current[openMenuId];
        
        if (menuElement && !menuElement.contains(event.target) &&
            triggerElement && !triggerElement.contains(event.target)) {
          setOpenMenuId(null);
        }
      }
    };

    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openMenuId]);

  // Format cell value
  const formatCellValue = (value, column) => {
    if (column.format) {
      return column.format(value);
    }
    if (value === null || value === undefined) {
      return '-';
    }
    return value;
  };

  // Render toolbar with search and custom options
  const renderToolbar = () => {
    return (
      <>
        {/* Default search (always shown unless showSearch is false) */}
        {showSearch && (
          <div className="data-grid-search">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => handleSearch('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        )}
        
        {/* Custom toolbar items */}
        {toolbar && (
          <>
            {Array.isArray(toolbar) 
              ? toolbar.map((item, index) => (
                  <React.Fragment key={index}>{item}</React.Fragment>
                ))
              : toolbar
            }
          </>
        )}
        
        {/* Default reload button (only if no custom toolbar and showReload is true) */}
        {!toolbar && showReload && onReload && (
          <button
            className="reload-button"
            onClick={onReload}
            disabled={loading}
            aria-label="Reload data"
          >
            <FiRefreshCw className={loading ? 'spinning' : ''} />
            <span>Reload</span>
          </button>
        )}
      </>
    );
  };

  return (
    <div className="data-grid-container">
      {/* Toolbar */}
      <div className="data-grid-toolbar">
        {renderToolbar()}
      </div>

      {/* Table */}
      <div className="data-grid-table-wrapper">
        <table className="data-grid-table">
          <thead>
            <tr>
              {showActions && (
                <th className="actions-column">Actions</th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key || column.accessor}
                  className={column.sortable !== false ? 'sortable' : ''}
                  onClick={() => column.sortable !== false && handleSort(column.key || column.accessor)}
                  style={{ width: column.width, textAlign: column.align || 'left' }}
                >
                  <div className="th-content">
                    <span>{column.header}</span>
                    {column.sortable !== false && sortConfig.key === (column.key || column.accessor) && (
                      <span className="sort-indicator">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (showActions ? 1 : 0)} className="loading-cell">
                  <div className="loading-spinner">Loading...</div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (showActions ? 1 : 0)} className="empty-cell">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const actualRowIndex = (currentPage - 1) * pageSize + rowIndex;
                const menuId = `menu-${actualRowIndex}`;
                const isMenuOpen = openMenuId === actualRowIndex;
                
                return (
                  <tr key={rowIndex}>
                    {showActions && (
                      <td className="actions-cell">
                        <div className="action-menu-container" ref={el => menuRefs.current[actualRowIndex] = el}>
                          <button
                            ref={el => triggerRefs.current[actualRowIndex] = el}
                            className="action-menu-trigger"
                            onClick={(e) => toggleMenu(actualRowIndex, e)}
                            aria-label="Actions"
                            aria-expanded={isMenuOpen}
                          >
                            <FiMoreVertical />
                          </button>
                          {isMenuOpen && createPortal(
                            <div 
                              className="action-menu"
                              style={{
                                top: `${menuPosition.top}px`,
                                left: `${menuPosition.left}px`,
                              }}
                              ref={el => {
                                if (el) menuRefs.current[actualRowIndex] = el;
                              }}
                            >
                              {actionButtons.view && (
                                <button
                                  className="action-menu-item view-action"
                                  onClick={() => handleAction('view', row, actualRowIndex)}
                                >
                                  <FiEye />
                                  <span>View</span>
                                </button>
                              )}
                              {actionButtons.edit && (
                                <button
                                  className="action-menu-item edit-action"
                                  onClick={() => handleAction('edit', row, actualRowIndex)}
                                >
                                  <FiEdit />
                                  <span>Edit</span>
                                </button>
                              )}
                              {actionButtons.block && !row.isBlocked && (
                                <button
                                  className="action-menu-item block-action"
                                  onClick={() => handleAction('block', row, actualRowIndex)}
                                >
                                  <FiLock />
                                  <span>Block</span>
                                </button>
                              )}
                              {actionButtons.unblock && row.isBlocked && (
                                <button
                                  className="action-menu-item unblock-action"
                                  onClick={() => handleAction('unblock', row, actualRowIndex)}
                                >
                                  <FiUnlock />
                                  <span>Unblock</span>
                                </button>
                              )}
                              {actionButtons.delete && (
                                <button
                                  className="action-menu-item delete-action"
                                  onClick={() => handleAction('delete', row, actualRowIndex)}
                                >
                                  <FiTrash2 />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>,
                            document.body
                          )}
                        </div>
                      </td>
                    )}
                    {columns.map((column) => {
                      const value = column.accessor ? row[column.accessor] : row[column.key];
                      return (
                        <td
                          key={column.key || column.accessor}
                          style={{ textAlign: column.align || 'left' }}
                        >
                          {column.render
                            ? column.render(value, row, actualRowIndex)
                            : formatCellValue(value, column)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="data-grid-pagination">
          <div className="pagination-info">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <FiChevronLeft />
            </button>
            <div className="pagination-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="pagination-ellipsis">...</span>;
                }
                return null;
              })}
            </div>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataGrid;

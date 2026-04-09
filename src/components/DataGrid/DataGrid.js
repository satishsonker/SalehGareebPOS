import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiSearch, FiRefreshCw, FiEdit, FiTrash2, FiEye, FiChevronLeft, FiChevronRight, FiMoreVertical, FiPrinter } from 'react-icons/fi';
import './DataGrid.css';

/**
 * DataGrid Component - A fully customizable data table with search, pagination, and actions
 * 
 * @param {Array} data - Array of data objects to display
 * @param {Array} columns - Column configuration array
 * @param {Function} onSearch - Callback function for search (optional)
 * @param {Function} onReload - Callback function for reload button (deprecated, use toolbar instead)
 * @param {Function} onAction - Callback function for action buttons
 * @param {Number} pageSize - Number of items per page (default: 10)
 * @param {Boolean} showSearch - Show/hide search input (default: true)
 * @param {Boolean} showReload - Show/hide reload button (default: true, deprecated)
 * @param {Boolean} showPagination - Show/hide pagination (default: true)
 * @param {Boolean} showActions - Show/hide action column (default: true)
 * @param {String} searchPlaceholder - Placeholder text for search input
 * @param {String} emptyMessage - Message to show when no data
 * @param {Object} defaultActions - Configuration for default action buttons (view, edit, delete, print) - default: all false
 * @param {Array} actionMenuItems - Custom action menu items configuration
 *   Each item: { id: string, label: string, icon: ReactNode, action: string, visible: boolean|function(row), className?: string }
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
  defaultActions = {
    view: false,
    edit: false,
    delete: false,
    print: false,
  },
  actionMenuItems = [],
  loading = false,
  toolbar = null,
  // Server-side pagination
  serverSide = false,
  totalRecords = 0,
  page = 1,
  onPageChange,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRefs = useRef({});
  const triggerRefs = useRef({});

  // Filter data based on search term (client-side only)
  const filteredData = useMemo(() => {
    if (serverSide || !searchTerm) return data;

    return data.filter((row) => {
      return columns.some((column) => {
        const value = column.accessor ? row[column.accessor] : row[column.key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns, serverSide]);

  // Sort data (client-side only)
  const sortedData = useMemo(() => {
    if (serverSide || !sortConfig.key) return filteredData;

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
  }, [filteredData, sortConfig, serverSide]);

  // Paginate data (client-side only; server-side uses data as-is)
  const paginatedData = useMemo(() => {
    if (serverSide) return data;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, serverSide, data]);

  const effectivePage = serverSide ? page : currentPage;
  const effectiveTotalRecords = serverSide ? totalRecords : sortedData.length;
  const effectiveTotalPages = Math.max(1, Math.ceil(effectiveTotalRecords / pageSize));

  const handlePageChange = (newPage) => {
    if (serverSide) {
      onPageChange && onPageChange(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

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
  const handleAction = (action, row, index, event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setOpenMenuId(null);
    if (onAction) {
      onAction(action, row, index);
    }
  };

  // Get default action menu items
  const getDefaultMenuItems = (row) => {
    const items = [];
    
    if (defaultActions.view) {
      items.push({
        id: 'view',
        label: 'View',
        icon: <FiEye />,
        action: 'view',
        className: 'view-action',
      });
    }
    
    if (defaultActions.edit) {
      items.push({
        id: 'edit',
        label: 'Edit',
        icon: <FiEdit />,
        action: 'edit',
        className: 'edit-action',
      });
    }
    
    if (defaultActions.delete) {
      items.push({
        id: 'delete',
        label: 'Delete',
        icon: <FiTrash2 />,
        action: 'delete',
        className: 'delete-action',
      });
    }
    
    if (defaultActions.print) {
      items.push({
        id: 'print',
        label: 'Print',
        icon: <FiPrinter />,
        action: 'print',
        className: 'print-action',
      });
    }
    
    return items;
  };

  // Get all menu items (default + custom) for a row
  const getMenuItems = (row) => {
    const items = [];
    
    // Add default items
    items.push(...getDefaultMenuItems(row));
    
    // Add custom items
    if (actionMenuItems && Array.isArray(actionMenuItems)) {
      actionMenuItems.forEach((item) => {
        const visible = typeof item.visible === 'function' ? item.visible(row) : (item.visible !== false);
        if (visible) {
          items.push({
            id: item.id,
            label: item.label,
            icon: item.icon,
            action: item.action || item.id,
            className: item.className || '',
          });
        }
      });
    }
    
    return items;
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
        
        // Check if click is on a menu item or inside the menu
        const isMenuItemClick = event.target.closest('.action-menu-item');
        const isInsideMenu = menuElement && menuElement.contains(event.target);
        const isTriggerClick = triggerElement && triggerElement.contains(event.target);
        
        // Only close if click is outside both menu and trigger, and not on a menu item
        if (!isInsideMenu && !isMenuItemClick && !isTriggerClick) {
          setOpenMenuId(null);
        }
      }
    };

    if (openMenuId !== null) {
      // Use click event instead of mousedown to allow menu item clicks to process first
      // Add listener with a small delay to ensure menu is fully rendered
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside, true);
      }, 0);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside, true);
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
                const actualRowIndex = (effectivePage - 1) * pageSize + rowIndex;
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
                              {getMenuItems(row).map((menuItem) => {
                                const handleMenuItemClick = (e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleAction(menuItem.action, row, actualRowIndex, e);
                                };
                                
                                return (
                                  <button
                                    key={menuItem.id}
                                    type="button"
                                    className={`action-menu-item ${menuItem.className}`}
                                    onClick={handleMenuItemClick}
                                    onMouseDown={(e) => {
                                      // Prevent the click-outside handler from firing
                                      e.stopPropagation();
                                    }}
                                  >
                                    {menuItem.icon}
                                    <span>{menuItem.label}</span>
                                  </button>
                                );
                              })}
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
      {showPagination && effectiveTotalPages > 1 && (
        <div className="data-grid-pagination">
          <div className="pagination-info">
            Showing {((effectivePage - 1) * pageSize) + 1} to {Math.min(effectivePage * pageSize, effectiveTotalRecords)} of {effectiveTotalRecords} entries
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(Math.max(1, effectivePage - 1))}
              disabled={effectivePage === 1}
              aria-label="Previous page"
            >
              <FiChevronLeft />
            </button>
            <div className="pagination-pages">
              {Array.from({ length: effectiveTotalPages }, (_, i) => i + 1).map((p) => {
                if (
                  p === 1 ||
                  p === effectiveTotalPages ||
                  (p >= effectivePage - 1 && p <= effectivePage + 1)
                ) {
                  return (
                    <button
                      key={p}
                      className={`pagination-page ${effectivePage === p ? 'active' : ''}`}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  );
                } else if (p === effectivePage - 2 || p === effectivePage + 2) {
                  return <span key={p} className="pagination-ellipsis">...</span>;
                }
                return null;
              })}
            </div>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(Math.min(effectiveTotalPages, effectivePage + 1))}
              disabled={effectivePage === effectiveTotalPages}
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

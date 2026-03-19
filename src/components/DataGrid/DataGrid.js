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
  const handleAction = (action, row, index, event) => {
    console.log('handleAction called:', { action, row, index }); // Debug log
    
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    // Close menu immediately
    setOpenMenuId(null);
    
    // Call the action handler
    if (onAction) {
      console.log('Calling onAction callback'); // Debug log
      onAction(action, row, index);
    } else {
      console.warn('onAction callback is not defined'); // Debug log
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
    
    console.log('Menu items for row:', items); // Debug log
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
                              {getMenuItems(row).map((menuItem) => {
                                const handleMenuItemClick = (e) => {
                                  console.log('Menu item clicked:', menuItem); // Debug log
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

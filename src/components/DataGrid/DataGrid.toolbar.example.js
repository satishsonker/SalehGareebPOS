/**
 * DataGrid Custom Toolbar Examples
 * 
 * This file demonstrates different ways to use custom toolbars
 */

import React from 'react';
import { FiRefreshCw, FiDownload, FiFilter, FiPlus, FiUpload, FiSettings } from 'react-icons/fi';
import DataGrid from './DataGrid';

// Example 1: Button group with icon-only buttons (recommended pattern)
export function CustomToolbarExample1() {
  const data = [
    { id: 1, name: 'Item 1', status: 'Active' },
    { id: 2, name: 'Item 2', status: 'Inactive' },
  ];

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'status', header: 'Status' },
  ];

  const customToolbar = (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', alignItems: 'center' }}>
        <div className="toolbar-button-group">
          <button 
            className="toolbar-button" 
            onClick={() => alert('Filter')}
            title="Filter items"
            aria-label="Filter"
          >
            <FiFilter />
          </button>
          <button 
            className="toolbar-button reload-button" 
            onClick={() => console.log('Reload')}
            title="Reload data"
            aria-label="Reload"
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <DataGrid
      data={data}
      columns={columns}
      toolbar={customToolbar}
    />
  );
}

// Example 2: Button group with multiple actions (icon-only with tooltips)
export function CustomToolbarExample2() {
  const data = [
    { id: 1, name: 'Product 1', price: 99.99 },
  ];

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
    { key: 'price', header: 'Price' },
  ];

  const customToolbar = (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', alignItems: 'center' }}>
        <div className="toolbar-button-group">
          <button 
            className="toolbar-button" 
            onClick={() => alert('Import')}
            title="Import data from file"
            aria-label="Import"
          >
            <FiUpload />
          </button>
          <button 
            className="toolbar-button" 
            onClick={() => alert('Export')}
            title="Export data to CSV/Excel"
            aria-label="Export"
          >
            <FiDownload />
          </button>
          <button 
            className="toolbar-button" 
            onClick={() => alert('Filter')}
            title="Filter and sort data"
            aria-label="Filter"
          >
            <FiFilter />
          </button>
          <button 
            className="toolbar-button" 
            onClick={() => alert('Settings')}
            title="Table settings"
            aria-label="Settings"
          >
            <FiSettings />
          </button>
          <button 
            className="toolbar-button reload-button" 
            onClick={() => console.log('Reload')}
            title="Reload data"
            aria-label="Reload"
          >
            <FiRefreshCw />
          </button>
          <button 
            className="toolbar-button primary-button" 
            onClick={() => alert('Add New')}
            title="Add new item"
            aria-label="Add new"
          >
            <FiPlus />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <DataGrid
      data={data}
      columns={columns}
      toolbar={customToolbar}
    />
  );
}

// Example 3: Toolbar as array with button group
export function CustomToolbarExample3() {
  const data = [
    { id: 1, name: 'Item 1' },
  ];

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
  ];

  const toolbarItems = [
    <div key="group" className="toolbar-button-group" style={{ marginLeft: 'auto' }}>
      <button 
        className="toolbar-button" 
        onClick={() => alert('Export')}
        title="Export data"
        aria-label="Export"
      >
        <FiDownload />
      </button>
      <button 
        className="toolbar-button reload-button" 
        onClick={() => console.log('Reload')}
        title="Reload data"
        aria-label="Reload"
      >
        <FiRefreshCw />
      </button>
    </div>,
  ];

  return (
    <DataGrid
      data={data}
      columns={columns}
      toolbar={toolbarItems}
    />
  );
}

// Example 4: Toolbar with conditional rendering
export function CustomToolbarExample4({ isAdmin = false }) {
  const data = [
    { id: 1, name: 'Item 1' },
  ];

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
  ];

  const customToolbar = (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
        {isAdmin && (
          <button className="toolbar-button" onClick={() => alert('Admin Action')}>
            <FiSettings />
            <span>Admin Settings</span>
          </button>
        )}
        <button className="toolbar-button reload-button" onClick={() => console.log('Reload')}>
          <FiRefreshCw />
          <span>Reload</span>
        </button>
      </div>
    </>
  );

  return (
    <DataGrid
      data={data}
      columns={columns}
      toolbar={customToolbar}
    />
  );
}

// Example 5: Minimal toolbar (only custom buttons, no default search/reload)
export function CustomToolbarExample5() {
  const data = [
    { id: 1, name: 'Item 1' },
  ];

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
  ];

  const customToolbar = (
    <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'flex-end' }}>
      <button className="toolbar-button primary-button" onClick={() => alert('Add')}>
        <FiPlus />
        <span>Add New</span>
      </button>
    </div>
  );

  return (
    <DataGrid
      data={data}
      columns={columns}
      toolbar={customToolbar}
      showSearch={false}
      showReload={false}
    />
  );
}

/**
 * DataGrid Usage Examples
 * 
 * This file demonstrates how to use the DataGrid component
 * with various configurations.
 */

import React, { useState } from 'react';
import DataGrid from './DataGrid';

// Example 1: Basic Usage
export function BasicDataGridExample() {
  const [data] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
  ]);

  const columns = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
  ];

  const handleAction = (action, row) => {
    console.log(action, row);
    alert(`${action} action for ${row.name}`);
  };

  return (
    <DataGrid
      data={data}
      columns={columns}
      onReload={() => console.log('Reload clicked')}
      onAction={handleAction}
    />
  );
}

// Example 2: Products Grid
export function ProductsGridExample() {
  const [data, setData] = useState([
    { id: 1, name: 'Laptop', category: 'Electronics', price: 999.99, stock: 45 },
    { id: 2, name: 'T-Shirt', category: 'Clothing', price: 29.99, stock: 120 },
    { id: 3, name: 'Coffee', category: 'Beverages', price: 9.99, stock: 200 },
  ]);

  const columns = [
    { 
      key: 'id', 
      header: 'ID', 
      width: '80px',
      align: 'center'
    },
    { 
      key: 'name', 
      header: 'Product Name' 
    },
    { 
      key: 'category', 
      header: 'Category' 
    },
    { 
      key: 'price', 
      header: 'Price',
      format: (value) => `$${value.toFixed(2)}`,
      align: 'right'
    },
    { 
      key: 'stock', 
      header: 'Stock',
      align: 'center',
      render: (value) => (
        <span style={{ 
          color: value < 50 ? 'var(--danger-color)' : 'var(--text-primary)' 
        }}>
          {value}
        </span>
      )
    },
  ];

  const handleReload = () => {
    // Simulate API call
    console.log('Reloading products...');
    // In real app: fetch data from API
  };

  const handleAction = (action, row) => {
    switch (action) {
      case 'view':
        alert(`Viewing product: ${row.name}`);
        break;
      case 'edit':
        alert(`Editing product: ${row.name}`);
        break;
      case 'delete':
        if (window.confirm(`Delete ${row.name}?`)) {
          setData(data.filter(item => item.id !== row.id));
        }
        break;
      default:
        break;
    }
  };

  return (
    <DataGrid
      data={data}
      columns={columns}
      onReload={handleReload}
      onAction={handleAction}
      pageSize={5}
      searchPlaceholder="Search products..."
      emptyMessage="No products found"
    />
  );
}

// Example 3: Custom Action Buttons
export function CustomActionsExample() {
  const [data] = useState([
    { id: 1, title: 'Document 1', status: 'Active' },
    { id: 2, title: 'Document 2', status: 'Inactive' },
  ]);

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'title', header: 'Title' },
    { key: 'status', header: 'Status' },
  ];

  return (
    <DataGrid
      data={data}
      columns={columns}
      actionButtons={{
        view: true,
        edit: true,
        delete: false, // Hide delete button
      }}
      onAction={(action, row) => console.log(action, row)}
    />
  );
}

// Example 4: Without Pagination
export function NoPaginationExample() {
  const [data] = useState([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ]);

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
  ];

  return (
    <DataGrid
      data={data}
      columns={columns}
      showPagination={false}
      showActions={false}
    />
  );
}

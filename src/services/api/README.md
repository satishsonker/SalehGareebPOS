# API Services

This directory contains all API service modules organized by feature area. All endpoints from the OpenAPI specification have been implemented.

## Structure

```
src/services/api/
├── accessControlApi.js    # Access control endpoints
├── adminApi.js            # Admin management endpoints
├── menuApi.js             # Menu endpoints
├── productsApi.js         # Product CRUD endpoints
├── usersApi.js            # User authentication and management
└── index.js               # Central export point
```

## Usage

### Import Services

```javascript
// Import all services
import * as api from '../services/api';

// Or import specific services
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../services/api/productsApi';

import { 
  login, 
  register, 
  logout 
} from '../services/api/usersApi';
```

### Authentication

All API requests automatically include the Bearer token from localStorage or sessionStorage if available. The token is retrieved from:
1. `localStorage.getItem('token')`
2. `sessionStorage.getItem('token')` (fallback)

### Example Usage

```javascript
import { getProducts, createProduct } from '../services/api/productsApi';
import { login } from '../services/api/usersApi';

// Login
const handleLogin = async () => {
  try {
    const response = await login({
      username: 'user123',
      password: 'password123',
      shopId: 1 // optional
    });
    
    // Store token
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Get products
const fetchProducts = async () => {
  try {
    const response = await getProducts();
    console.log('Products:', response.data);
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
};

// Create product
const addProduct = async () => {
  try {
    const response = await createProduct({
      name: 'New Product',
      price: 99.99,
      stock: 100,
      description: 'Product description'
    });
    console.log('Product created:', response.data);
  } catch (error) {
    console.error('Failed to create product:', error);
  }
};
```

## API Modules

### AccessControl API (`accessControlApi.js`)

- `getUserAccess(userId)` - Get user access information
- `grantShopAccess(data)` - Grant shop access to role
- `grantMenuAccess(data)` - Grant menu access to role
- `removeShopAccess(roleId, shopId)` - Remove shop access
- `removeMenuAccess(roleId, shopId, menuId)` - Remove menu access
- `checkAccess(params)` - Check user access (shopId, menuCode, subMenuCode)

### Admin API (`adminApi.js`)

**Shops:**
- `getShops()` - Get all shops
- `getShopById(id)` - Get shop by ID
- `createShop(data)` - Create new shop
- `updateShop(id, data)` - Update shop
- `deleteShop(id)` - Delete shop

**Roles:**
- `getRoles()` - Get all roles
- `getRoleById(id)` - Get role by ID
- `createRole(data)` - Create new role
- `updateRole(id, data)` - Update role
- `deleteRole(id)` - Delete role

**User-Shop Assignment:**
- `assignUserToShop(data)` - Assign user to shop
- `updateUserShopAssignment(data)` - Update user-shop assignment
- `removeUserFromShop(userId, shopId)` - Remove user from shop

**Permissions:**
- `assignRoleMenuPermission(data)` - Assign menu permission to role
- `assignRoleSubMenuPermission(data)` - Assign submenu permission to role
- `assignUserMenuPermission(data)` - Assign menu permission to user
- `assignUserSubMenuPermission(data)` - Assign submenu permission to user
- `removeUserMenuPermission(userId, shopId, menuId)` - Remove user menu permission
- `removeUserSubMenuPermission(userId, shopId, subMenuId)` - Remove user submenu permission

### Menu API (`menuApi.js`)

- `getAccessibleMenus()` - Get accessible menus for current user

### Products API (`productsApi.js`)

- `getProducts()` - Get all products
- `getProductById(id)` - Get product by ID
- `createProduct(data)` - Create new product
- `updateProduct(id, data)` - Update product
- `deleteProduct(id)` - Delete product

### Users API (`usersApi.js`)

**Authentication:**
- `register(data)` - Register new user
- `login(data)` - Login user
- `logout()` - Logout user

**User Management:**
- `getUserById(id)` - Get user by ID
- `updateUser(id, data)` - Update user
- `deleteUser(id)` - Delete user

**Password Management:**
- `changePassword(data)` - Change user password
- `forgotPassword(data)` - Request password reset
- `forgotUsername(data)` - Request username reminder

**Profile:**
- `uploadProfilePicture(id, file)` - Upload profile picture
- `deleteProfilePicture(id)` - Delete profile picture

**User Status:**
- `blockUser(id, data)` - Block user
- `unblockUser(id)` - Unblock user

## Response Format

All API responses follow this format:

```typescript
{
  success: boolean;
  message: string | null;
  data: T; // Response data (varies by endpoint)
  errors: string[] | null;
}
```

## Error Handling

All API functions throw errors that should be caught:

```javascript
try {
  const response = await getProducts();
  // Handle success
} catch (error) {
  // Handle error
  console.error('API Error:', error.message);
}
```

## Base URL Configuration

The base API URL is configured in `src/config/index.js` and can be overridden with the `REACT_APP_API_URL` environment variable.

Default: `https://localhost:7194`

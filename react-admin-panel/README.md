# React Admin Panel

A comprehensive admin panel for e-commerce management built with React, Material UI, and RESTful API integration.

## Features

- **Dashboard**: Overview of key metrics and statistics
- **Products Management**: Create, edit, delete, and list products
- **Categories Management**: Create, edit, delete, and list categories
- **Orders Management**: View and update order status
- **Users Management**: Manage user accounts and permissions
- **Home Sections Management**: Create and manage homepage sections for the storefront
- **Coupons Management**: Create and manage discount coupons with product/category associations

## API Integration

The admin panel integrates with the following API endpoints:

### Products
- GET /admin/products - List all products
- GET /admin/products/{id} - Get product details
- POST /admin/products - Create a new product
- PATCH /admin/products/{id} - Update a product
- PATCH /admin/products/{id}/images - Update product images
- DELETE /admin/products/{id} - Delete a product

### Categories
- GET /admin/categories - List all categories
- POST /admin/categories - Create a new category
- PATCH /admin/categories/{id} - Update a category
- DELETE /admin/categories/{id} - Delete a category

### Orders
- GET /admin/orders - List all orders
- GET /admin/orders/{id} - Get order details
- PATCH /admin/orders/{id}/status - Update order status

### Users
- GET /admin/users - List all users
- GET /admin/users/{id} - Get user details
- PATCH /admin/users/{id} - Update a user
- DELETE /admin/users/{id} - Delete a user

### Home Sections
- GET /admin/home-sections - List all home sections
- GET /admin/home-sections/{id} - Get home section details
- POST /admin/home-sections - Create a new home section
- PATCH /admin/home-sections/{id} - Update a home section
- DELETE /admin/home-sections/{id} - Delete a home section

### Coupons
- GET /admin/coupons - List all coupons
- GET /admin/coupons/{id} - Get coupon details
- POST /admin/coupons - Create a new coupon
- PATCH /admin/coupons/{id} - Update a coupon
- DELETE /admin/coupons/{id} - Delete a coupon
- POST /admin/coupons/{id}/products - Add products to a coupon
- POST /admin/coupons/{id}/categories - Add categories to a coupon

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd react-admin-panel

# Install dependencies
npm install
# or
yarn install
```

### Running the Application

```bash
# Start the development server
npm start
# or
yarn start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Building for Production

```bash
npm run build
# or
yarn build
```

This builds the app for production to the `build` folder.

## Technologies Used

- React.js
- React Router
- Material UI
- Axios for API requests
- React Context API for state management
- React Toastify for notifications

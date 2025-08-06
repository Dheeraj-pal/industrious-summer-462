# E-commerce Backend API

A robust and scalable e-commerce backend API built with NestJS and PostgreSQL.

## Features

- User authentication and authorization with JWT
- Role-based access control (Admin and User roles)
- Product management with categories
- Shopping cart functionality
- Order management
- Swagger API documentation
- PostgreSQL database with TypeORM
- Input validation and error handling
- Logging with Winston

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dollar-nest-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.development` file in the root directory with the following variables:
```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ecommerce_db

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=1d

# Swagger
SWAGGER_TITLE=Dollar General
SWAGGER_DESCRIPTION=The Dollar General description
SWAGGER_VERSION=1.0
```

4. Create the database:
```bash
createdb ecommerce_db
```

5. Run database migrations:
```bash
npm run migration:run
```

## Running the Application

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:
```
http://localhost:3030/api
```

## Project Structure

```
src/
├── auth/                 # Authentication module
├── users/               # Users module
├── products/            # Products module
├── categories/          # Categories module
├── orders/             # Orders module
├── cart/               # Shopping cart module
├── common/             # Common utilities and services
└── main.ts             # Application entry point
```

## API Endpoints

### Authentication
- POST /auth/login - User login

### Users
- POST /users - Create user (Admin only)
- GET /users - Get all users (Admin only)
- GET /users/:id - Get user by ID (Admin only)
- PATCH /users/:id - Update user (Admin only)
- DELETE /users/:id - Delete user (Admin only)

### Products
- POST /products - Create product (Admin only)
- GET /products - Get all products
- GET /products/:id - Get product by ID
- PATCH /products/:id - Update product (Admin only)
- DELETE /products/:id - Delete product (Admin only)

### Categories
- POST /categories - Create category (Admin only)
- GET /categories - Get all categories
- GET /categories/:id - Get category by ID
- PATCH /categories/:id - Update category (Admin only)
- DELETE /categories/:id - Delete category (Admin only)

### Cart
- GET /cart - Get user cart
- POST /cart/items - Add item to cart
- PATCH /cart/items/:id - Update cart item
- DELETE /cart/items/:id - Remove item from cart
- DELETE /cart - Clear cart

### Orders
- POST /orders - Create order
- GET /orders - Get user orders
- GET /orders/:id - Get order by ID
- PATCH /orders/:id - Update order
- DELETE /orders/:id - Cancel order

## Testing

Run unit tests:
```bash
npm run test
```

Run e2e tests:
```bash
npm run test:e2e
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.

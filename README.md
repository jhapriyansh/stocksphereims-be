# StockSphere Backend

## Overview

StockSphere Backend is a Node.js-based server application that powers the inventory management system. It provides RESTful APIs for managing products, users, stock requests, and billing operations.

**Frontend Repository**: [StockSphere Frontend](https://github.com/jhapriyansh/stocksphere-showcase)

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
backend/
├── config/              # Configuration files
│   ├── cookieConfig.js  # Cookie settings
│   └── db.js           # Database configuration
├── controllers/         # Request handlers
│   ├── billController.js
│   ├── productController.js
│   ├── stockRequestController.js
│   └── userController.js
├── middleware/         # Custom middleware
│   └── authMiddleware.js
├── models/            # Database models
│   ├── Bill.js
│   ├── Product.js
│   ├── StockRequest.js
│   └── User.js
├── routes/            # API routes
│   ├── billRoutes.js
│   ├── productRoutes.js
│   ├── stockRequestRoutes.js
│   └── userRoutes.js
├── scripts/           # Utility scripts
│   └── seedDatabase.js
└── server.js          # Application entry point
```

## Setup and Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/jhapriyansh/stocksphereims-be
   cd stocksphereims-be
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:

   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

4. **Database Seeding (Required for Initial Setup)**

   ```bash
   node scripts/seedDatabase.js
   ```

   This step is necessary as it creates the initial admin user which can then be used to log in and manage the system, including adding more staff members. The seeding script will create:

   Default Admin Credentials:

   - Email: admin@stocksphere.com
   - Password: admin123

   Default Staff Credentials:

   - Email: john@stocksphere.com
   - Password: staff123
   - Email: sarah@stocksphere.com
   - Password: staff123

   The script also creates:

   - Initial product categories and sample products
   - Sample stock requests
   - Sample bills for demonstration purposes

5. **Start the Server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout
- `POST /api/users/register` - Register new user (Admin only)
- `POST /api/users/change-password` - Change user password

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Stock Requests

- `GET /api/stock-requests` - Get all stock requests
- `POST /api/stock-requests` - Create new stock request
- `PUT /api/stock-requests/:id` - Update stock request status
- `DELETE /api/stock-requests/:id` - Delete stock request

### Bills

- `GET /api/bills` - Get all bills
- `POST /api/bills` - Create new bill
- `GET /api/bills/:id` - Get bill by ID

## Models

### User Model

- `username`: String (required, unique)
- `password`: String (required)
- `role`: String (enum: ['admin', 'staff'])

### Product Model

- `name`: String (required)
- `price`: Number (required)
- `quantity`: Number (required)
- `category`: String
- `description`: String

### Stock Request Model

- `product`: ObjectId (ref: 'Product')
- `quantity`: Number (required)
- `status`: String (enum: ['pending', 'approved', 'rejected'])
- `requestedBy`: ObjectId (ref: 'User')

### Bill Model

- `items`: Array of {product, quantity, price}
- `total`: Number
- `generatedBy`: ObjectId (ref: 'User')
- `timestamp`: Date

## Security

- JWT-based authentication
- Password hashing using bcrypt
- Role-based access control
- HTTP-only cookies for token storage

## Error Handling

The application uses a centralized error handling mechanism with custom error classes for different types of errors:

- Authentication errors
- Validation errors
- Not found errors
- Database errors

## Development

### Code Style

- Follow ESLint configuration
- Use async/await for asynchronous operations
- Follow REST API conventions

### Testing

```bash
npm test
```

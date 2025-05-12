# E-Commerce Platform GraphQL API

A GraphQL API for an e-commerce platform built with Node.js, TypeORM, Apollo Server, and PostgreSQL.

**GitHub Repository:** [ashutosh678/Unisouk-Ecommerce-Project](https://github.com/ashutosh678/Unisouk-Ecommerce-Project)

---

## Features

- User authentication with JWT
- Role-based authorization (ADMIN and CUSTOMER)
- Product management with filtering
- Category management
- Order management
- User management and profile update
- Input validation with DTOs and class-validator
- Error handling and clean code structure

---

## Prerequisites

- Node.js (v16+)
- PostgreSQL 13+
- npm

---

## Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ashutosh678/Unisouk-Ecommerce-Project.git
   cd Unisouk-Ecommerce-Project
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a PostgreSQL database:**

   ```sql
   CREATE DATABASE ecommerce_db;
   ```

4. **Configure environment variables:**

   Copy the template and fill in your values:

   ```bash
   cp env.template .env
   # Edit .env with your DB and JWT settings
   ```

   Example `.env` variables:

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=ecommerce_db
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```

5. **Run database migrations:**

   ```bash
   npm run typeorm migration:run
   ```

6. **Start the development server:**

   ```bash
   npm run start:dev
   ```

   The API will be available at `http://localhost:3000/graphql`.

---

## Project Structure

```
src/
├── config/         # Database and app config
├── graphql/        # GraphQL resolvers
├── middleware/     # Auth and error middleware
├── migrations/     # TypeORM migration scripts
├── models/         # TypeORM entities
├── types/          # Custom types
├── utils/          # Utility functions
├── validators/     # DTOs and input validation
└── server.ts       # App entry point
```

---

## API Documentation

### Authentication

#### Register a new user

```graphql
mutation {
	register(
		data: {
			email: "user@example.com"
			password: "password123"
			firstName: "John"
			lastName: "Doe"
		}
	) {
		id
		email
		firstName
		lastName
		role
	}
}
```

#### Login

```graphql
mutation {
	login(email: "user@example.com", password: "password123")
}
```

### User Management

#### Get current user

```graphql
query {
	me {
		id
		email
		firstName
		lastName
		role
	}
}
```

#### Update profile

```graphql
mutation {
	updateProfile(
		data: { firstName: "Jane", lastName: "Smith", password: "newpass123" }
	) {
		id
		firstName
		lastName
	}
}
```

#### List all users (admin only)

```graphql
query {
	users {
		id
		email
		role
	}
}
```

#### Update user role (admin only)

```graphql
mutation {
	updateUserRole(data: { id: "user-uuid", role: ADMIN }) {
		id
		email
		role
	}
}
```

---

### Product Management

#### Get all products (with filtering)

```graphql
query {
	products(categoryId: "cat-uuid", minPrice: 10, maxPrice: 100) {
		id
		name
		price
		category {
			id
			name
		}
	}
}
```

#### Get product by ID

```graphql
query {
	product(id: "product-uuid") {
		id
		name
		description
		price
		inventory
		category {
			id
			name
		}
	}
}
```

#### Create product (admin only)

```graphql
mutation {
	createProduct(
		data: {
			name: "Product 1"
			description: "A great product"
			price: 10.5
			inventory: 100
			categoryId: "cat-uuid"
		}
	) {
		id
		name
	}
}
```

#### Update product (admin only)

```graphql
mutation {
	updateProduct(
		id: "product-uuid"
		data: {
			name: "Updated Name"
			description: "Updated description"
			price: 20
			inventory: 50
			categoryId: "cat-uuid"
		}
	) {
		id
		name
	}
}
```

#### Delete product (admin only)

```graphql
mutation {
	deleteProduct(id: "product-uuid")
}
```

---

### Category Management

#### Get all categories

```graphql
query {
	categories {
		id
		name
		description
		products {
			id
			name
			price
		}
	}
}
```

#### Get category by ID

```graphql
query {
	category(id: "cat-uuid") {
		id
		name
		description
		products {
			id
			name
			price
		}
	}
}
```

#### Create category (admin only)

```graphql
mutation {
	createCategory(
		data: { name: "Electronics", description: "Electronic items" }
	) {
		id
		name
	}
}
```

#### Update category (admin only)

```graphql
mutation {
	updateCategory(
		id: "cat-uuid"
		data: { name: "Updated", description: "Updated desc" }
	) {
		id
		name
	}
}
```

#### Delete category (admin only)

```graphql
mutation {
	deleteCategory(id: "cat-uuid")
}
```

---

### Order Management

#### Get orders (admin: all, customer: own)

```graphql
query {
	orders {
		id
		status
		totalAmount
		items {
			quantity
			unitPrice
			product {
				name
				price
			}
		}
	}
}
```

#### Get order by ID

```graphql
query {
	order(id: "order-uuid") {
		id
		status
		totalAmount
		items {
			quantity
			unitPrice
			product {
				name
				price
			}
		}
	}
}
```

#### Create order

```graphql
mutation {
	createOrder(
		items: [
			{ productId: "prod-uuid", quantity: 2 }
			{ productId: "prod2-uuid", quantity: 1 }
		]
	) {
		id
		status
		totalAmount
	}
}
```

#### Update order status (admin only)

```graphql
mutation {
	updateOrderStatus(data: { id: "order-uuid", status: SHIPPED }) {
		id
		status
	}
}
```

---

## Migrations

- All database migrations are in the `/migrations` folder.
- Run migrations with:
  ```bash
  npm run typeorm migration:run
  ```

---

## Environment Variables

See `env.template` for all required environment variables.

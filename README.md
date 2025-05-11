# E-Commerce Platform GraphQL API

A GraphQL API for an e-commerce platform built with NestJS, TypeORM, and PostgreSQL.

## Features

- User authentication with JWT
- Role-based authorization (ADMIN and CUSTOMER)
- Product management
- Category management
- Order management
- User management

## Prerequisites

- Node.js (v16+)
- PostgreSQL 13+
- npm or yarn

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:

```bash
npm install
```

3. Create a PostgreSQL database:

```sql
CREATE DATABASE ecommerce_db;
```

4. Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=ecommerce_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h

# Server Configuration
PORT=3000
NODE_ENV=development
```

5. Run database migrations:

```bash
npm run typeorm migration:run
```

6. Start the development server:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/graphql`.

## API Documentation

### Authentication

#### Register a new user

```graphql
mutation {
	register(
		input: {
			email: "user@example.com"
			password: "password123"
			firstName: "John"
			lastName: "Doe"
		}
	) {
		access_token
		user {
			id
			email
			firstName
			lastName
			role
		}
	}
}
```

#### Login

```graphql
mutation {
	login(input: { email: "user@example.com", password: "password123" }) {
		access_token
		user {
			id
			email
			firstName
			lastName
			role
		}
	}
}
```

### Products

#### Get all products

```graphql
query {
	products {
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

#### Get product by ID

```graphql
query {
	product(id: "product-id") {
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

### Categories

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

### Orders

#### Get user's orders

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

## Development

### Available Scripts

- `npm run start`: Start the application
- `npm run start:dev`: Start the application in development mode with hot reload
- `npm run build`: Build the application
- `npm run test`: Run tests
- `npm run typeorm`: Run TypeORM CLI commands

### Project Structure

```
src/
├── auth/                 # Authentication module
├── users/               # Users module
├── products/            # Products module
├── categories/          # Categories module
├── orders/              # Orders module
├── app.module.ts        # Root module
└── main.ts             # Application entry point
```

## License

This project is licensed under the MIT License.

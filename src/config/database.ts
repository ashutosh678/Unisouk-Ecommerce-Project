import { DataSource } from "typeorm";
import { config } from "dotenv";
import { User } from "../models/user.model";
import { Product } from "../models/product.model";
import { Category } from "../models/category.model";
import { Order } from "../models/order.model";
import { OrderItem } from "../models/order-item.model";
import logger from "../utils/logger";

config();

export const AppDataSource = new DataSource({
	type: "postgres",
	host: process.env.DATABASE_HOST || "localhost",
	port: parseInt(process.env.DATABASE_PORT || "5432"),
	username: process.env.DATABASE_USERNAME || "postgres",
	password: process.env.DATABASE_PASSWORD || "postgres",
	database: process.env.DATABASE_NAME || "ecommerce",
	synchronize: true,
	dropSchema: process.env.NODE_ENV === "development",
	logging: false,
	entities: [User, Product, Category, Order, OrderItem],
	// migrations: [process.env.NODE_ENV === "production" ? "dist/migrations/*.js" : "src/migrations/*.ts"],
	subscribers: ["src/subscribers/*.ts"],
});

// Initialize database connection
export const initializeDatabase = async () => {
	try {
		if (!AppDataSource.isInitialized) {
			await AppDataSource.initialize();
			logger.info("Database connection initialized");
			// No migrations, just synchronize
			await AppDataSource.synchronize();
			logger.info(
				"Database schema synchronized (missing tables created if needed)"
			);
		}
	} catch (error) {
		logger.error("Error during database initialization:", error);
		throw error;
	}
};

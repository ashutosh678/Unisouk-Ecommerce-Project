import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import { json } from "body-parser";
import { buildSchema } from "type-graphql";
import { AppDataSource, initializeDatabase } from "./config/database";
import { UserResolver } from "./graphql/resolvers/user.resolver";
import { CategoryResolver } from "./graphql/resolvers/category.resolver";
import { ProductResolver } from "./graphql/resolvers/product.resolver";
import { OrderResolver } from "./graphql/resolvers/order.resolver";
import { authChecker, authMiddleware } from "./middleware/auth.middleware";
import logger from "./utils/logger";
import { handleError } from "./utils/errorHandler";

async function bootstrap() {
	try {
		// Initialize database
		await initializeDatabase();

		// Create Express app
		const app = express();
		const httpServer = http.createServer(app);

		// Build GraphQL schema
		const schema = await buildSchema({
			resolvers: [
				UserResolver,
				CategoryResolver,
				ProductResolver,
				OrderResolver,
			],
			authChecker,
			emitSchemaFile: true,
			validate: false,
		});

		// Create Apollo Server
		const server = new ApolloServer({
			schema,
			plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
			formatError: (error) => {
				logger.error("GraphQL Error:", {
					message: error.message,
					path: error.path,
					extensions: error.extensions,
				});
				return {
					message: error.message,
					path: error.path,
					extensions: error.extensions,
				};
			},
		});

		// Start server
		await server.start();

		// Apply middleware
		app.use(
			"/graphql",
			cors<cors.CorsRequest>(),
			json(),
			expressMiddleware(server, {
				context: async ({ req }) => {
					const user = await authMiddleware(req);
					return { req, user };
				},
			})
		);

		// Start HTTP server
		const PORT = process.env.PORT || 4000;
		await new Promise<void>((resolve) =>
			httpServer.listen({ port: PORT }, resolve)
		);
		logger.info(`🚀 Server ready at http://localhost:${PORT}/graphql`);
	} catch (error) {
		logger.error("Failed to start server:", error);
		process.exit(1);
	}
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (error: Error) => {
	logger.error("Unhandled Promise Rejection:", error);
	process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
	logger.error("Uncaught Exception:", error);
	process.exit(1);
});

bootstrap();

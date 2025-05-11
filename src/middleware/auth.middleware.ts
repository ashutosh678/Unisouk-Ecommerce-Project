import { Request } from "express";
import { verify } from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User, UserRole } from "../models/user.model";
import logger from "../utils/logger";
import { AuthenticationError } from "../utils/errorHandler";

// Auth checker for type-graphql
export const authChecker = (
	{ context }: { context: any },
	roles?: UserRole[]
) => {
	try {
		if (!context.user) return false;
		if (!roles || roles.length === 0) return true;
		return roles.includes(context.user.role);
	} catch (error) {
		logger.error("Auth checker error:", error);
		return false;
	}
};

// Middleware to authenticate requests
export const authMiddleware = async (req: Request) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			logger.debug("No authorization header provided");
			return null;
		}

		const token = authHeader.split(" ")[1];
		if (!token) {
			logger.debug("No token provided in authorization header");
			return null;
		}

		try {
			logger.info(`Verifying token: ${token}`);
			const decoded = verify(token, process.env.JWT_SECRET!) as {
				id: string;
				role: UserRole;
			};
			logger.info(`Decoded token: ${JSON.stringify(decoded)}`);
			const userRepository = AppDataSource.getRepository(User);
			const user = await userRepository.findOne({ where: { id: decoded.id } });

			if (!user) {
				logger.warn(`User not found for token: ${decoded.id}`);
				throw new AuthenticationError("User not found");
			}
			logger.info(`User found: ${JSON.stringify(user)}`);
			// Verify token role matches user role
			if (decoded.role !== user.role) {
				logger.warn(`Token role mismatch for user ${user.id}`);
				throw new AuthenticationError("Invalid token");
			}

			logger.debug(`Authenticated user: ${user.id} with role: ${user.role}`);
			return user;
		} catch (error) {
			logger.warn("Invalid token:", error);
			throw new AuthenticationError("Invalid token");
		}
	} catch (error) {
		logger.error("Auth middleware error:", error);
		throw error instanceof AuthenticationError
			? error
			: new AuthenticationError("Authentication failed");
	}
};

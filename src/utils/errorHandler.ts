import logger from "./logger";

export class AppError extends Error {
	constructor(
		public statusCode: number,
		public message: string,
		public isOperational = true
	) {
		super(message);
		Object.setPrototypeOf(this, AppError.prototype);
	}
}

export class DatabaseError extends AppError {
	constructor(message: string) {
		super(500, `Database error: ${message}`);
	}
}

export class ValidationError extends AppError {
	constructor(message: string) {
		super(400, `Validation error: ${message}`);
	}
}

export class AuthenticationError extends AppError {
	constructor(message: string) {
		super(401, `Authentication error: ${message}`);
	}
}

export class AuthorizationError extends AppError {
	constructor(message: string) {
		super(403, `Authorization error: ${message}`);
	}
}

export class NotFoundError extends AppError {
	constructor(message: string) {
		super(404, `Not found: ${message}`);
	}
}

export const handleError = (error: Error) => {
	logger.error("Error occurred:", {
		error: error.message,
		stack: error.stack,
		name: error.name,
	});

	if (error instanceof AppError) {
		return {
			message: error.message,
			statusCode: error.statusCode,
			isOperational: error.isOperational,
		};
	}

	// Handle unknown errors
	return {
		message: "Internal server error",
		statusCode: 500,
		isOperational: false,
	};
};

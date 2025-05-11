import {
	Resolver,
	Query,
	Mutation,
	Arg,
	ID,
	Ctx,
	Authorized,
} from "type-graphql";
import { User, UserRole } from "../../models/user.model";
import { AppDataSource } from "../../config/database";
import { Context } from "../../types/context";
import { hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import logger from "../../utils/logger";
import {
	AppError,
	DatabaseError,
	ValidationError,
	AuthenticationError,
	NotFoundError,
	handleError,
} from "../../utils/errorHandler";
import { validateOrReject, IsEmail, MinLength, Length } from "class-validator";
import { InputType, Field } from "type-graphql";
import { RegisterUserInput } from "../../validators/register-user.input";
import { UpdateUserRoleInput } from "../../validators/update-user-role.input";

@Resolver(User)
export class UserResolver {
	private userRepository = AppDataSource.getRepository(User);

	@Query(() => [User])
	@Authorized([UserRole.ADMIN])
	async users(): Promise<User[]> {
		try {
			logger.info("Fetching all users");
			const users = await this.userRepository.find();
			logger.info(`Successfully fetched ${users.length} users`);
			return users;
		} catch (error) {
			logger.error("Error fetching users:", error);
			throw new DatabaseError("Failed to fetch users");
		}
	}

	@Query(() => User)
	@Authorized()
	async me(@Ctx() { user }: Context): Promise<User> {
		if (!user) throw new Error("Not authenticated");
		const foundUser = await this.userRepository.findOne({
			where: { id: user.id },
		});
		if (!foundUser) throw new Error("User not found");
		return foundUser;
	}

	@Mutation(() => User)
	async register(@Arg("data") data: RegisterUserInput): Promise<User> {
		try {
			logger.info(`Attempting to register new user with email: ${data.email}`);

			await validateOrReject(data);

			// Check if user already exists
			const existingUser = await this.userRepository.findOne({
				where: { email: data.email },
			});
			if (existingUser) {
				logger.warn(`Email already registered: ${data.email}`);
				throw new ValidationError("Email already registered");
			}

			// Hash password
			const hashedPassword = await hash(data.password, 10);

			// Create new user
			const user = this.userRepository.create({
				email: data.email,
				password: hashedPassword,
				firstName: data.firstName,
				lastName: data.lastName,
			});

			// Save user
			const savedUser = await this.userRepository.save(user);
			logger.info(`Successfully registered new user with ID: ${savedUser.id}`);
			return savedUser;
		} catch (error) {
			logger.error("Error registering user:", error);
			throw error instanceof AppError
				? error
				: new DatabaseError("Failed to register user");
		}
	}

	@Mutation(() => String)
	async login(
		@Arg("email") email: string,
		@Arg("password") password: string
	): Promise<string> {
		try {
			logger.info(`Login attempt for email: ${email}`);

			// Find user
			const user = await this.userRepository.findOne({
				where: { email },
			});
			if (!user) {
				logger.warn(`Login failed: User not found with email: ${email}`);
				throw new AuthenticationError("Invalid credentials");
			}

			// Verify password
			const validPassword = await compare(password, user.password);
			if (!validPassword) {
				logger.warn(`Login failed: Invalid password for email: ${email}`);
				throw new AuthenticationError("Invalid credentials");
			}

			// Generate JWT
			const token = sign(
				{ id: user.id, role: user.role },
				process.env.JWT_SECRET!,
				{ expiresIn: "1d" }
			);

			logger.info(`Successfully logged in user with ID: ${user.id}`);
			return token;
		} catch (error) {
			logger.error("Error during login:", error);
			throw error instanceof AppError
				? error
				: new DatabaseError("Failed to login");
		}
	}

	@Mutation(() => User)
	@Authorized([UserRole.ADMIN])
	async updateUserRole(@Arg("data") data: UpdateUserRoleInput): Promise<User> {
		try {
			logger.info(
				`Attempting to update role for user ID: ${data.id} to ${data.role}`
			);
			await validateOrReject(data);
			// Find user
			const user = await this.userRepository.findOne({
				where: { id: data.id },
			});
			if (!user) {
				logger.warn(`User not found with ID: ${data.id}`);
				throw new NotFoundError("User not found");
			}
			// Update role
			user.role = data.role;
			const updatedUser = await this.userRepository.save(user);
			logger.info(`Successfully updated role for user ID: ${data.id}`);
			return updatedUser;
		} catch (error) {
			logger.error("Error updating user role:", error);
			throw error instanceof AppError
				? error
				: new DatabaseError("Failed to update user role");
		}
	}
}

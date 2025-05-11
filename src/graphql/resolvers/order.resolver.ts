import {
	Resolver,
	Query,
	Mutation,
	Arg,
	ID,
	Ctx,
	Authorized,
	FieldResolver,
	Root,
} from "type-graphql";
import { Order, OrderStatus } from "../../models/order.model";
import { OrderItem } from "../../models/order-item.model";
import { Product } from "../../models/product.model";
import { AppDataSource } from "../../config/database";
import { Context } from "../../types/context";
import { UserRole, User } from "../../models/user.model";
import { InputType, Field } from "type-graphql";
import { IsUUID, IsInt, Min } from "class-validator";
import { OrderItemInput } from "../../validators/order-item.input";
import { UpdateOrderStatusInput } from "../../validators/update-order-status.input";
import { validateOrReject } from "class-validator";
import logger from "../../utils/logger";

@Resolver(Order)
export class OrderResolver {
	private orderRepository = AppDataSource.getRepository(Order);
	private orderItemRepository = AppDataSource.getRepository(OrderItem);
	private productRepository = AppDataSource.getRepository(Product);

	@FieldResolver(() => User)
	async user(@Root() order: Order): Promise<User> {
		if (order.user) return order.user;
		const userId = order.userId || (order.user && order.user.id);
		if (!userId) throw new Error("User ID not found in order");
		const user = await this.orderRepository.manager.findOne(User, {
			where: { id: userId },
		});
		if (!user) throw new Error("User not found");
		return user;
	}

	@FieldResolver(() => [OrderItem])
	async items(@Root() order: Order): Promise<OrderItem[]> {
		return this.orderItemRepository.find({
			where: { order: { id: order.id } },
			relations: ["product"],
		});
	}

	@FieldResolver(() => Product)
	async product(@Root() item: OrderItem): Promise<Product> {
		const product = await this.productRepository.findOne({
			where: { id: item.product.id },
		});
		if (!product) throw new Error("Product not found");
		return product;
	}

	@Query(() => [Order])
	@Authorized()
	async orders(@Ctx() { req }: Context): Promise<Order[]> {
		const where =
			req.user!.role === UserRole.ADMIN ? {} : { user: { id: req.user!.id } };
		return this.orderRepository.find({
			where,
		});
	}

	@Query(() => Order)
	@Authorized()
	async order(
		@Arg("id", () => ID) id: string,
		@Ctx() { req }: Context
	): Promise<Order> {
		const where =
			req.user!.role === UserRole.ADMIN
				? { id }
				: { id, user: { id: req.user!.id } };

		const order = await this.orderRepository.findOne({
			where,
		});
		if (!order) throw new Error("Order not found");
		return order;
	}

	@Mutation(() => Order)
	@Authorized()
	async createOrder(
		@Arg("items", () => [OrderItemInput]) items: OrderItemInput[],
		@Ctx() { req }: Context
	): Promise<Order> {
		// Log the user ID instead of the entire request object
		logger.info(`Creating order for user ID: ${JSON.stringify(req.user)}`);
		const userId = req.user?.id;
		if (!userId) throw new Error("User not authenticated");

		const order = this.orderRepository.create({
			user: { id: userId },
			status: OrderStatus.PENDING,
			totalAmount: 0,
		});

		const savedOrder = await this.orderRepository.save(order);
		let totalAmount = 0;

		for (const item of items) {
			const product = await this.productRepository.findOne({
				where: { id: item.productId },
			});
			if (!product) throw new Error(`Product ${item.productId} not found`);
			if (product.inventory < item.quantity) {
				throw new Error(`Insufficient inventory for product ${product.name}`);
			}

			const orderItem = this.orderItemRepository.create({
				order: { id: savedOrder.id },
				product: { id: item.productId },
				quantity: item.quantity,
				unitPrice: product.price,
			});

			await this.orderItemRepository.save(orderItem);
			totalAmount += product.price * item.quantity;

			// Update product inventory
			product.inventory -= item.quantity;
			await this.productRepository.save(product);
		}

		savedOrder.totalAmount = totalAmount;
		return this.orderRepository.save(savedOrder);
	}

	@Mutation(() => Order)
	@Authorized([UserRole.ADMIN])
	async updateOrderStatus(
		@Arg("data") data: UpdateOrderStatusInput
	): Promise<Order> {
		await validateOrReject(data);
		const order = await this.orderRepository.findOne({
			where: { id: data.id },
		});
		if (!order) throw new Error("Order not found");
		order.status = data.status;
		return this.orderRepository.save(order);
	}
}

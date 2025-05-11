import {
	Resolver,
	Query,
	Mutation,
	Arg,
	ID,
	Ctx,
	Authorized,
} from "type-graphql";
import { Order, OrderStatus } from "../../models/order.model";
import { OrderItem } from "../../models/order-item.model";
import { Product } from "../../models/product.model";
import { AppDataSource } from "../../config/database";
import { Context } from "../../types/context";
import { UserRole } from "../../models/user.model";
import { InputType, Field } from "type-graphql";

@Resolver(Order)
export class OrderResolver {
	private orderRepository = AppDataSource.getRepository(Order);
	private orderItemRepository = AppDataSource.getRepository(OrderItem);
	private productRepository = AppDataSource.getRepository(Product);

	@Query(() => [Order])
	@Authorized()
	async orders(@Ctx() { req }: Context): Promise<Order[]> {
		const where =
			req.user!.role === UserRole.ADMIN ? {} : { user: { id: req.user!.id } };
		return this.orderRepository.find({
			where,
			relations: ["user", "items", "items.product"],
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
			relations: ["user", "items", "items.product"],
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
		const order = this.orderRepository.create({
			user: { id: req.user!.id },
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
		@Arg("id", () => ID) id: string,
		@Arg("status", () => String) status: OrderStatus
	): Promise<Order> {
		const order = await this.orderRepository.findOne({
			where: { id },
		});
		if (!order) throw new Error("Order not found");

		order.status = status;
		return this.orderRepository.save(order);
	}
}

@InputType()
class OrderItemInput {
	@Field()
	productId: string;

	@Field()
	quantity: number;
}

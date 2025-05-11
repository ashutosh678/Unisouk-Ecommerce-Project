import { InputType, Field, ID } from "type-graphql";
import { IsUUID, IsIn } from "class-validator";
import { OrderStatus } from "../models/order.model";

@InputType()
export class UpdateOrderStatusInput {
	@Field(() => ID)
	@IsUUID()
	id: string;

	@Field()
	@IsIn([
		OrderStatus.PENDING,
		OrderStatus.PROCESSING,
		OrderStatus.SHIPPED,
		OrderStatus.DELIVERED,
		OrderStatus.CANCELLED,
	])
	status: OrderStatus;
}

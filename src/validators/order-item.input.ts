import { InputType, Field } from "type-graphql";
import { IsUUID, IsInt, Min } from "class-validator";

@InputType()
export class OrderItemInput {
	@Field()
	@IsUUID()
	productId: string;

	@Field()
	@IsInt()
	@Min(1)
	quantity: number;
}

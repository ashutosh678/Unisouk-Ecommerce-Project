import { InputType, Field, Float, ID } from "type-graphql";
import { Length, Min, IsUUID, IsInt } from "class-validator";

@InputType()
export class ProductInput {
	@Field()
	@Length(1, 100)
	name: string;

	@Field()
	@Length(1, 500)
	description: string;

	@Field(() => Float)
	@Min(0)
	price: number;

	@Field()
	@IsInt()
	@Min(0)
	inventory: number;

	@Field(() => ID)
	@IsUUID()
	categoryId: string;
}

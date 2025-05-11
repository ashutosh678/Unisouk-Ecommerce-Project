import { InputType, Field } from "type-graphql";
import { Length } from "class-validator";

@InputType()
export class CategoryInput {
	@Field()
	@Length(1, 100)
	name: string;

	@Field()
	@Length(1, 500)
	description: string;
}

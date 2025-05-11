import { InputType, Field } from "type-graphql";
import { Length, MinLength, IsOptional } from "class-validator";

@InputType()
export class UpdateProfileInput {
	@Field({ nullable: true })
	@IsOptional()
	@Length(1, 50)
	firstName?: string;

	@Field({ nullable: true })
	@IsOptional()
	@Length(1, 50)
	lastName?: string;

	@Field({ nullable: true })
	@IsOptional()
	@MinLength(6)
	@Length(6, 100)
	password?: string;
}

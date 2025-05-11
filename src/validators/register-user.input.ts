import { InputType, Field } from "type-graphql";
import { IsEmail, MinLength, Length } from "class-validator";

@InputType()
export class RegisterUserInput {
	@Field()
	@IsEmail()
	@Length(1, 100)
	email: string;

	@Field()
	@MinLength(6)
	@Length(6, 100)
	password: string;

	@Field()
	@Length(1, 50)
	firstName: string;

	@Field()
	@Length(1, 50)
	lastName: string;
}

import { InputType, Field, ID } from "type-graphql";
import { IsUUID, IsIn } from "class-validator";
import { UserRole } from "../models/user.model";

@InputType()
export class UpdateUserRoleInput {
	@Field(() => ID)
	@IsUUID()
	id: string;

	@Field()
	@IsIn([UserRole.USER, UserRole.ADMIN])
	role: UserRole;
}

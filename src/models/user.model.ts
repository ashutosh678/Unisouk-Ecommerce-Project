import {
	Entity,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	Index,
} from "typeorm";
import { Order } from "./order.model";
import { Field, ObjectType, ID } from "type-graphql";

export enum UserRole {
	USER = "USER",
	ADMIN = "ADMIN",
}

@ObjectType()
@Entity("users")
@Index(["email"])
export class User {
	@Field(() => ID)
	@Column({ type: "uuid", primary: true, default: () => "gen_random_uuid()" })
	id: string;

	@Field()
	@Index({ unique: true })
	@Column({ unique: true, length: 100 })
	email: string;

	@Column({ length: 100 })
	password: string;

	@Field()
	@Column({ length: 50 })
	firstName: string;

	@Field()
	@Column({ length: 50 })
	lastName: string;

	@Field(() => String)
	@Column({
		type: "enum",
		enum: UserRole,
		default: UserRole.USER,
	})
	role: UserRole;

	@Field(() => [Order])
	@OneToMany(() => Order, (order) => order.user)
	orders: Order[];

	@Field()
	@CreateDateColumn()
	createdAt: Date;

	@Field()
	@UpdateDateColumn()
	updatedAt: Date;
}

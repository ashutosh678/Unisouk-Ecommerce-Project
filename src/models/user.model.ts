import {
	Entity,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from "typeorm";
import { Order } from "./order.model";
import { Field, ObjectType, ID } from "type-graphql";

export enum UserRole {
	USER = "USER",
	ADMIN = "ADMIN",
}

@ObjectType()
@Entity("users")
export class User {
	@Field(() => ID)
	@Column({ type: "uuid", primary: true, default: () => "gen_random_uuid()" })
	id: string;

	@Field()
	@Column({ unique: true })
	email: string;

	@Column()
	password: string;

	@Field()
	@Column()
	firstName: string;

	@Field()
	@Column()
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

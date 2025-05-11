import {
	Entity,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	OneToMany,
	JoinColumn,
} from "typeorm";
import { User } from "./user.model";
import { OrderItem } from "./order-item.model";
import { Field, ObjectType, ID, Float } from "type-graphql";
import { Min } from "class-validator";

export enum OrderStatus {
	PENDING = "PENDING",
	PROCESSING = "PROCESSING",
	SHIPPED = "SHIPPED",
	DELIVERED = "DELIVERED",
	CANCELLED = "CANCELLED",
}

@ObjectType()
@Entity("orders")
export class Order {
	@Field(() => ID)
	@Column({ type: "uuid", primary: true, default: () => "gen_random_uuid()" })
	id: string;

	@Field(() => ID)
	@Column({ type: "uuid" })
	userId: string;

	@Field(() => User)
	@ManyToOne(() => User, (user) => user.orders)
	@JoinColumn({ name: "userId" })
	user: User;

	@Field(() => String)
	@Column({
		type: "enum",
		enum: OrderStatus,
		default: OrderStatus.PENDING,
	})
	status: OrderStatus;

	@Field(() => Float)
	@Column("decimal", { precision: 10, scale: 2 })
	@Min(0)
	totalAmount: number;

	@Field(() => [OrderItem])
	@OneToMany(() => OrderItem, (orderItem) => orderItem.order)
	items: OrderItem[];

	@Field()
	@CreateDateColumn()
	createdAt: Date;

	@Field()
	@UpdateDateColumn()
	updatedAt: Date;
}

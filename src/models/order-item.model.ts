import {
	Entity,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
} from "typeorm";
import { Order } from "./order.model";
import { Product } from "./product.model";
import { Field, ObjectType, ID, Float } from "type-graphql";

@ObjectType()
@Entity("order_items")
export class OrderItem {
	@Field(() => ID)
	@Column({ type: "uuid", primary: true, default: () => "gen_random_uuid()" })
	id: string;

	@Field(() => Order)
	@ManyToOne(() => Order, (order) => order.items)
	order: Order;

	@Field(() => Product)
	@ManyToOne(() => Product, (product) => product.orderItems)
	product: Product;

	@Field()
	@Column()
	quantity: number;

	@Field(() => Float)
	@Column("decimal", { precision: 10, scale: 2 })
	unitPrice: number;

	@Field()
	@CreateDateColumn()
	createdAt: Date;

	@Field()
	@UpdateDateColumn()
	updatedAt: Date;
}

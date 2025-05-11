import {
	Entity,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	OneToMany,
	Index,
} from "typeorm";
import { Category } from "./category.model";
import { OrderItem } from "./order-item.model";
import { Field, ObjectType, ID, Float } from "type-graphql";

@ObjectType()
@Entity("products")
export class Product {
	@Field(() => ID)
	@Column({ type: "uuid", primary: true, default: () => "gen_random_uuid()" })
	id: string;

	@Field()
	@Index()
	@Column({ length: 100 })
	name: string;

	@Field()
	@Column("text")
	description: string;

	@Field(() => Float)
	@Column("decimal", { precision: 10, scale: 2 })
	price: number;

	@Field()
	@Column()
	inventory: number;

	@Field(() => Category)
	@ManyToOne(() => Category, (category) => category.products)
	category: Category;

	@Field(() => [OrderItem])
	@OneToMany(() => OrderItem, (orderItem) => orderItem.product)
	orderItems: OrderItem[];

	@Field()
	@CreateDateColumn()
	createdAt: Date;

	@Field()
	@UpdateDateColumn()
	updatedAt: Date;
}

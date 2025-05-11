import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from "typeorm";
import { Product } from "./product.model";
import { Field, ObjectType, ID } from "type-graphql";

@ObjectType()
@Entity("categories")
export class Category {
	@Field(() => ID)
	@Column({ type: "uuid", primary: true, default: () => "gen_random_uuid()" })
	id: string;

	@Field()
	@Column()
	name: string;

	@Field()
	@Column("text")
	description: string;

	@Field(() => [Product])
	@OneToMany(() => Product, (product) => product.category)
	products: Product[];

	@Field()
	@CreateDateColumn()
	createdAt: Date;

	@Field()
	@UpdateDateColumn()
	updatedAt: Date;
}

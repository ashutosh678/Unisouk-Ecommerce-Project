import { Resolver, Query, Mutation, Arg, ID, Authorized } from "type-graphql";
import { Product } from "../../models/product.model";
import { AppDataSource } from "../../config/database";
import { UserRole } from "../../models/user.model";

@Resolver(Product)
export class ProductResolver {
	private productRepository = AppDataSource.getRepository(Product);

	@Query(() => [Product])
	async products(): Promise<Product[]> {
		return this.productRepository.find({
			relations: ["category"],
		});
	}

	@Query(() => Product)
	async product(@Arg("id", () => ID) id: string): Promise<Product> {
		const product = await this.productRepository.findOne({
			where: { id },
			relations: ["category"],
		});
		if (!product) throw new Error("Product not found");
		return product;
	}

	@Mutation(() => Product)
	@Authorized([UserRole.ADMIN])
	async createProduct(
		@Arg("name") name: string,
		@Arg("description") description: string,
		@Arg("price") price: number,
		@Arg("inventory") inventory: number,
		@Arg("categoryId", () => ID) categoryId: string
	): Promise<Product> {
		const product = this.productRepository.create({
			name,
			description,
			price,
			inventory,
			category: { id: categoryId },
		});

		return this.productRepository.save(product);
	}

	@Mutation(() => Product)
	@Authorized([UserRole.ADMIN])
	async updateProduct(
		@Arg("id", () => ID) id: string,
		@Arg("name", { nullable: true }) name?: string,
		@Arg("description", { nullable: true }) description?: string,
		@Arg("price", { nullable: true }) price?: number,
		@Arg("inventory", { nullable: true }) inventory?: number,
		@Arg("categoryId", () => ID, { nullable: true }) categoryId?: string
	): Promise<Product> {
		const product = await this.productRepository.findOne({
			where: { id },
		});
		if (!product) throw new Error("Product not found");

		if (name) product.name = name;
		if (description) product.description = description;
		if (price) product.price = price;
		if (inventory) product.inventory = inventory;
		if (categoryId) product.category = { id: categoryId } as any;

		return this.productRepository.save(product);
	}

	@Mutation(() => Boolean)
	@Authorized([UserRole.ADMIN])
	async deleteProduct(@Arg("id", () => ID) id: string): Promise<boolean> {
		const product = await this.productRepository.findOne({
			where: { id },
		});
		if (!product) throw new Error("Product not found");

		await this.productRepository.remove(product);
		return true;
	}
}

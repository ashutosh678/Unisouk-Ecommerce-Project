import { Resolver, Query, Mutation, Arg, ID, Authorized } from "type-graphql";
import { Product } from "../../models/product.model";
import { AppDataSource } from "../../config/database";
import { UserRole } from "../../models/user.model";
import { ProductInput } from "../../validators/product.input";
import { validateOrReject } from "class-validator";

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
	async createProduct(@Arg("data") data: ProductInput): Promise<Product> {
		await validateOrReject(data);
		const product = this.productRepository.create({
			name: data.name,
			description: data.description,
			price: data.price,
			inventory: data.inventory,
			category: { id: data.categoryId },
		});
		return this.productRepository.save(product);
	}

	@Mutation(() => Product)
	@Authorized([UserRole.ADMIN])
	async updateProduct(
		@Arg("id", () => ID) id: string,
		@Arg("data") data: ProductInput
	): Promise<Product> {
		await validateOrReject(data);
		const product = await this.productRepository.findOne({
			where: { id },
		});
		if (!product) throw new Error("Product not found");
		product.name = data.name;
		product.description = data.description;
		product.price = data.price;
		product.inventory = data.inventory;
		product.category = { id: data.categoryId } as any;
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

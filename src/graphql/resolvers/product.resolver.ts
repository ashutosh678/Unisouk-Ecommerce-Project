import {
	Resolver,
	Query,
	Mutation,
	Arg,
	ID,
	Authorized,
	FieldResolver,
	Root,
} from "type-graphql";
import { Product } from "../../models/product.model";
import { AppDataSource } from "../../config/database";
import { UserRole } from "../../models/user.model";
import { ProductInput } from "../../validators/product.input";
import { validateOrReject } from "class-validator";
import { Category } from "../../models/category.model";
import { Between, MoreThanOrEqual, LessThanOrEqual } from "typeorm";

@Resolver(Product)
export class ProductResolver {
	private productRepository = AppDataSource.getRepository(Product);

	@Query(() => [Product])
	async products(
		@Arg("categoryId", () => ID, { nullable: true }) categoryId?: string,
		@Arg("minPrice", () => Number, { nullable: true }) minPrice?: number,
		@Arg("maxPrice", () => Number, { nullable: true }) maxPrice?: number
	): Promise<Product[]> {
		const where: any = {};
		if (categoryId) where.category = { id: categoryId };
		if (minPrice !== undefined && maxPrice !== undefined) {
			where.price = Between(minPrice, maxPrice);
		} else if (minPrice !== undefined) {
			where.price = MoreThanOrEqual(minPrice);
		} else if (maxPrice !== undefined) {
			where.price = LessThanOrEqual(maxPrice);
		}
		return this.productRepository.find({
			where,
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

		// Load the category to ensure it exists
		const category = await this.productRepository.manager.findOne(Category, {
			where: { id: data.categoryId },
		});
		if (!category) throw new Error("Category not found");

		// Create the product with the loaded category
		const product = this.productRepository.create({
			name: data.name,
			description: data.description,
			price: data.price,
			inventory: data.inventory,
			category: category,
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

	@FieldResolver(() => Category)
	async category(@Root() product: Product): Promise<Category> {
		const category = await this.productRepository.manager.findOne(Category, {
			where: { id: product.category.id },
		});
		if (!category) throw new Error("Category not found");
		return category;
	}
}

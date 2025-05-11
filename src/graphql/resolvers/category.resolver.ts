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
import { Category } from "../../models/category.model";
import { AppDataSource } from "../../config/database";
import { UserRole } from "../../models/user.model";
import { CategoryInput } from "../../validators/category.input";
import { validateOrReject } from "class-validator";
import { Product } from "../../models/product.model";

@Resolver(Category)
export class CategoryResolver {
	private categoryRepository = AppDataSource.getRepository(Category);

	@FieldResolver(() => [Product])
	async products(@Root() category: Category): Promise<Product[]> {
		return this.categoryRepository.manager.find(Product, {
			where: { category: { id: category.id } },
		});
	}

	@Query(() => [Category])
	async categories(): Promise<Category[]> {
		return this.categoryRepository.find();
	}

	@Query(() => Category)
	async category(@Arg("id", () => ID) id: string): Promise<Category> {
		const category = await this.categoryRepository.findOne({
			where: { id },
		});
		if (!category) throw new Error("Category not found");
		return category;
	}

	@Mutation(() => Category)
	@Authorized([UserRole.ADMIN])
	async createCategory(@Arg("data") data: CategoryInput): Promise<Category> {
		await validateOrReject(data);
		const category = this.categoryRepository.create({
			name: data.name,
			description: data.description,
		});
		return this.categoryRepository.save(category);
	}

	@Mutation(() => Category)
	@Authorized([UserRole.ADMIN])
	async updateCategory(
		@Arg("id", () => ID) id: string,
		@Arg("data") data: CategoryInput
	): Promise<Category> {
		await validateOrReject(data);
		const category = await this.categoryRepository.findOne({
			where: { id },
		});
		if (!category) throw new Error("Category not found");
		category.name = data.name;
		category.description = data.description;
		return this.categoryRepository.save(category);
	}

	@Mutation(() => Boolean)
	@Authorized([UserRole.ADMIN])
	async deleteCategory(@Arg("id", () => ID) id: string): Promise<boolean> {
		const category = await this.categoryRepository.findOne({
			where: { id },
		});
		if (!category) throw new Error("Category not found");

		await this.categoryRepository.remove(category);
		return true;
	}
}

import { Resolver, Query, Mutation, Arg, ID, Authorized } from "type-graphql";
import { Category } from "../../models/category.model";
import { AppDataSource } from "../../config/database";
import { UserRole } from "../../models/user.model";

@Resolver(Category)
export class CategoryResolver {
	private categoryRepository = AppDataSource.getRepository(Category);

	@Query(() => [Category])
	async categories(): Promise<Category[]> {
		return this.categoryRepository.find({
			relations: ["products"],
		});
	}

	@Query(() => Category)
	async category(@Arg("id", () => ID) id: string): Promise<Category> {
		const category = await this.categoryRepository.findOne({
			where: { id },
			relations: ["products"],
		});
		if (!category) throw new Error("Category not found");
		return category;
	}

	@Mutation(() => Category)
	@Authorized([UserRole.ADMIN])
	async createCategory(
		@Arg("name") name: string,
		@Arg("description") description: string
	): Promise<Category> {
		const category = this.categoryRepository.create({
			name,
			description,
		});

		return this.categoryRepository.save(category);
	}

	@Mutation(() => Category)
	@Authorized([UserRole.ADMIN])
	async updateCategory(
		@Arg("id", () => ID) id: string,
		@Arg("name", { nullable: true }) name?: string,
		@Arg("description", { nullable: true }) description?: string
	): Promise<Category> {
		const category = await this.categoryRepository.findOne({
			where: { id },
		});
		if (!category) throw new Error("Category not found");

		if (name) category.name = name;
		if (description) category.description = description;

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

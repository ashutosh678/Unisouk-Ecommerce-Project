import { Request } from "express";

export interface Context {
	req: Request & {
		user?: {
			id: string;
			role: string;
		};
	};
	user?: {
		id: string;
		role: string;
	};
}

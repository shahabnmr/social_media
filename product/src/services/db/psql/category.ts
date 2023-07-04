import Dbservice from '../common/postgres/db.service';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError, DatabaseConnectionError, NotFoundError } from '@sn_common/common';

interface Category {
	id?: string;
	name: string;
	version: number;
	createddate?: Date;
	updateddate?: Date;
}

export class CategoryService {
	static instance: CategoryService | null;
	db: any;
	serviceName: string;
	client: any;

	constructor() {
		this.serviceName = 'CATEGORY_SERVICE';
		return this;
	}

	async init() {
		this.db = await Dbservice.getInstance();
		this.client = await this.db.getClient();
	}

	static async getInstance() {
		if (!CategoryService.instance) {
			try {
				CategoryService.instance = new CategoryService();
				await CategoryService.instance.init();
			} catch (error) {
				CategoryService.instance = null;
				throw new DatabaseConnectionError();
			}
		}
		return CategoryService.instance;
	}

	async insert(name: string): Promise<string> {
		const categoryId = uuidv4();
		await this.client.query('CALL insert_category($1,$2)', [categoryId, name]);

		return categoryId;
	}

	async findOne(id: string, name: string): Promise<Category> {
		const category = await this.client.query('SELECT * FROM findOneCategory($1,$2)', [id, name]);

		return category.rows[0];
	}

	async end() {
		await this.client.end();
	}
}

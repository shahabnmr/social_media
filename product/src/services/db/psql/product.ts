import Dbservice from '../common/postgres/db.service';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnectionError, NotFoundError } from '@sn_common/common';
import { Color } from './color';

export interface Product {
	id?: string;
	name: string;
	description: string;
	images: string[];
	updateddate?: string;
	createddate?: string;
	price: string;
	version?: number;
	colors: Color[];
}

export class ProductService {
	static instance: ProductService | null;
	db: any;
	serviceName: string;
	client: any;

	constructor() {
		this.serviceName = 'PRODUCT_SERVICE';
		return this;
	}

	async init() {
		this.db = await Dbservice.getInstance();
		this.client = await this.db.getClient();
	}

	static async getInstance() {
		if (!ProductService.instance) {
			try {
				ProductService.instance = new ProductService();
				await ProductService.instance.init();
			} catch (error) {
				ProductService.instance = null;
				throw new DatabaseConnectionError();
			}
		}
		return ProductService.instance;
	}

	async insertProduct(product: Product): Promise<string> {
		product.id = uuidv4();
		await this.client.query('CALL insert_product($1,$2,$3,$4,$5)', [
			product.id,
			product.name,
			product.description,
			product.images,
			product.price,
		]);
		return product.id;
	}

	async findOneProductAllInfo(productId: string, name: string): Promise<Product> {
		let result = await this.client.query('select * from findOneProductAllInfo($1,$2)', [
			productId,
			name,
		]);
		if (result.rows[0]) result.rows[0].colors = JSON.parse(result.rows[0].colors);

		return result.rows[0];
	}

	async findOneProduct(productId: string, name: string): Promise<Product> {
		let result = await this.client.query('select * from findOneProductAllInfo($1,$2)', [
			productId,
			name,
		]);

		return result.rows[0];
	}
}

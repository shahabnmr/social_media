import Dbservice from '../common/postgres/db.service';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError, DatabaseConnectionError, NotFoundError } from '@sn_common/common';

export interface Brand {
	id?: string;
	name: string;
	description: string;
	createddate?: Date;
	updateddate?: Date;
}

export class BrandService {
	static instance: BrandService | null;
	db: any;
	serviceName: string;
	client: any;

	constructor() {
		this.serviceName = 'BRAND_SERVICE';
		return this;
	}

	async init() {
		this.db = await Dbservice.getInstance();
		this.client = await this.db.getClient();
	}

	static async getInstance() {
		if (!BrandService.instance) {
			try {
				BrandService.instance = new BrandService();
				await BrandService.instance.init();
			} catch (error) {
				BrandService.instance = null;
				throw new DatabaseConnectionError();
			}
		}
		return BrandService.instance;
	}

	async insert(brand: Brand): Promise<string> {
		const brandId = uuidv4();
		await this.client.query('CALL insert_brand($1,$2,$3)', [
			brandId,
			brand.name,
			brand.description,
		]);
		return brandId;
	}

	async findOne(id: string, name: string): Promise<Brand> {
		const color = await this.client.query('SELECT * FROM findOneBrand($1,$2)', [id, name]);
		return color.rows[0];
	}

	async findBrands(): Promise<Brand[]> {
		const color = await this.client.query('SELECT * FROM findBrands()', []);
		return color.rows;
	}

	async findOneBrandInSubCategory(subCategoryId: string, brandId: string): Promise<boolean> {
		const result = await this.client.query('SELECT * from findOneBrandInSubCategory($1,$2)', [
			subCategoryId,
			brandId,
		]);

		if (result.rows.length > 0) {
			return true;
		} else return false;
	}

	async findBrandsInSubCategory(subCategoryId: string): Promise<boolean> {
		const result = await this.client.query('SELECT * from findOneBrandInSubCategory($1)', [
			subCategoryId,
		]);

		return result.rows;
	}

	async insertBrandstoSubCategory(subCategoryId: string, brands: string[]) {
		const id = uuidv4();
		await this.client.query('CALL insert_brandsForSubCategory($1,$2,$3)', [
			id,
			subCategoryId,
			brands,
		]);
	}

	async checkBrands(brands: string[]): Promise<string> {
		const result = await this.client.query('SELECT * FROM checkBrands($1)', [brands]);
		return result.rows[0].checkbrands;
	}

	async end() {
		await this.client.end();
	}
}

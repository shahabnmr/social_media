import Dbservice from '../common/postgres/db.service';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError, DatabaseConnectionError, NotFoundError } from '@sn_common/common';

export interface ColorOfProduct {
	id?: string;
	color_id: string;
	product_id: string;
	amount: number;
}

export interface Color {
	id?: string;
	name: string;
	code_color: string;
	amount: number;
	createddate?: Date;
	updateddate?: Date;
}

export class ColorService {
	static instance: ColorService | null;
	db: any;
	serviceName: string;
	client: any;

	constructor() {
		this.serviceName = 'COLOR_SERVICE';
		return this;
	}

	async init() {
		this.db = await Dbservice.getInstance();
		this.client = await this.db.getClient();
	}

	static async getInstance() {
		if (!ColorService.instance) {
			try {
				ColorService.instance = new ColorService();
				await ColorService.instance.init();
			} catch (error) {
				ColorService.instance = null;
				throw new DatabaseConnectionError();
			}
		}
		return ColorService.instance;
	}

	async insert(name: string, code_color: string): Promise<string> {
		const colorId = uuidv4();
		await this.client.query('CALL insert_color($1,$2,$3)', [colorId, name, code_color]);
		return colorId;
	}

	async colorOfProduct(colorOfProduct: ColorOfProduct): Promise<string> {
		colorOfProduct.id = uuidv4();
		const colorOfProduct_exist = await this.client.query(
			'select * from findOneColorOfProduct($1,$2)',
			[colorOfProduct.color_id, colorOfProduct.product_id],
		);
		if (colorOfProduct_exist.rows[0])
			throw new BadRequestError(
				`this product ${colorOfProduct.product_id} with this color ${colorOfProduct.color_id} already exist.`,
			);
		await this.client.query('CALL insert_colorOfProduct($1,$2,$3,$4)', [
			colorOfProduct.id,
			colorOfProduct.color_id,
			colorOfProduct.product_id,
			colorOfProduct.amount,
		]);
		return colorOfProduct.id;
	}

	async findOne(id: string, name: string, code_color: string): Promise<Color> {
		const color = await this.client.query('SELECT * FROM findOneColor($1,$2,$3)', [
			id,
			name,
			code_color,
		]);
		return color.rows[0];
	}

	async end() {
		await this.client.end();
	}
}

import Dbservice from '../common/postgres/db.service';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnectionError } from '@sn_common/common';

export interface SubCategory {
	id?: string;
	name: string;
	category_id: string;
	createddate?: Date;
	updateddate?: Date;
	category_name?: string;
}

export interface Field {
	id?: string;
	name: string;
	type: string;
	metadata?: string;
}

export interface FieldsForSubCategory {
	subCategory_id: string;
	field_ids: string[];
}

export class SubCategoryService {
	static instance: SubCategoryService | null;
	db: any;
	serviceName: string;
	client: any;

	constructor() {
		this.serviceName = 'SUB_CATEGORY_SERVICE';
		return this;
	}

	async init() {
		this.db = await Dbservice.getInstance();
		this.client = await this.db.getClient();
	}

	static async getInstance() {
		if (!SubCategoryService.instance) {
			try {
				SubCategoryService.instance = new SubCategoryService();
				await SubCategoryService.instance.init();
			} catch (error) {
				SubCategoryService.instance = null;
				throw new DatabaseConnectionError();
			}
		}
		return SubCategoryService.instance;
	}

	async insert(subCategory: SubCategory): Promise<string> {
		const subCategoryId = uuidv4();
		await this.client.query('CALL insert_sub_category($1,$2,$3)', [
			subCategoryId,
			subCategory.name,
			subCategory.category_id,
		]);
		return subCategoryId;
	}

	async findOne(id: string, name: string): Promise<SubCategory> {
		const sub_category = await this.client.query('SELECT * FROM findOneSubCategory($1,$2)', [
			id,
			name,
		]);
		return sub_category.rows[0];
	}

	async findSubCategoriesOfCategory(
		categoryId: string,
		category_name: string,
	): Promise<SubCategory[]> {
		const sub_category = await this.client.query(
			'SELECT * FROM findSubCategoriesOfCategory($1,$2)',
			[categoryId, category_name],
		);
		return sub_category.rows;
	}

	async findOneField(fieldId: string, name: string): Promise<Field> {
		const result = await this.client.query('SELECT * FROM findOneField($1,$2)', [fieldId, name]);
		return result.rows[0];
	}

	async insertField(field: Field): Promise<string> {
		const fieldId = uuidv4();
		await this.client.query('CALL insert_field($1,$2,$3,$4)', [
			fieldId,
			field.name,
			field.type,
			field.metadata,
		]);

		return fieldId;
	}

	async findFields(): Promise<Field[]> {
		const result = await this.client.query('SELECT * FROM findFields()');

		return result.rows;
	}

	async insertFieldsForSubCategory(fieldsForSubCategory: FieldsForSubCategory): Promise<object> {
		await this.client.query('CALL insert_fieldsForSubCategory($1,$2)', [
			fieldsForSubCategory.subCategory_id,
			fieldsForSubCategory.field_ids,
		]);

		return { message: 'success insert Fields' };
	}

	async findFieldsOfSubCategory(subCategoryId: string, subCategoryName: string): Promise<Field[]> {
		const result = await this.client.query('SELECT * FROM findFieldsOfSubCategory($1,$2)', [
			subCategoryId,
			subCategoryName,
		]);

		return result.rows;
	}

	async checkFieldsOfSubCategory(subCategoryId: string, fields: string): Promise<object[]> {
		const result = await this.client.query('SELECT * FROM checkFieldsOfSubCategory($1,$2)', [
			subCategoryId,
			fields,
		]);

		return result.rows;
	}

	async end() {
		await this.client.end();
	}
}

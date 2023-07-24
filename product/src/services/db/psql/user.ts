import Dbservice from '../common/postgres/db.service';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestError, DatabaseConnectionError, NotFoundError, Roll } from '@sn_common/common';

interface User {
	id?: string;
	email: string;
	version: number;
	status: boolean;
	roll?: Roll;
	createddate?: Date;
	updateddate?: Date;
}

export class UserService {
	static instance: UserService | null;
	db: any;
	serviceName: string;
	client: any;

	constructor() {
		this.serviceName = 'USER_SERVICE';
		return this;
	}

	async init() {
		this.db = await Dbservice.getInstance();
		this.client = await this.db.getClient();
	}

	static async getInstance() {
		if (!UserService.instance) {
			try {
				UserService.instance = new UserService();
				await UserService.instance.init();
			} catch (error) {
				UserService.instance = null;
				throw new DatabaseConnectionError();
			}
		}
		return UserService.instance;
	}

	async insert(user: User): Promise<string> {
		user.id = uuidv4();
		await this.client.query('CALL insert_user($1,$2,$3,$4)', [
			user.id,
			user.email,
			user.status,
			user.version,
		]);

		return user.id;
	}

	async findOne(id: string, email: string): Promise<User> {
		const user = await this.client.query('SELECT * FROM findOneUser($1,$2)', [id, email]);

		return user.rows[0];
	}

	async update(email: string, status: boolean, version: number) {
		const user = await this.client.query('SELECT * FROM update_user($1,$2,$3)', [
			email,
			status,
			version,
		]);

		return user.rows[0].update_user;
	}

	async updateRoll(email: string, roll: Roll, version: number): Promise<string> {
		const result = await this.client.query('SELECT * FROM update_user_roll($1,$2,$3)', [
			email,
			roll,
			version,
		]);

		return result.rows[0].update_user_roll;
	}

	async end() {
		await this.client.end();
	}
}

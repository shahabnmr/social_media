import Dbservice from '../common/postgres/db.service';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnectionError } from '@sn_common/common';
import { Password } from '../../password/password';

interface User {
	id: string;
	email: string;
	tell: string;
	name: string;
	family: string;
	password: string;
}

interface Otp {
	id: string;
	userId: string;
	otp: string;
	expiration_time: string;
	active: boolean;
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

	async findOne(email: string, tell: string, id: string): Promise<User> {
		const result = await this.client.query(
			'select id,email,tell,name,family,password from findOne_user($1,$2,$3)',
			[email, tell, id],
		);

		return result.rows[0];
	}

	async insertUser(
		name: string,
		family: string,
		tell: string,
		email: string,
		password: string,
	): Promise<string> {
		const hashed = await Password.toHash(password);
		const userId = uuidv4();
		await this.client.query('CALL insert_user($1,$2,$3,$4,$5,$6)', [
			userId,
			name,
			family,
			tell,
			email,
			hashed,
		]);
		return userId;
	}

	async updateUser(
		id: string,
		name: string,
		family: string,
		tell: string,
		email: string,
	): Promise<string> {
		await this.client.query('CALL update_user($1,$2,$3,$4,$5)', [id, name, family, tell, email]);
		return id;
	}

	async updateVersionUser(idOrEmail: string): Promise<number> {
		const version = await this.client.query('SELECT * FROM update_version_user($1)', [idOrEmail]);
		console.log(version.rows);

		return version.rows[0].update_version_user;
	}

	async resetPassword(id: string, password: string): Promise<string> {
		const hashed = await Password.toHash(password);
		await this.client.query('CALL reset_pass($1,$2)', [id, hashed]);
		return id;
	}

	async createOtp(otp: string, expiration_time: Date, userId: string): Promise<string> {
		const id = uuidv4();
		await this.client.query('CALL insert_otp($1,$2,$3,$4)', [id, otp, expiration_time, userId]);

		return id;
	}

	async findOneOtp(id: string, userId: string): Promise<Otp> {
		const result = await this.client.query('select * from findOne_otp($1,$2)', [id, userId]);
		return result.rows[0];
	}

	async updateOtp(id: string, value: boolean): Promise<Otp> {
		const result = await this.client.query('CALL update_otp($1,$2)', [id, value]);

		return result;
	}

	async deleteOtpUnused(id: string) {
		const result = await this.client.query('CALL delete_otp($1)', [id]);

		return result;
	}

	async deleteUser(email: string) {
		await this.client.query('CALL delete_user($1)', [email]);
	}

	async deleteOtp(id: string) {
		await this.client.query('CALL delete_otp_id($1)', [id]);
	}
}

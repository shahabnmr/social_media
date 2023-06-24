import pg, { Pool as typePool } from 'pg';

import sanitizedConfig from '../../../../config';

const { Pool } = pg;

class Dbservice {
	static instance: Dbservice | null;
	static pool: typePool;
	pguser;
	pgPassword;
	pgHost;
	pgPort;
	pgDb;

	constructor() {
		if (Dbservice.instance) {
			return Dbservice.instance;
		}

		this.pguser = sanitizedConfig.USER_PG;
		this.pgPassword = sanitizedConfig.PSQL_PASS;
		this.pgHost = sanitizedConfig.HOST_PG;
		this.pgPort = sanitizedConfig.PORT_PG;
		this.pgDb = sanitizedConfig.DB_PG;
		return this;
	}

	async init() {
		console.log('creating db service');
			Dbservice.pool = new Pool({
				user: this.pguser,
				password: this.pgPassword,
				database: this.pgDb,
				host: this.pgHost,
				port: this.pgPort,
			});
	}

	async getClient() {
		try {
			console.log('trying connect Pool');
			const client = await Dbservice.pool.connect();
			return client;
		} catch (error) {
			console.log('Error while trying to connect: ', { error });
			throw error;
		}
	}

	static async getInstance() {
		if (!Dbservice.instance) {
			try {
				Dbservice.instance = new Dbservice();
				await Dbservice.instance.init();
			} catch (error) {
				Dbservice.instance = null;
				throw error;
			}
		}

		return Dbservice.instance;
	}

	async end() {
		await Dbservice.pool.end();
	}
}
export default Dbservice;

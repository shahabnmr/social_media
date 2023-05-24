import path from 'path';
import dotenv from 'dotenv';
import yargs from 'yargs';

dotenv.config({ path: path.resolve(__dirname, '../config/.env') });

interface ENV {
	NODE_ENV: string | undefined;
	PORT: number | undefined;
	USER_PG: string | undefined;
	PSQL_PASS: string | undefined;
	HOST_PG: string | undefined;
	PORT_PG: number | undefined;
	DB_PG: string | undefined;
	JWT_KEY: string | undefined;
	CRYPT_PASSWORD: string | undefined;
	IV: string | undefined;
}

interface Config {
	NODE_ENV: string;
	PORT: number;
	USER_PG: string;
	PSQL_PASS: string;
	HOST_PG: string;
	PORT_PG: number;
	DB_PG: string;
	JWT_KEY: string;
	CRYPT_PASSWORD: string;
	IV: string;
}

// Loading process.env as ENV interface

const getConfig = (): ENV => {
	const options = yargs(process.argv)
		.option('p', { alias: 'port', describe: 'port for app', type: 'number' })
		.option('u', { alias: 'username', describe: 'username for connecting to postgres', type: 'string' })
		.option('s', { alias: 'secret', describe: 'password to connect to postgres', type: 'string' })
		.option('h', { alias: 'hostpsql', describe: 'host for postgres', type: 'string' })
		.option('q', { alias: 'portpsql', describe: 'port for postgres', type: 'number' })
		.option('d', { alias: 'dbpsql', describe: 'db for postgres', type: 'string' })
		.option('j', { alias: 'jwt', describe: 'jwt secret', type: 'string' })
		.option('c', { alias: 'cryptpass', describe: 'crypt_password', type: 'string' })
		.option('i', { alias: 'iv', describe: 'iv for crypt password', type: 'string' })
		.parseSync();

	if (process.env.NODE_ENV === 'prod') {
		return {
			NODE_ENV: process.env.NODE_ENV,
			PORT: options.p,
			DB_PG: options.d,
			HOST_PG: options.h,
			PSQL_PASS: options.s,
			PORT_PG: options.q,
			USER_PG: options.u,
			JWT_KEY: options.j,
			CRYPT_PASSWORD: options.c,
			IV: options.i,
		};
	}
	return {
		NODE_ENV: process.env.NODE_ENV,
		PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
		DB_PG: process.env.DB_PG,
		HOST_PG: process.env.HOST_PG,
		PSQL_PASS: process.env.PSQL_PASS,
		PORT_PG: process.env.PORT_PG ? Number(process.env.PORT_PG) : undefined,
		USER_PG: process.env.USER_PG,
		JWT_KEY: process.env.JWT_KEY,
		CRYPT_PASSWORD: process.env.CRYPT_PASSWORD,
		IV: process.env.IV,
	};
};

const getSanitzedConfig = (config: ENV): Config => {
	for (const [key, value] of Object.entries(config)) {
		if (value === undefined) {
			throw new Error(`Missing key ${key} in config.env`);
		}
	}
	return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;

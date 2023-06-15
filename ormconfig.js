require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const fs = require('fs');
const argvs = require('yargs').argv;

if (argvs.c === 'seed' && !fs.existsSync(`scripts/seeds/${argvs._[1]}.ts`)) {
  throw new Error('Seed file not found')
}

const options = {
	type: 'postgres',
	host: process.env.TYPEORM_HOST,
	port: parseInt(process.env.TYPEORM_PORT, 10) || 5432,
	username: process.env.TYPEORM_USERNAME,
	password: process.env.TYPEORM_PASSWORD,
	database: process.env.TYPEORM_DATABASE,
  logging: ['query', 'error'],
  logger: 'advanced-console',
  entities: ['src/**/*.entity.ts'],
  options: {
    encrypt: false,
    enableArithAbort: false,
  },
  synchronize: false,
};

// Because tedious always use an env var rather than the above config and there
// is bug with the mssql driver that cannot interpret the port to type number
// Thus need to delete those variables
for (const key of Object.keys(process.env)) {
  if (key.startsWith('TYPEORM')) {
    delete process.env[key];
  }
}

module.exports = [
  {
    name: 'default',
    migrations: ['scripts/migrations/*.ts'],
    cli: {
      migrationsDir: 'scripts/migrations',
    },
    ...options,
  },
  {
    name: 'seed',
    migrationsTableName: 'seeds',
    migrations: [`scripts/seeds/${argvs._[1]}.ts`],
    cli: {
      migrationsDir: 'scripts/seeds',
    },
    ...options,
  }
];
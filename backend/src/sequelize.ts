import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Check that all required environment variables are defined
if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_HOST || !process.env.DB_PORT) {
  throw new Error('One or more environment variables are undefined');
}

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string), 
  dialect: 'postgres',
  logging: false,
});

export default sequelize;
   
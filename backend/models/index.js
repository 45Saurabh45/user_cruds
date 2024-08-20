const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'mysql',
  logging: console.log
});

const User = require('./user')(sequelize);

const db = {
  sequelize,
  User,
  // other models
};

module.exports = db;

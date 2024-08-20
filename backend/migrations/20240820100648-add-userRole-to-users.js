'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'userRole', {
      type: Sequelize.STRING,
      allowNull: true // or `false` if it should be required
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'userRole');
  }
};

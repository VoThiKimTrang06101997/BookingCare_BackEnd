'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      email: 'admin@gmail.com',
      password: '123456',     // Plain Text
      firstName: 'Võ Thị',
      lastName: 'Kim Trang',
      address: '123 ABC Street',
      gender: 0,
      image: '',
      roleId: 2,
      positionId: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};

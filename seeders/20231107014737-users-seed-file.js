'use strict'
/** @type {import('sequelize-cli').Migration} */
const bcrypt = require('bcryptjs')
const faker = require('faker')

const Users = [{
  email: 'root@example.com.tw',
  password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10)),
  role: 'admin',
  name: 'root',
  account: 'root',
  created_at: new Date(),
  updated_at: new Date()
}]

const numUsers = 5
for (let i = 1; i <= numUsers; i++) {
  const introLength = 160
  const user = {
    email: `user${i}@example.com`,
    password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10)),
    role: 'user',
    name: `user${i}`,
    account: `user${i}`,
    introduction: faker.lorem.text().slice(0, introLength),
    created_at: new Date(),
    updated_at: new Date()
  }
  Users.push(user)
}


module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', Users, {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {})
  }
}

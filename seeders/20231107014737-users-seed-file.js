'use strict'
/** @type {import('sequelize-cli').Migration} */
const bcrypt = require('bcryptjs')
const faker = require('faker')

// 建立 User: root * 1, user * 10
const Users = [{
  avatar: `https://loremflickr.com/480/320/kitten/?random=${Math.random() * 100}`,
  email: 'root@example.com.tw',
  password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10)),
  role: 'admin',
  name: 'root',
  account: 'root',
  created_at: new Date(),
  updated_at: new Date()
}]

const numUsers = 10
for (let i = 1; i <= numUsers; i++) {
  const introLength = 150
  const user = {
    avatar: `https://loremflickr.com/480/320/kitten/?random=${Math.random() * 100}`,
    email: `user${i}@example.com`,
    password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10)),
    role: 'user',
    name: faker.name.firstName(),
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

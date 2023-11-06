'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      account: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      avatar: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: "https://i.imgur.com/hepj9ZS_d.webp?maxwidth=760&fidelity=grand"
      },
      introduction: {
        type: Sequelize.TEXT
      },
      role: {
        type: Sequelize.STRING
      },
      cover: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: "https://i.imgur.com/yLZPe7q.jpg"
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users')
  }
}
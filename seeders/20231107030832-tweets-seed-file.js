'use strict'
/** @type {import('sequelize-cli').Migration} */

const faker = require('faker')
const { User } = require('../models')


const getUsers = async() => {
  try {
    const Users = await User.findAll({
      raw: true,
      nest: true
    })
    return Users
  } catch (err) {
    console.log(err)
  } 
}

module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      const Tweets = []
      const Users = await getUsers()
      const perUserTweets = 10

      Users.forEach(user => {
        const maxLength = 160
        for (let i = 0; i < perUserTweets; i++) {
          let tweet = {
            user_id: user.id,
            description: faker.lorem.text().slice(0, maxLength),
            created_at: new Date(),
            updated_at: new Date()
          }
          Tweets.push(tweet)
        }
      })
      queryInterface.bulkInsert('Tweets', Tweets, {})

    } catch(err) {
      console.log(err)
    }
  },

  async down (queryInterface, Sequelize) {
    queryInterface.bulkDelete('Tweets', {})
  }
}

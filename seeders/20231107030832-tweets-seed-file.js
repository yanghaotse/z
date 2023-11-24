'use strict'
/** @type {import('sequelize-cli').Migration} */

const faker = require('faker')
const { User } = require('../models')

// 每個使用者10篇 tweet
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      const users = await User.findAll({ raw: true, nest:true })
      const tweets = []
      const tweetPerUser = 5

      users.forEach(user => {
        const maxLength = 160
        for (let i = 0; i < tweetPerUser; i++) {
          let tweet = {
            user_id: user.id,
            description: faker.lorem.text().slice(0, maxLength),
            image: `https://loremflickr.com/1280/720/cat/?random=${Math.random() * 100}`,
            created_at: new Date(),
            updated_at: new Date()
          }
          tweets.push(tweet)
        }
      })
      await queryInterface.bulkInsert('Tweets', tweets, {})

    } catch(err) {
      console.log(err)
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tweets', {})
  }
}
